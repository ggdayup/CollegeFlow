import os
import json
import subprocess
from celery_app import celery_app
from parser import prune_html
from gemini_parser import parse_curriculum_text

def update_local_task_status(task_id: str, state: str, progress: int, message: str, result: dict = None):
    """
    Saves the task state and progress details to a local JSON file
    under backend/data/tasks/{task_id}.json. Enables direct polling
    independent of Redis/Celery worker process presence.
    """
    tasks_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "tasks")
    os.makedirs(tasks_dir, exist_ok=True)
    status_file = os.path.join(tasks_dir, f"{task_id}.json")
    
    payload = {
        "task_id": task_id,
        "state": state,
        "progress": progress,
        "message": message
    }
    if result:
        payload["result"] = result
        
    with open(status_file, "w") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

@celery_app.task(bind=True)
def crawl_and_parse_curriculum_task(self, url: str, association_id: str):
    """
    Celery task that executes Scrapy to crawl curriculum HTML pages,
    filters/prunes raw markup, calls Gemini LLM parser with google-genai,
    saves the parsed output, and updates progress states dynamically.
    """
    task_id = self.request.id if self.request else "local_task"
    run_pipeline(task_id, url, association_id, celery_task=self)

def run_pipeline(task_id: str, url: str, association_id: str, celery_task=None):
    """
    Core pipeline logic shared between Celery tasks and direct FastAPI BackgroundTasks.
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. Update State: CONNECTED (Spider starting)
    msg = f"Connecting to university registrar page: {url}"
    update_local_task_status(task_id, "CONNECTED", 20, msg)
    if celery_task:
        celery_task.update_state(state="CONNECTED", meta={"progress": 20, "message": msg})
        
    # Output file paths
    crawls_dir = os.path.join(current_dir, "data", "crawls")
    os.makedirs(crawls_dir, exist_ok=True)
    crawl_output = os.path.join(crawls_dir, f"{task_id}.json")
    
    # Run Scrapy spider as an isolated subprocess
    spider_script = os.path.join(current_dir, "spiders", "catalog_spider.py")
    scrapy_cmd = [
        "python3", "-m", "scrapy", "runspider", spider_script,
        "-a", f"start_url={url}",
        "-o", crawl_output
    ]
    
    # Set execution environment to point to backend venv
    env = os.environ.copy()
    venv_bin = os.path.join(current_dir, "venv", "bin")
    env["PATH"] = f"{venv_bin}:{env.get('PATH', '')}"
    
    try:
        # Run Scrapy spider with 60 second timeout
        result = subprocess.run(scrapy_cmd, env=env, capture_output=True, text=True, timeout=60)
        if result.returncode != 0:
            error_msg = f"Scrapy crawl failed with exit code {result.returncode}: {result.stderr or result.stdout}"
            update_local_task_status(task_id, "FAILED", 100, error_msg)
            return {"status": "FAILED", "error": error_msg}
    except subprocess.TimeoutExpired:
        error_msg = "Scrapy crawl timed out after 60 seconds."
        update_local_task_status(task_id, "FAILED", 100, error_msg)
        return {"status": "FAILED", "error": error_msg}
    except Exception as e:
        error_msg = f"Failed to execute Scrapy spider: {str(e)}"
        update_local_task_status(task_id, "FAILED", 100, error_msg)
        return {"status": "FAILED", "error": error_msg}

    # Verify if crawled content was written
    if not os.path.exists(crawl_output) or os.path.getsize(crawl_output) == 0:
        error_msg = "No HTML content could be scraped from the registrar page."
        update_local_task_status(task_id, "FAILED", 100, error_msg)
        return {"status": "FAILED", "error": error_msg}

    # 2. Update State: PARSING (BeautifulSoup DOM-pruning)
    msg = "Parsing scraped HTML and pruning noisy elements (scripts, styles, navigations)..."
    update_local_task_status(task_id, "PARSING", 50, msg)
    if celery_task:
        celery_task.update_state(state="PARSING", meta={"progress": 50, "message": msg})

    try:
        with open(crawl_output, "r") as f:
            scraped_records = json.load(f)
    except Exception as e:
        error_msg = f"Failed to read Scrapy output file: {str(e)}"
        update_local_task_status(task_id, "FAILED", 100, error_msg)
        return {"status": "FAILED", "error": error_msg}

    # Combine HTML fields across crawled pages
    raw_html_body = ""
    for record in scraped_records:
        raw_html_body += record.get("html", "") + "\n\n"

    # Execute BeautifulSoup pruning to extract semantic text
    clean_text = prune_html(raw_html_body)
    if not clean_text:
        error_msg = "DOM pruning resulted in an empty text body. Unable to parse curriculum."
        update_local_task_status(task_id, "FAILED", 100, error_msg)
        return {"status": "FAILED", "error": error_msg}

    # 3. Update State: GENERATING (Calling Gemini API)
    msg = "Calling Gemini LLM model (gemini-2.5-flash) to structure required courses and credits..."
    update_local_task_status(task_id, "GENERATING", 80, msg)
    if celery_task:
        celery_task.update_state(state="GENERATING", meta={"progress": 80, "message": msg})

    try:
        curriculum_schema = parse_curriculum_text(clean_text)
    except Exception as e:
        error_msg = f"Gemini API structural extraction failed: {str(e)}"
        update_local_task_status(task_id, "FAILED", 100, error_msg)
        return {"status": "FAILED", "error": error_msg}

    # Convert schema to dict
    parsed_curriculum = curriculum_schema.model_dump()

    # 4. Save results to local JSON file
    curriculums_dir = os.path.join(current_dir, "data", "curriculums")
    os.makedirs(curriculums_dir, exist_ok=True)
    result_file = os.path.join(curriculums_dir, f"{association_id}.json")
    
    with open(result_file, "w") as f:
        json.dump(parsed_curriculum, f, indent=2, ensure_ascii=False)

    # Update the UniversityMajorAssociation record with the sourceUrl in the database
    try:
        from matcher import get_connection
        conn = get_connection(register=False)
        try:
            with conn.cursor() as cur:
                cur.execute(
                    '''
                    UPDATE "UniversityMajorAssociation"
                    SET "sourceUrl" = %s
                    WHERE "id" = %s
                    ''',
                    (url, association_id)
                )
            conn.commit()
            print(f"📊 Saved sourceUrl = '{url}' for association ID = '{association_id}' to the database.")
        finally:
            conn.close()
    except Exception as db_err:
        print(f"⚠️ Failed to update sourceUrl in database for association {association_id}: {db_err}")

    # 5. Update State: COMPLETED
    success_msg = f"Successfully parsed curriculum and saved to data/curriculums/{association_id}.json"
    update_local_task_status(task_id, "COMPLETED", 100, success_msg, result=parsed_curriculum)
    if celery_task:
        celery_task.update_state(state="COMPLETED", meta={"progress": 100, "message": success_msg})

    return {
        "status": "COMPLETED",
        "association_id": association_id,
        "result_file": result_file,
        "curriculum": parsed_curriculum
    }

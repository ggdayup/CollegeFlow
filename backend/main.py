import os
import uuid
import json
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Optional

from backend.tasks import run_pipeline, crawl_and_parse_curriculum_task, update_local_task_status

app = FastAPI(
    title="College Major Catalog Crawler API",
    description="Microservice to scrape university catalogs, prune DOM content, and extract structured curricula via Gemini.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CrawlRequest(BaseModel):
    url: str
    association_id: str

class CrawlResponse(BaseModel):
    task_id: str
    state: str
    message: str

class TaskStatusResponse(BaseModel):
    task_id: str
    state: str
    progress: int
    message: str
    result: Optional[dict] = None

@app.post("/curriculum/crawl", response_model=CrawlResponse, status_code=202)
def trigger_curriculum_crawl(request: CrawlRequest, background_tasks: BackgroundTasks):
    """
    Triggers catalog spider in background for the given registrar URL.
    Attempts Celery queue submission first, with standard local BackgroundTasks fallback.
    """
    task_id = str(uuid.uuid4())
    
    # 1. Update initial local task state
    update_local_task_status(
        task_id=task_id,
        state="CONNECTED",
        progress=10,
        message="Queuing catalog parsing pipeline..."
    )
    
    # 2. Run crawl pipeline in self-contained FastAPI background thread
    background_tasks.add_task(run_pipeline, task_id, request.url, request.association_id)
    message = "Crawl pipeline successfully initiated in background thread."
    
    # 3. Optional Celery queue trigger (if Redis broker is connected)
    try:
        crawl_and_parse_curriculum_task.apply_async(
            args=[request.url, request.association_id],
            task_id=f"celery-{task_id}"
        )
    except Exception:
        pass
        
    return CrawlResponse(
        task_id=task_id,
        state="CONNECTED",
        message=message
    )

@app.get("/curriculum/status/{task_id}", response_model=TaskStatusResponse)
def get_task_status(task_id: str):
    """
    Polls the current execution status and parsing results of a crawling task.
    """
    tasks_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "tasks")
    status_file = os.path.join(tasks_dir, f"{task_id}.json")
    
    # If the local state file exists, read it directly (highly reliable)
    if os.path.exists(status_file):
        try:
            with open(status_file, "r") as f:
                task_data = json.load(f)
            return TaskStatusResponse(
                task_id=task_id,
                state=task_data.get("state", "UNKNOWN"),
                progress=task_data.get("progress", 0),
                message=task_data.get("message", ""),
                result=task_data.get("result")
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read task status payload: {str(e)}")
            
    # Try querying Celery directly if state file is not ready yet
    try:
        from celery.result import AsyncResult
        res = AsyncResult(task_id)
        if res.state == "SUCCESS":
            result_payload = res.result
            return TaskStatusResponse(
                task_id=task_id,
                state="COMPLETED",
                progress=100,
                message="Celery task successfully completed.",
                result=result_payload.get("curriculum") if isinstance(result_payload, dict) else None
            )
        elif res.state == "FAILURE":
            return TaskStatusResponse(
                task_id=task_id,
                state="FAILED",
                progress=100,
                message=f"Celery task failed: {str(res.info)}"
            )
        elif res.state in ["PENDING", "STARTED"]:
            return TaskStatusResponse(
                task_id=task_id,
                state="CONNECTED",
                progress=20,
                message="Celery task is pending in queue or started."
            )
    except Exception:
        pass
        
    raise HTTPException(status_code=404, detail="Task ID not found.")

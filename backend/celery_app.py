import os
from celery import Celery
from dotenv import load_dotenv

# Resolve paths
current_dir = os.path.dirname(os.path.abspath(__file__))
workspace_dir = os.path.dirname(current_dir)

# Load environment configurations
load_dotenv(os.path.join(workspace_dir, ".env.local"))
load_dotenv(os.path.join(workspace_dir, ".env"))

redis_url = os.environ.get("REDIS_URL", "redis://127.0.0.1:36379")

# Initialize Celery Application
celery_app = Celery(
    "college_major_crawler",
    broker=redis_url,
    backend=redis_url
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300, # 5 minutes hard limit
)

# Optional: Add tasks automatically if needed
# celery_app.autodiscover_tasks(['backend'])

import time
import os
import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_crawl_and_poll_status_pipeline():
    print("🚀 Starting integration test for catalog crawling pipeline...")
    
    # 1. Trigger the crawl endpoint
    payload = {
        "url": "https://httpbin.org/html",
        "association_id": "test_association_123"
    }
    
    response = client.post("/curriculum/crawl", json=payload)
    assert response.status_code == 202, f"Expected 202 status code, got {response.status_code}"
    
    data = response.json()
    task_id = data.get("task_id")
    print(f"✓ Post triggered successfully. Task ID: {task_id}")
    print(f"✓ Message: {data.get('message')}")
    
    # 2. Poll the status endpoint until completed or failed
    max_retries = 30
    delay = 1
    completed = False
    
    print("⏳ Polling task status (waiting for background crawl & parse completion)...")
    for i in range(max_retries):
        status_res = client.get(f"/curriculum/status/{task_id}")
        assert status_res.status_code == 200, f"Expected 200 status code, got {status_res.status_code}"
        
        status_data = status_res.json()
        state = status_data.get("state")
        progress = status_data.get("progress")
        msg = status_data.get("message")
        
        print(f"  [{i+1}/{max_retries}] State: {state} | Progress: {progress}% | Msg: {msg[:60]}...")
        
        if state == "COMPLETED":
            completed = True
            print("🎉 Pipeline successfully completed parsing!")
            print("Parsed Result Summary:")
            curriculum = status_data.get("result")
            print(f"  Program Name: {curriculum.get('program_name')}")
            print(f"  Total Graduation Credits: {curriculum.get('total_credits')}")
            print(f"  Core Requirements Count: {len(curriculum.get('core_requirements', []))}")
            break
        elif state == "FAILED":
            print(f"❌ Pipeline failed: {status_data.get('message')}")
            break
            
        time.sleep(delay)
        
    assert completed, "Expected task to reach COMPLETED state within polling limits."
    print("🔥 E2E Integration test succeeded flawlessly!")

if __name__ == "__main__":
    test_crawl_and_poll_status_pipeline()

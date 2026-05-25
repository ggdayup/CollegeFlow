import json

with open("scratch/plane_issues.json") as f:
    data = json.load(f)

results = data.get("data", {}).get("results", [])
print(f"Total issues: {len(results)}")
for issue in results:
    state = issue.get("state")
    name = issue.get("name")
    issue_id = issue.get("id")
    # State IDs: Backlog e51c56b6-8ef9-4b10-baaf-37b05bc94925, Todo 16406b06-6ecc-4701-b8fc-0e807f5b9e4c, In Progress c7701ec6-17bc-4b40-a72f-2970f96cdc9e, Done aa17c124-ecbb-4e70-bfde-7c607685f9f3
    state_name = "Unknown"
    if state == "e51c56b6-8ef9-4b10-baaf-37b05bc94925":
        state_name = "Backlog"
    elif state == "16406b06-6ecc-4701-b8fc-0e807f5b9e4c":
        state_name = "Todo"
    elif state == "c7701ec6-17bc-4b40-a72f-2970f96cdc9e":
        state_name = "In Progress"
    elif state == "aa17c124-ecbb-4e70-bfde-7c607685f9f3":
        state_name = "Done"
    elif state == "08e8c222-091a-4597-9fd0-9969ceb12e5a":
        state_name = "Cancelled"
    
    if state_name in ["Backlog", "Todo", "In Progress"]:
        print(f"- [{state_name}] {name} (ID: {issue_id})")

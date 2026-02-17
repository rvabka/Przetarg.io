import json
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
input_path = os.path.join(script_dir, "response.json")
output_path = os.path.join(script_dir, "html_bodies.json")

with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

if isinstance(data, list):
    html_bodies = [item.get("htmlBody") for item in data if "htmlBody" in item]
elif isinstance(data, dict):
    if "htmlBody" in data:
        html_bodies = [data["htmlBody"]]
    else:
        html_bodies = []
else:
    html_bodies = []

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(html_bodies, f, ensure_ascii=False, indent=2)

print(f"Wyodrębniono {len(html_bodies)} pól htmlBody -> {output_path}")
import json
from collections import Counter

with open("parsed_notices.json", "r", encoding="utf-8") as f:
    data = json.load(f)

field_counter = Counter()

for notice in data:
    parsed = notice.get("parsed_data", {})
    for section_key, section_data in parsed.items():
        if not isinstance(section_data, dict):
            continue
        for field_key in section_data:
            if field_key.startswith("_"):
                continue
            field_counter[field_key] += 1

# Sortuj po numerze pola
def sort_key(field_num):
    try:
        return tuple(int(p) for p in field_num.split('.'))
    except ValueError:
        return (999,)

sorted_fields = dict(sorted(field_counter.items(), key=lambda x: sort_key(x[0])))

output = {
    "total_notices": len(data),
    "unique_fields": len(sorted_fields),
    "field_counts": sorted_fields
}

with open("field_counts.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"Ogłoszeń: {len(data)}")
print(f"Unikalnych pól: {len(sorted_fields)}\n")
for field, count in sorted_fields.items():
    print(f"  {field:10s} -> {count}")

print(f"\nZapisano do field_counts.json")
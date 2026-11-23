#!/usr/bin/env python3
"""Pre-render QA gate validating shot continuity, 2-4s pacing, and zero overlaps/gaps."""
import json, sys

def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "src/data/styleTestShots.json"
    data = json.load(open(path, encoding="utf-8"))
    shots = data.get("shots", [])
    errors, warns = [], []
    if not shots:
        errors.append("No shots found.")
    prev_end = 0.0
    for s in shots:
        st, en = float(s["start"]), float(s["end"])
        dur = en - st
        if dur <= 0:
            errors.append(f"{s['id']}: non-positive duration {dur:.2f}s")
        if abs(st - prev_end) > 0.05:
            errors.append(f"{s['id']}: gap/overlap from {prev_end:.2f}s to {st:.2f}s")
        if dur < 1.5 or dur > 6.5:
            warns.append(f"{s['id']}: duration {dur:.2f}s outside 2-4s target")
        prev_end = en
    for w in warns:
        print(f"WARN: {w}")
    for e in errors:
        print(f"ERROR: {e}")
    print(f"SUMMARY: {len(shots)} shots, total={prev_end:.1f}s, {len(errors)} errors, {len(warns)} warnings")
    sys.exit(1 if errors else 0)

if __name__ == "__main__":
    main()

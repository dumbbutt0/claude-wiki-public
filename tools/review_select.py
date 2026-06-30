#!/usr/bin/env python3
"""Select due glossary/concept pages for active-recall review + apply SM2 on grade.

Scans 03_wiki/glossary/, local/glossary/, 03_wiki/concepts/ for review candidates (`type: glossary|concept`).
A page is DUE if `review_due <= today`, or `review_due` is missing (unseeded = due now). Default: print the N
most-overdue (missing-due sorts as most overdue) as `id\ttitle\tdue\tease`. `--seed` stamps every unseeded
candidate with a starting schedule (`review_due=today, interval=0, ease=2.5, review_attempts=0`). `--grade <id> <q>`
(q 0..5) is the ONLY writer of the SM2 schedule: it recomputes `interval/ease/last_reviewed/review_due/
review_attempts` in that page's frontmatter, in place. Frontmatter-safe (pages with no `---` block are skipped),
idempotent, stdlib only. The clock comes from `--today` (default 2026-06-28) — never datetime.now().

  python3 tools/review_select.py [--n 5] [--today YYYY-MM-DD]
  python3 tools/review_select.py --seed [--today YYYY-MM-DD]
  python3 tools/review_select.py --grade <id> <0-5> [--today YYYY-MM-DD]
"""
import argparse, os, re
from datetime import date, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIRS = ["03_wiki/glossary", "local/glossary", "03_wiki/concepts"]
TODAY_DEFAULT = "2026-06-28"
FM_RE = re.compile(r"^---\n(.*?)\n---", re.S)


def parse_fm(text):                                  # same line-parse as 07_visualizer/build_graph.py
    m = FM_RE.match(text)
    fm = {}
    if m:
        for line in m.group(1).splitlines():
            if ":" in line and not line.startswith(" "):
                k, v = line.split(":", 1)
                fm[k.strip()] = v.strip().strip('"')
    return fm


def candidates():
    out = []
    for d in DIRS:
        base = os.path.join(ROOT, d)
        if not os.path.isdir(base):
            continue
        for fn in sorted(os.listdir(base)):
            if not fn.endswith(".md") or fn.lower() == "readme.md":
                continue
            p = os.path.join(base, fn)
            text = open(p, encoding="utf-8").read()
            if not FM_RE.match(text):                # skip pages with no frontmatter block
                continue
            fm = parse_fm(text)
            if fm.get("type") in ("glossary", "concept"):
                out.append((os.path.splitext(fn)[0], p, fm, text))
    return out


def as_date(s):
    y, m, dd = s.split("-")
    return date(int(y), int(m), int(dd))


def set_fm(text, updates, anchor="updated"):
    """Replace (if present) or insert (after `anchor:`, else before the closing ---) top-level scalar
    frontmatter fields, preserving every other line exactly. Returns None if there is no FM block."""
    lines = text.split("\n")
    if not lines or lines[0].strip() != "---":
        return None
    close = next((i for i in range(1, len(lines)) if lines[i].strip() == "---"), None)
    if close is None:
        return None
    rem = dict(updates)
    anchor_i = None
    for i in range(1, close):
        ln = lines[i]
        if ln.startswith(" ") or ":" not in ln:     # skip indented list items / non-key lines
            continue
        k = ln.split(":", 1)[0].strip()
        if k == anchor:
            anchor_i = i
        if k in rem:
            lines[i] = f"{k}: {rem.pop(k)}"
    if rem:
        at = (anchor_i + 1) if anchor_i is not None else close
        lines[at:at] = [f"{k}: {v}" for k, v in rem.items()]
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=5)
    ap.add_argument("--today", default=TODAY_DEFAULT)
    ap.add_argument("--seed", action="store_true")
    ap.add_argument("--grade", nargs=2, metavar=("ID", "Q"))
    a = ap.parse_args()
    today = a.today
    cands = candidates()

    if a.grade:
        gid, q = a.grade[0], int(a.grade[1])
        if not 0 <= q <= 5:
            print(f"# grade q must be 0..5 (got {q})", flush=True); return
        match = next((c for c in cands if c[0] == gid), None)
        if not match:
            print(f"# no candidate page with id '{gid}'", flush=True); return
        sid, p, fm, text = match
        ease = float(fm.get("ease") or 2.5)
        interval = int(float(fm.get("interval") or 0))
        attempts = int(float(fm.get("review_attempts") or 0))
        ease_new = round(max(1.3, ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)), 2)
        if q < 3:
            interval_new, attempts_new = 1, 0
        elif attempts == 0:                          # first success
            interval_new, attempts_new = 1, attempts + 1
        elif attempts == 1:                          # second success
            interval_new, attempts_new = 6, attempts + 1
        else:
            interval_new, attempts_new = round(interval * ease), attempts + 1
        due = (as_date(today) + timedelta(days=interval_new)).isoformat()
        new = set_fm(text, {"interval": interval_new, "ease": ease_new, "last_reviewed": today,
                            "review_due": due, "review_attempts": attempts_new})
        if new is None:
            print(f"# {gid} has no frontmatter block — skipped", flush=True); return
        open(p, "w", encoding="utf-8").write(new)
        print(f"graded\t{gid}\tq={q}\tinterval={interval_new}\tease={ease_new}\tdue={due}\tattempts={attempts_new}",
              flush=True)
        return

    if a.seed:
        seeded = []
        for sid, p, fm, text in cands:
            if fm.get("review_due"):                 # idempotent: only stamp unseeded pages
                continue
            new = set_fm(text, {"review_due": today, "interval": 0, "ease": 2.5, "review_attempts": 0})
            if new is None:
                continue
            open(p, "w", encoding="utf-8").write(new)
            seeded.append(sid)
        for sid in seeded:
            print(f"seeded\t{sid}")
        print(f"# seeded {len(seeded)} (review_due={today})", flush=True)
        return

    # default: list the N most-overdue due pages
    due = [(sid, fm, fm.get("review_due", "")) for sid, p, fm, text in cands
           if not fm.get("review_due") or fm["review_due"] <= today]
    due.sort(key=lambda t: t[2] or "")               # missing-due ("") sorts first = most overdue
    for sid, fm, rd in due[:a.n]:
        print(f"{sid}\t{fm.get('title', sid)}\t{rd}\t{fm.get('ease', '')}")
    if not due:
        print("(nothing due)")
    print(f"# due {len(due)} · candidates {len(cands)}", flush=True)


if __name__ == "__main__":
    main()

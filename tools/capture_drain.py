#!/usr/bin/env python3
"""Drain the session-capture queue (09_working/mining-queue.txt) for the autonomous /steward-captures miner.

Lists captures that are READY (a boundary fired — PreCompact/SessionEnd set `ready_to_mine: true`) and not yet mined,
or that grew >= REGROW transcript lines since the last mine. Mirrors study_drain.py: list mode prints `rel<TAB>topic`
rows so the daemon's pending() counts them; `--mark <rel>` records it mined at its current size. Stdlib only.

  python3 tools/capture_drain.py            # list captures ready to mine
  python3 tools/capture_drain.py --mark <rel>
"""
import argparse, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE = os.path.join(ROOT, "09_working", "mining-queue.txt")
DONE = os.path.join(ROOT, "09_working", "mining-done.txt")
REGROW = 50   # re-mine a capture only if it grew >= this many transcript lines since the last mine


def queued():
    if not os.path.exists(QUEUE):
        return []
    return [l.strip() for l in open(QUEUE, encoding="utf-8") if l.strip() and not l.lstrip().startswith("#")]


def done_map():
    m = {}
    if os.path.exists(DONE):
        for l in open(DONE, encoding="utf-8"):
            p = l.strip().split("\t")
            if p and p[0]:
                m[p[0]] = max(m.get(p[0], 0), int(p[1]) if len(p) > 1 and p[1].isdigit() else 0)
    return m


def meta_of(rel):
    """(ready_to_mine, nlines, topic) parsed from the capture's metadata.yaml."""
    p = os.path.join(ROOT, rel, "metadata.yaml")
    ready, nlines = False, 0
    if os.path.exists(p):
        for line in open(p, encoding="utf-8", errors="ignore"):
            if line.startswith("ready_to_mine:"):
                ready = "true" in line.lower()
            elif line.startswith("nlines:"):
                m = re.search(r"\d+", line)
                nlines = int(m.group()) if m else 0
    return ready, nlines, os.path.basename(rel.rstrip("/"))


def pending():
    done = done_map()
    out = []
    for rel in queued():
        ready, nlines, topic = meta_of(rel)
        if ready and (rel not in done or nlines >= done[rel] + REGROW):
            out.append((rel, nlines, topic))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mark", help="record this capture rel as mined at its current size")
    a = ap.parse_args()
    if a.mark:
        _, nlines, _ = meta_of(a.mark)
        os.makedirs(os.path.dirname(DONE), exist_ok=True)
        open(DONE, "a", encoding="utf-8").write(f"{a.mark}\t{nlines}\n")
        print(f"# marked mined: {a.mark} @ {nlines} lines")
        return
    p = pending()
    for rel, _n, topic in p:
        print(f"{rel}\t{topic}")
    if not p:
        print("(no captures ready to mine)")
    print(f"# pending {len(p)} capture(s)", flush=True)


if __name__ == "__main__":
    main()

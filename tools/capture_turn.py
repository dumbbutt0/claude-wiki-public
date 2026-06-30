#!/usr/bin/env python3
"""Live per-turn capture hook (Stop / PreCompact / SessionEnd).

Captures the RUNNING Claude Code session into 01_raw/design-conversations/<slug>/ every turn — so a conversation is
captured LIVE, not only at session end — and keeps it queued in 09_working/mining-queue.txt. Deterministic (a hook
cannot run an LLM). `--boundary` (PreCompact / SessionEnd) flags the capture `ready_to_mine: true`, so the autonomous
on-boundary miner (the daemon's `capture` route → /steward-captures) only mines SETTLED sessions. NEVER writes 03_wiki/
index/log and never publishes — that is the miner's job, and autonomous writes stay local_private. Stdlib only.

Reads hook JSON from stdin {session_id, transcript_path, reason}. Always exits 0 (never blocks the turn).
"""
import json, os, sys, shutil, datetime, re, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(ROOT, "01_raw", "design-conversations")
QUEUE = os.path.join(ROOT, "09_working", "mining-queue.txt")
CURSORS = os.path.join(ROOT, "09_working", ".capture-cursors.json")
MIN_USER_TURNS = 2


def slugify(s, n=6):
    words = re.findall(r"[a-z0-9]+", (s or "").lower())
    return "-".join(words[:n])[:48] or "session"


def _load(path, default):
    try:
        return json.load(open(path, encoding="utf-8"))
    except Exception:
        return default


def enqueue(rel):
    os.makedirs(os.path.dirname(QUEUE), exist_ok=True)
    existing = {l.strip() for l in open(QUEUE, encoding="utf-8")} if os.path.exists(QUEUE) else set()
    if rel not in existing:
        with open(QUEUE, "a", encoding="utf-8") as f:
            f.write(rel + "\n")


def main():
    boundary = "--boundary" in sys.argv
    raw = sys.stdin.read()
    try:
        hook = json.loads(raw) if raw.strip() else {}
    except Exception:
        hook = {}
    sid = str(hook.get("session_id") or "unknown")
    tx = hook.get("transcript_path") or ""
    reason = hook.get("reason") or ("boundary" if boundary else "turn")
    if not tx or not os.path.exists(tx):
        return

    sys.path.insert(0, os.path.join(ROOT, "tools"))
    try:
        import extract_dialogue as ed
    except Exception:
        return

    lines = open(tx, encoding="utf-8", errors="ignore").read().splitlines()
    nlines = len(lines)
    first_user, u_turns = "", 0
    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            r = json.loads(line)
        except Exception:
            continue
        msg = r.get("message") or {}
        if (msg.get("role") or r.get("role")) != "user":
            continue
        t = ed.textof(msg.get("content"))
        if ed.real_user(t, msg.get("content")):
            u_turns += 1
            if not first_user:
                first_user = t
    if u_turns < MIN_USER_TURNS and not boundary:
        return

    cursors = _load(CURSORS, {})
    cur = cursors.get(sid) or {}
    sid6 = re.sub(r"[^a-z0-9]", "", sid.lower())[:6] or "noid"
    date = datetime.date.today().isoformat()
    slug = cur.get("slug") or f"{date}-{slugify(first_user)}-{sid6}"
    outdir = os.path.join(DEST, slug)
    rel = os.path.relpath(outdir, ROOT)

    # only do work when there is new transcript content, or this is a boundary flush
    if cur and nlines <= cur.get("nlines", 0) and not boundary:
        return

    os.makedirs(outdir, exist_ok=True)
    conv = os.path.join(outdir, "conversation.md")
    try:
        subprocess.run([sys.executable, os.path.join(ROOT, "tools", "extract_dialogue.py"), tx, conv,
                        "--title", f"Session — {slugify(first_user).replace('-', ' ')} ({date})"],
                       check=True, capture_output=True)
    except Exception:
        pass
    if boundary:                                                            # full transcript only on boundary (cheap turns)
        try:
            shutil.copyfile(tx, os.path.join(outdir, "transcript.full.jsonl"))
        except Exception:
            pass

    meta = (
        "# Provenance for a live-captured Claude Code session (RAW — NOT yet mined)\n"
        f"session_id: {sid}\n"
        f"date: {date}\n"
        "source_kind: conversation\n"
        "status: raw\n"
        "mined: false\n"
        f"ready_to_mine: {'true' if boundary else 'false'}\n"
        f"nlines: {nlines}\n"
        f"user_turns: {u_turns}\n"
        f"reason: {reason}\n"
        "participants:\n  - user (project owner)\n  - Claude Code\n"
        f"source_transcript: {tx}\n"
        f"captured: {datetime.datetime.now().isoformat(timespec='seconds')}\n"
        "immutable: true\n"
        "note: >\n"
        "  Captured live by the Stop/PreCompact/SessionEnd hook (tools/capture_turn.py). RAW only. The daemon's\n"
        "  `capture` route mines it (autonomous, local_private) once ready_to_mine; nothing reaches the public mirror.\n"
    )
    try:
        open(os.path.join(outdir, "metadata.yaml"), "w", encoding="utf-8").write(meta)
    except Exception:
        pass

    enqueue(rel)
    cursors[sid] = {"slug": slug, "nlines": nlines}
    try:
        os.makedirs(os.path.dirname(CURSORS), exist_ok=True)
        json.dump(cursors, open(CURSORS, "w", encoding="utf-8"))
    except Exception:
        pass


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"capture_turn: {e}", file=sys.stderr)
    sys.exit(0)   # never block the turn

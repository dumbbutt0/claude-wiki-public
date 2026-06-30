#!/usr/bin/env python3
"""chat_drain.py — the bridge for the in-Obsidian chat panel.

The Lens appends user messages to 09_working/chat-inbox.jsonl; `/chat` drains them, acts, and appends assistant
replies to 09_working/chat-outbox.jsonl (which the Lens renders, with clickable node refs + artifact links).
Local working memory — git-ignored, never public.

  python3 tools/chat_drain.py                 # list pending user messages (oldest first): id<TAB>text
  python3 tools/chat_drain.py --mark <id>     # mark a message handled (without replying)
  python3 tools/chat_drain.py --reply <id> --text "..." [--refs a,b] [--artifacts path1,path2]
"""
import argparse, json, os, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INBOX = os.path.join(ROOT, "09_working", "chat-inbox.jsonl")
OUTBOX = os.path.join(ROOT, "09_working", "chat-outbox.jsonl")
DONE = os.path.join(ROOT, "09_working", "chat-processed.txt")


def _done():
    return set(open(DONE, encoding="utf-8").read().split()) if os.path.exists(DONE) else set()


def _messages():
    if not os.path.exists(INBOX):
        return []
    out = []
    for ln in open(INBOX, encoding="utf-8"):
        ln = ln.strip()
        if ln:
            try:
                out.append(json.loads(ln))
            except Exception:
                pass
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mark")
    ap.add_argument("--reply")
    ap.add_argument("--text", default="")
    ap.add_argument("--refs", default="")
    ap.add_argument("--artifacts", default="")
    a = ap.parse_args()

    if a.mark:
        open(DONE, "a", encoding="utf-8").write(a.mark + "\n")
        print(f"chat: marked {a.mark} handled")
        return

    if a.reply:
        rec = {"id": "a" + str(int(time.time() * 1000)), "role": "assistant", "replyTo": a.reply,
               "text": a.text, "refs": [x.strip() for x in a.refs.split(",") if x.strip()],
               "artifacts": [x.strip() for x in a.artifacts.split(",") if x.strip()], "ts": int(time.time() * 1000)}
        os.makedirs(os.path.dirname(OUTBOX), exist_ok=True)
        open(OUTBOX, "a", encoding="utf-8").write(json.dumps(rec, ensure_ascii=False) + "\n")
        open(DONE, "a", encoding="utf-8").write(a.reply + "\n")
        print(f"chat: replied to {a.reply} ({len(rec['text'])} chars · {len(rec['refs'])} refs · {len(rec['artifacts'])} artifacts)")
        return

    done = _done()
    pend = [m for m in _messages() if m.get("role") == "user" and m.get("id") not in done]
    print(f"# pending {len(pend)}")
    for m in pend:
        print(f"{m.get('id')}\t{(m.get('text', '') or '')[:240]}")


if __name__ == "__main__":
    main()

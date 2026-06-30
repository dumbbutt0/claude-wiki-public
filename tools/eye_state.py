#!/usr/bin/env python3
"""Write the ephemeral eye-state that drives the Wiki Eye plugin (the "living eye" bridge).

The commands (/prime, /query, /compose, /expand) call this to tell the eye what the AI is doing.
It writes/merges 09_working/eye-state.json; the plugin watches that file and reacts (focus to the
goal, fade the rest, pulse the pipeline, show goal/confidence in the pupil, blink, crystallize new
nodes). This is EPHEMERAL UI state — git-ignored, not graph knowledge. Stdlib only.

Examples:
  python3 tools/eye_state.py --goal "Improve Project-X" --status primed --focus project-x \
      --active concept-a,concept-b,concept-c
  python3 tools/eye_state.py --status done --confidence 0.84 --answer "Refine the approach" --blink
  python3 tools/eye_state.py --status composing --pipeline observe,map-context,generate-candidates,validate
  python3 tools/eye_state.py --reset
"""
import argparse, json, os, time

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--goal")
    ap.add_argument("--status")
    ap.add_argument("--confidence", type=float)
    ap.add_argument("--answer")
    ap.add_argument("--focus")
    ap.add_argument("--active", help="comma-separated node ids to pull inward (rest fade)")
    ap.add_argument("--pipeline", help="comma-separated stage/node ids to pulse in sequence")
    ap.add_argument("--new", dest="new", help="comma-separated newly-created node ids to crystallize")
    ap.add_argument("--edges", help="comma-separated active development pathways 'src|tgt' to GLOW (where Claude is building)")
    ap.add_argument("--building", help="short note: what Claude is developing right now (shown in the HUD)")
    ap.add_argument("--blink", action="store_true", help="trigger a single blink")
    ap.add_argument("--reset", action="store_true", help="clear to idle")
    a = ap.parse_args()

    here = os.path.dirname(os.path.abspath(__file__))
    path = os.path.normpath(os.path.join(here, "..", "09_working", "eye-state.json"))
    os.makedirs(os.path.dirname(path), exist_ok=True)

    if a.reset:
        state = {"status": "idle", "goal": None, "activeIds": [], "pipeline": [], "newNodeIds": [], "activeEdges": [], "building": None}
    else:
        state = {}
        if os.path.exists(path):
            try: state = json.load(open(path, encoding="utf-8"))
            except Exception: state = {}
        if a.goal is not None: state["goal"] = a.goal
        if a.status is not None: state["status"] = a.status
        if a.confidence is not None: state["confidence"] = a.confidence
        if a.answer is not None: state["answer"] = a.answer
        if a.focus is not None: state["focusId"] = a.focus
        if a.active is not None: state["activeIds"] = [x.strip() for x in a.active.split(",") if x.strip()]
        if a.pipeline is not None: state["pipeline"] = [x.strip() for x in a.pipeline.split(",") if x.strip()]
        if a.new is not None: state["newNodeIds"] = [x.strip() for x in a.new.split(",") if x.strip()]
        if a.edges is not None: state["activeEdges"] = [x.strip() for x in a.edges.split(",") if x.strip() and "|" in x]
        if a.building is not None: state["building"] = a.building or None
        if a.blink: state["blink"] = int(time.time() * 1000)
        if state.get("status") == "idle":                        # idle = exploration → release focus + active so the auto-camera frees up (no stuck mission)
            state["focusId"] = None; state["activeIds"] = []; state["activeEdges"] = []

    state["ts"] = int(time.time() * 1000)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)
    print(f"eye-state: {state.get('status')} | goal={state.get('goal')!r} | "
          f"active={len(state.get('activeIds', []))} pipeline={len(state.get('pipeline', []))}")

if __name__ == "__main__":
    main()

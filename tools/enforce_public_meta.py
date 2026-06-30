#!/usr/bin/env python3
"""enforce_public_meta.py — the publish policy: ONLY `mode: meta` pages may be `public_system`.

The owner's rule: only the SYSTEM that makes up the wiki itself reaches GitHub — never created knowledge/sources.
`mode: meta` = "pages about the wiki itself" (CLAUDE §6). This walks the public-area folders and DEMOTES any
`privacy_scope: public_system` page whose `mode` is not `meta` to `local_private` (graph_scope → local). Idempotent;
safe to re-run. The export + build_graph also enforce meta-only as a backstop.

  python3 tools/enforce_public_meta.py [--dry-run]
"""
import argparse, glob, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOLDERS = ["03_wiki", "04_synthesis", "05_blueprints"]
FM = re.compile(r"^---\n(.*?)\n---", re.S)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    changed = []
    for folder in FOLDERS:
        for f in glob.glob(os.path.join(ROOT, folder, "**", "*.md"), recursive=True):
            t = open(f, encoding="utf-8").read()
            m = FM.match(t)
            if not m:
                continue
            head, body = m.group(1), t[m.end():]
            if "privacy_scope: public_system" not in head:
                continue
            mode = re.search(r"^mode:\s*(\S+)", head, re.M)
            if (mode.group(1) if mode else "") == "meta":
                continue                                          # the system itself → stays public
            new_head = (head.replace("privacy_scope: public_system", "privacy_scope: local_private")
                            .replace("graph_scope: public", "graph_scope: local"))
            changed.append((os.path.relpath(f, ROOT), mode.group(1) if mode else "—"))
            if not a.dry_run:
                open(f, "w", encoding="utf-8").write("---\n" + new_head + "\n---" + body)
    print(f"{'(dry-run) ' if a.dry_run else ''}demoted {len(changed)} non-meta page(s) public_system → local_private")
    for rel, md in sorted(changed):
        print(f"  [{md}] {rel}")


if __name__ == "__main__":
    main()

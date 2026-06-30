#!/usr/bin/env python3
"""Build a CLEAN public-only export — ONLY the `privacy_scope: public_system` pages (the shareable "system logic"),
with wikilinks to non-public pages stripped to plain text (so no private page-names leak) — into a fresh directory.

Honors "publish the ideas, not the edge": the personal sources, project internals, and the edge NEVER leave the
machine. The export is a self-contained snapshot you can `git init` + push to a (private or public) GitHub repo.

  python3 tools/export_public.py [/dest/dir]      # default: ~/claude-wiki-public
"""
import os, re, json, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.abspath(os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/claude-wiki-public"))
PUB = json.load(open(os.path.join(ROOT, "07_visualizer", "graph-public.json"), encoding="utf-8"))


def slug(s):
    s = (s or "").strip().lower()
    s = re.sub(r"[^\w\s-]", "", s)
    return re.sub(r"[\s_]+", "-", s).strip("-")


# allowlist: public node ids + slugified titles. paths: id -> committed path.
allow, paths, title_of = set(), {}, {}
for n in PUB["nodes"]:
    allow.add(n["id"]); allow.add(slug(n.get("title", "")))
    title_of[n["id"]] = n.get("title", n["id"])
    if n.get("path"):
        paths[n["id"]] = n["path"]

LINK = re.compile(r"\[\[([^\]]+?)\]\]")


def clean_links(text):
    def repl(m):
        raw = m.group(1)
        target = raw.split("|")[0].split("#")[0].strip()
        disp = raw.split("|", 1)[1] if "|" in raw else target
        return m.group(0) if (slug(target) in allow or target in allow) else disp   # keep public links, strip the rest
    return LINK.sub(repl, text)


os.makedirs(EXPORT, exist_ok=True)
for entry in os.listdir(EXPORT):                                              # clear content but PRESERVE .git (re-export keeps history)
    if entry == ".git":
        continue
    p = os.path.join(EXPORT, entry)
    shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)

n, idx = 0, []
for nid, rel in sorted(paths.items()):
    src = os.path.join(ROOT, rel)
    if not os.path.exists(src):
        continue
    dst = os.path.join(EXPORT, rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    open(dst, "w", encoding="utf-8").write(clean_links(open(src, encoding="utf-8").read()))
    n += 1
    idx.append(f"- [{title_of[nid]}]({rel})")

for f in ["07_visualizer/graph-public.json", "graph-manifest.json"]:
    s = os.path.join(ROOT, f)
    if os.path.exists(s):
        d = os.path.join(EXPORT, f); os.makedirs(os.path.dirname(d), exist_ok=True); shutil.copy(s, d)

readme = (
    "# Claude-Wiki — public methodology\n\n"
    "The shareable **system-logic** subset of a personal LLM-wiki (Karpathy's pattern), maintained by Claude Code.\n"
    f"**Only `privacy_scope: public_system` pages are here** — {n} methodology nodes on agent loops, conversion\n"
    "learning, evaluation discipline, and the wiki's own architecture. The owner's sources, project internals, and\n"
    "the *edge* never leave their machine — *\"publish the ideas, not the edge.\"*\n\n"
    "Graph: `07_visualizer/graph-public.json`. Visual encoding: `graph-manifest.json`. Links to non-public pages were\n"
    "stripped to plain text on export.\n\n## Contents\n" + "\n".join(sorted(idx)) + "\n"
)
open(os.path.join(EXPORT, "README.md"), "w", encoding="utf-8").write(readme)
open(os.path.join(EXPORT, ".gitignore"), "w", encoding="utf-8").write("# nothing private should ever live here\n")
print(f"exported {n} public_system pages → {EXPORT}  (non-public links stripped)")

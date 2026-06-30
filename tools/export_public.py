#!/usr/bin/env python3
"""Build a CLEAN public-only export — ONLY the `privacy_scope: public_system` pages (the shareable "system logic"),
with wikilinks to non-public pages stripped to plain text (so no private page-names leak) — into a fresh directory.

Honors "publish the ideas, not the edge": the personal sources, project internals, and the edge NEVER leave the
machine. The export is a self-contained snapshot you can `git init` + push to a (private or public) GitHub repo.

Before it finishes, a LEAKAGE GATE scans the whole export for secrets/PII (keys, tokens, emails, wallet addresses)
plus a configurable denylist of private identifiers, and ABORTS (non-zero exit) on any match — so an accidental leak
can't be pushed. The denylist is read from $CLAUDE_WIKI_LEAKAGE_DENYLIST or tools/leakage-denylist.txt (git-ignored;
one token/regex per line). Built-in secret patterns work with no config.

  python3 tools/export_public.py [/dest/dir]      # default: ~/claude-wiki-public
"""
import os, re, json, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.abspath(os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/claude-wiki-public"))
PUB = json.load(open(os.path.join(ROOT, "07_visualizer", "graph-public.json"), encoding="utf-8"))

# ---------------------------------------------------------------------------------------------------------------------
# Leakage gate — scan the finished export for secrets/PII + a configurable denylist, and abort the publish on any hit.
# ---------------------------------------------------------------------------------------------------------------------
GATE_TEXT_EXT = {".md", ".json", ".txt", ".yml", ".yaml", ".csv"}
SECRET_PATTERNS = [
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"), "private key block"),
    (re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b"), "AWS access key"),
    (re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}\b"), "GitHub token"),
    (re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b"), "Slack token"),
    (re.compile(r"\bsk-[A-Za-z0-9]{20,}\b"), "API key (sk-...)"),
    (re.compile(r"\bAIza[0-9A-Za-z_\-]{35}\b"), "Google API key"),
    (re.compile(r"\b0x[a-fA-F0-9]{40}\b"), "wallet/eth address"),
    (re.compile(r"(?i)\b(?:api[_-]?key|secret|password|passwd|access[_-]?token)\b\s*[:=]\s*['\"][^'\"]{8,}['\"]"),
     "inline secret assignment"),
]
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
EMAIL_ALLOW = {"noreply@anthropic.com"}                                   # the public Anthropic commit trailer
EMAIL_ALLOW_SUFFIX = ("@users.noreply.github.com", "@example.com", "@creativecommons.org")


def _load_denylist():
    for p in (os.environ.get("CLAUDE_WIKI_LEAKAGE_DENYLIST"), os.path.join(ROOT, "tools", "leakage-denylist.txt")):
        if p and os.path.exists(p):
            pats = [re.compile(re.escape(s.strip()), re.I) for s in open(p, encoding="utf-8")
                    if s.strip() and not s.lstrip().startswith("#")]
            return pats, p
    return [], None


def leakage_gate(export_dir):
    denylist, src = _load_denylist()
    note = f"denylist={src} ({len(denylist)} terms)" if src else "denylist=none (set tools/leakage-denylist.txt)"
    hits = []
    for dp, _dns, fns in os.walk(export_dir):
        if ".git" in dp.split(os.sep):
            continue
        for fn in fns:
            p = os.path.join(dp, fn)
            if os.path.splitext(p)[1].lower() not in GATE_TEXT_EXT:
                continue
            rel = os.path.relpath(p, export_dir).replace(os.sep, "/")
            for i, line in enumerate(open(p, encoding="utf-8", errors="ignore"), 1):
                for pat, label in SECRET_PATTERNS:
                    if pat.search(line):
                        hits.append((rel, i, label, line.strip()[:100]))
                for m in EMAIL_RE.finditer(line):
                    e = m.group(0).lower()
                    if e not in EMAIL_ALLOW and not e.endswith(EMAIL_ALLOW_SUFFIX):
                        hits.append((rel, i, "email/PII", e))
                for pat in denylist:
                    if pat.search(line):
                        hits.append((rel, i, "denylist", line.strip()[:100]))
    if hits:
        print(f"[export] ✗ LEAKAGE GATE FAILED — {len(hits)} hit(s) [{note}]:", file=sys.stderr)
        for rel, i, label, snip in hits[:60]:
            print(f"    {rel}:{i}  «{label}»  {snip}", file=sys.stderr)
        sys.exit(1)
    print(f"[export] ✓ leakage gate passed — no secrets/PII/denylist tokens in the export ({note}).")


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
leakage_gate(EXPORT)                                                          # abort the publish if anything leaked

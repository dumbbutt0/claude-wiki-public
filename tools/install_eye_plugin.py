#!/usr/bin/env python3
"""Install the version-controlled "Wiki Eye" plugin into the vault and enable it.

Copies 07_visualizer/wiki-eye-plugin/* → <vault>/.obsidian/plugins/wiki-eye/ and adds "wiki-eye" to
.obsidian/community-plugins.json (so Obsidian loads it on next reload). Idempotent. The plugin source
stays version-controlled in the repo; .obsidian/ is outside it, so re-run after pulling. Stdlib only.

Usage:  python3 tools/install_eye_plugin.py     # then reload Obsidian
"""
import json, os, shutil

PLUGIN_ID = "wiki-eye"
FILES = ["manifest.json", "main.js", "styles.css"]

def main():
    here = os.path.dirname(os.path.abspath(__file__))
    src = os.path.normpath(os.path.join(here, "..", "07_visualizer", "wiki-eye-plugin"))
    obs = os.path.normpath(os.path.join(here, "..", "..", ".obsidian"))
    dest = os.path.join(obs, "plugins", PLUGIN_ID)
    os.makedirs(dest, exist_ok=True)
    for f in FILES:
        s = os.path.join(src, f)
        if os.path.exists(s):
            shutil.copyfile(s, os.path.join(dest, f))
    # enable it (preserve any other enabled plugins, e.g. juggl)
    cpj = os.path.join(obs, "community-plugins.json")
    enabled = []
    if os.path.exists(cpj):
        try: enabled = json.load(open(cpj, encoding="utf-8"))
        except Exception: enabled = []
    if PLUGIN_ID not in enabled:
        enabled.append(PLUGIN_ID)
    with open(cpj, "w", encoding="utf-8") as f:
        json.dump(enabled, f, indent=2)
    print(f"installed {PLUGIN_ID} -> {dest}")
    print(f"enabled plugins: {enabled}")
    print("Reload Obsidian (Ctrl+P -> 'Reload app without saving'), then click the eye ribbon icon or run 'Open Wiki Eye'.")

if __name__ == "__main__":
    main()

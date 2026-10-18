---
Task ID: rea-setup
Agent: main (Z.ai Code)
Task: Set up REA (morluto/rea) fully so the user can reverse engineer a website and build a new one

Work Log:
- Cloned https://github.com/morluto/rea.git to /tmp/rea for inspection (official installer flow).
- Resolved latest release via npm registry (GitHub API blocked in this sandbox): rea-agents@6.7.0.
- Verified Node v24.21.0 satisfies REA's engine requirement (>=24.11, or 22.19+ / 26+).
- Installed REA globally using the same flags as install.sh on Linux:
  `npm install --global --prefix "$HOME/.local" rea-agents@6.7.0` -> ~/.local/bin/rea (and rea-agents symlink).
- Added `export PATH="$HOME/.local/bin:$PATH"` to ~/.bashrc so `rea` resolves in new shells.
- Installed Chromium for the bundled playwright-core (1.58.2):
  `node .../playwright-core/cli.js install chromium` ->
    ~/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome  (Google Chrome for Testing 145.0.7632.6)
    ~/.cache/ms-playwright/chromium_headless_shell-1208/...
  Note: `--with-deps` could not be run (no sudo in sandbox); verified Chrome still launches and renders pages.
- Ran `rea setup --skill --yes` to install the bundled REA workflow skill (no agent clients
  exist in this sandbox: Claude Code/Cursor/Codex/Gemini/etc. all report `missing`).
  Skill installed to ~/.agents/skills/reverse-engineer-anything, state=aligned, 207 tools, version 42.
- Verified the website RE pipeline end-to-end:
  * `rea doctor` -> node + host healthy; skill aligned; native engines (Hopper/Ghidra/IDA/JADX/Kuna)
    not installed (NOT needed for website/JS analysis per REA docs).
  * Smoke test: provider-owned Chromium launch via Playwright worked.
  * `rea capture-browser-scenario` on https://example.com produced 106 KB canonical Evidence JSON
    with url/dom/accessibility(1459B text)/screenshot(1280x720 PNG)/history/storage.
  * `rea capture-browser-scenario` on https://news.ycombinator.com produced 300 KB Evidence JSON
    with 21 network events (7 requests + 7 responses + 7 request-finished), DOM, accessibility,
    screenshot, history, storage. Step status=completed, confidence=observed.
- Limitation observed: a long-running externally-launched Chrome (for `list-browser-targets` and
  `analyze-web-bundle` connect-mode) is killed by the sandbox after one request. The provider-owned
  launch path used by `capture-browser-scenario` is unaffected and is the primary website-RE entry
  point, so this does not block website reverse engineering.

Stage Summary:
- REA v6.7.0 fully installed at ~/.local/bin/rea (PATH persisted in ~/.bashrc).
- Chromium 145 (Chrome for Testing + headless shell) installed at ~/.cache/ms-playwright/.
- Bundled workflow skill aligned at ~/.agents/skills/reverse-engineer-anything (207 tools).
- Website RE pipeline verified working end-to-end on two real sites (example.com, news.ycombinator.com).
- Demo artifacts kept under /home/z/my-project/rea-evidence/ (scenario.json, scenario-net.json,
  capture.json, capture-net.json, screenshot.png, hn-screenshot.png) for reference.
- Ready to reverse engineer an arbitrary target website and build a Next.js clone in /home/z/my-project.
- Awaiting: user must specify which website to reverse engineer before starting Task 5 (build a new one).

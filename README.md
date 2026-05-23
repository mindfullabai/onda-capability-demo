# Capability Demo — Onda Plugin Reference 🎓

[![Onda](https://img.shields.io/badge/Onda-plugin-a855f7)](https://onda.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Template](https://img.shields.io/badge/built%20from-onda--plugin--template-blue)](https://github.com/mindfullabai/onda-plugin-template)

> A living reference for every capability the [Onda](https://onda.sh) plugin bridge exposes. **Not** a tool you want for daily use — it's a working source-code reference. If you're building an Onda plugin, read [`src/index.ts`](src/index.ts) and copy what you need.

## What this plugin does

Every single capability of the Onda plugin bridge is exercised by one button (or one source comment) in this plugin. Activate it once, press `Cmd+Shift+D`, and click around to see exactly what each bridge call does.

## How to use

1. Install from the in-app plugin store (search "Capability Demo") or sideload the zip from [Releases](https://github.com/mindfullabai/onda-capability-demo/releases).
2. Open Onda. A `🎓 demo` item appears in the right side of the status bar.
3. Press `Cmd+Shift+D` (or click the status bar item) to open the demo panel.
4. Click each button to fire the corresponding bridge call. The "Last result" pane shows the response.
5. Right-click any terminal -> "Demo: Greet" to see the context-menu capability in action.

## Capabilities demonstrated

| Capability | What the demo does | Source |
|---|---|---|
| `commands` | Registers `…open` (opens panel) and `…greet` (context menu target) | [src/index.ts § `=== commands ===`](src/index.ts) |
| `statusbar` | Adds a `🎓 demo` indicator, click -> `…open` command | [§ `=== statusbar ===`](src/index.ts) |
| `notifications` | 4 buttons fire success / info / warning / error | [§ `=== notifications ===`](src/index.ts) |
| `panel` | The whole right-side demo panel + per-button `data-action` -> `panel.onAction` | [§ `=== panel ===`](src/index.ts) |
| `dialog` | Input dialog (text + checkbox), confirm dialog, alert dialog | [§ `=== dialog ===`](src/index.ts) |
| `contextmenu` | "Demo: Greet" entry on the terminal context menu, wired to a command | [§ `=== contextmenu ===`](src/index.ts) |
| `clipboard` | Read clipboard, write `Hello from plugin <timestamp>` | [§ `=== clipboard ===`](src/index.ts) |
| `storage` | Persistent `opens` counter, bump/reset buttons | [§ `=== storage ===`](src/index.ts) |
| `http` | Fetches `https://uselessfacts.jsph.pl/api/v2/facts/random` (whitelisted via `manifest.httpDomains`) | [§ `=== http ===`](src/index.ts) |
| `exec` | Runs `uname -a` (whitelisted via `manifest.execPatterns`) | [§ `=== exec ===`](src/index.ts) |
| `terminal:read` | Reads last 20 lines of the active terminal | [§ `=== terminal:read ===`](src/index.ts) |
| `terminal:write` | Writes `echo "Hello…"` to the active terminal | [§ `=== terminal:write ===`](src/index.ts) |
| `keybindings` | `Cmd+Shift+D` opens the panel (declared in `manifest.contributes.keybindings`) | [manifest.json](manifest.json) |
| `themes` | Declares + activates a "Demo Dark" theme | [§ `=== themes ===`](src/index.ts) + [manifest.json](manifest.json) |

## Read the source

Single file, ~330 LOC: [**`src/index.ts`**](src/index.ts).

The companion [`manifest.json`](manifest.json) is also worth reading — it shows every `contributes` field shape (commands, keybindings, themes), capability declarations, and the `httpDomains` / `execPatterns` allowlists that gate the corresponding bridge calls.

## Notes & deviations from the brief

Discovered while implementing this plugin against the real Onda bridge:

- **Context menu** lives at runtime only (`onda.contextMenu.register(context, item)`), not in a `manifest.contributes.contextMenu` field. The plugin registers it in `onActivate`.
- **Keybinding** on a command is NOT declared inline on the command entry — it's a separate `contributes.keybindings` array (matches the `KeybindingContribution` type).
- **Theme contribution shape** requires the full 20-color palette (see `ThemeContribution` in `types/onda.d.ts`). A minimal `{ background, foreground, accent }` is rejected at validation.
- **`onda.panel.onAction(action, handler)`** is a runtime helper not yet in the public `.d.ts` typings — we cast to use it (TODO upstream PR to add it).

## Use this as a starting point

This plugin is a **showcase**, not a template. If you want to create your own plugin, fork [`mindfullabai/onda-plugin-template`](https://github.com/mindfullabai/onda-plugin-template) instead — it's the lean scaffold this plugin was generated from.

## Build & pack locally

```bash
npm install
npm run build       # tsup -> dist/main.js
npm run typecheck   # tsc --noEmit
npm run icon        # generate icon.svg + icon.png
npm run pack        # build + create release/sh.onda.capability-demo-1.0.0.zip
npm run link:local  # symlink into ~/.config/onda/plugins/ for hot-reload dev
```

## Changelog

### 1.0.0
- Initial release. Covers all 14 capabilities currently exposed by the Onda plugin bridge.

## License

MIT — see [LICENSE](LICENSE).

---

Built by [Mario Mosca](https://mariomosca.dev) / [Mindful Lab AI](https://github.com/mindfullabai). Questions? Open an issue.

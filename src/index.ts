/**
 * Onda Capability Demo Plugin
 *
 * Reference plugin. Every Onda plugin bridge capability is exercised here so
 * developers can read this file end-to-end and copy the exact bridge calls
 * they need. NOT a useful tool for daily work — it's a living spec.
 *
 * Capabilities demonstrated (see manifest.json):
 *   commands, statusbar, notifications, panel, dialog, contextmenu,
 *   clipboard, storage, http, exec, terminal:read, terminal:write,
 *   keybindings, themes
 *
 * Source for each capability: ctrl-F the section banner ("// === <cap> ===").
 */

import type { OndaAPI, OndaPluginEntry } from '../types/onda';

const PLUGIN_ID = 'sh.onda.capability-demo';
const PANEL_ID = 'panel';
const STATUS_ITEM_ID = 'indicator';

/** HTML rendered inside the demo panel. All buttons use `data-action` —
 *  the host dispatches a `plugin-panel-action` event which the bridge
 *  forwards to the worker as `panel:action`. We register handlers via
 *  `onda.panel.onAction(action, fn)`. */
function panelHtml(opens: number, lastResult: string): string {
  const sanitize = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `
<style>
  .demo-root { font: 13px/1.45 -apple-system, system-ui, sans-serif; color: #e5e5ee; }
  .demo-root h2 { margin: 0 0 6px; font-size: 14px; color: #c084fc; letter-spacing: .02em; }
  .demo-root h3 { margin: 16px 0 6px; font-size: 11px; text-transform: uppercase; color: #8b8ba7; letter-spacing: .06em; }
  .demo-root p.intro { color: #b4b4c8; margin: 0 0 12px; }
  .demo-root .counter { background:#1a1a2e; padding:8px 10px; border-radius:6px; margin-bottom:12px; color:#a855f7; font-weight:600; }
  .demo-root button {
    display:inline-block; margin:3px 4px 3px 0; padding:6px 10px;
    background:#22223a; color:#f0f0ff; border:1px solid #2b2b46;
    border-radius:5px; font-size:12px; cursor:pointer;
  }
  .demo-root button:hover { background:#2b2b46; border-color:#a855f7; }
  .demo-root pre.result {
    background:#0a0a14; color:#a8e6cf; padding:8px; border-radius:5px;
    font-size:11px; white-space:pre-wrap; word-break:break-all;
    max-height:160px; overflow:auto; margin-top:8px; border:1px solid #1a1a2e;
  }
  .demo-root .group { margin-bottom:6px; }
  .demo-root .hint { color:#7a7a96; font-size:11px; margin:2px 0 0; }
</style>
<div class="demo-root">
  <h2>Capability Demo</h2>
  <p class="intro">Every button below exercises a real bridge call. Read <code>src/index.ts</code> on GitHub for the matching code.</p>
  <div class="counter">Panel opens: ${opens}</div>

  <h3>Notifications</h3>
  <div class="group">
    <button data-action="notify" data-payload='{"type":"success"}'>Success</button>
    <button data-action="notify" data-payload='{"type":"info"}'>Info</button>
    <button data-action="notify" data-payload='{"type":"warning"}'>Warning</button>
    <button data-action="notify" data-payload='{"type":"error"}'>Error</button>
  </div>

  <h3>Dialog</h3>
  <div class="group">
    <button data-action="dialog-show">Show input dialog</button>
    <button data-action="dialog-confirm">Confirm dialog</button>
    <button data-action="dialog-alert">Alert dialog</button>
  </div>

  <h3>Clipboard</h3>
  <div class="group">
    <button data-action="clipboard-write">Copy random string</button>
    <button data-action="clipboard-read">Read clipboard</button>
  </div>

  <h3>Storage</h3>
  <div class="group">
    <button data-action="storage-bump">Bump counter manually</button>
    <button data-action="storage-reset">Reset counter</button>
    <p class="hint">The "Panel opens" counter above is read from onda.storage.</p>
  </div>

  <h3>HTTP</h3>
  <div class="group">
    <button data-action="http-fetch">Fetch random fact</button>
    <p class="hint">Whitelisted domain: uselessfacts.jsph.pl (see manifest.httpDomains)</p>
  </div>

  <h3>Exec</h3>
  <div class="group">
    <button data-action="exec-run">Run <code>uname -a</code></button>
    <p class="hint">Whitelisted via manifest.execPatterns: ^uname</p>
  </div>

  <h3>Terminal</h3>
  <div class="group">
    <button data-action="terminal-read">Read active terminal (last 200 chars)</button>
    <button data-action="terminal-write">Write echo to terminal</button>
  </div>

  <h3>Context menu</h3>
  <div class="group">
    <p class="hint">Right-click a terminal and pick "Demo: Greet" — check DevTools console.</p>
  </div>

  <h3>Keybinding</h3>
  <div class="group">
    <p class="hint">Cmd+Shift+Y opens this panel from anywhere.</p>
  </div>

  <h3>Theme</h3>
  <div class="group">
    <button data-action="theme-activate">Activate "Demo Dark" theme</button>
    <p class="hint">Defined in manifest.contributes.themes — activate via bridge.</p>
  </div>

  <h3>Last result</h3>
  <pre class="result">${sanitize(lastResult || '(no action run yet)')}</pre>
</div>`;
}

const plugin: OndaPluginEntry = {
  async onActivate(onda: OndaAPI) {
    log('Activated');

    // === storage ===
    // Persistent counter: how many times the panel has been opened.
    let opens = ((await onda.storage.get<number>('opens')) ?? 0) as number;
    let lastResult = '(no action run yet)';

    const refreshPanel = () => onda.panel.setContent(PANEL_ID, panelHtml(opens, lastResult));
    const setResult = async (s: string) => {
      lastResult = s;
      await refreshPanel();
    };

    // === panel ===
    await onda.panel.register({
      id: PANEL_ID,
      title: 'Capability Demo',
      icon: 'GraduationCap',
      position: 'right',
      width: 340,
    });
    await refreshPanel();

    const openPanel = async () => {
      opens += 1;
      await onda.storage.set('opens', opens);
      await refreshPanel();
      await onda.panel.show(PANEL_ID);
    };

    // === commands ===
    onda.commands.register(`${PLUGIN_ID}.open`, {
      title: 'Capability Demo: Open Panel',
      category: 'Capability Demo',
      handler: openPanel,
    });

    onda.commands.register(`${PLUGIN_ID}.greet`, {
      title: 'Capability Demo: Greet (context menu demo)',
      category: 'Capability Demo',
      handler: async () => {
        log('Greet invoked from context menu');
        onda.notifications.show({
          type: 'info',
          title: 'Greet',
          message: 'Hello from the context menu! Check the DevTools console.',
        });
      },
    });

    // === statusbar ===
    await onda.statusBar.addItem({
      id: STATUS_ITEM_ID,
      text: 'demo',
      icon: 'GraduationCap',
      tooltip: 'Open the Capability Demo panel',
      position: 'right',
      onClick: `${PLUGIN_ID}.open`,
    });

    // === contextmenu ===
    // Register a "Demo: Greet" item on the terminal context menu.
    // Note: the runtime API is `contextMenu.register(context, item)`,
    // not the manifest-only `contributes.contextMenu` field.
    await onda.contextMenu.register('terminal', {
      id: 'greet',
      label: 'Demo: Greet',
      icon: 'GraduationCap',
      command: `${PLUGIN_ID}.greet`,
    });

    // === panel actions ===
    // Buttons inside the panel HTML carry `data-action="<name>"`.
    // The host forwards click events to the worker; we dispatch here.
    // `onAction` is a runtime-only helper not in the .d.ts (yet) — cast.
    const panel = onda.panel as unknown as {
      onAction: (action: string, handler: (payload?: unknown) => void | Promise<void>) => void;
    };

    panel.onAction('notify', async (payload) => {
      const type = (payload as { type: string })?.type as
        | 'success'
        | 'info'
        | 'warning'
        | 'error';
      // === notifications ===
      const title = type.charAt(0).toUpperCase() + type.slice(1) + ' notification';
      onda.notifications.show({
        type,
        title,
        message: `This is a ${type} notification fired from the demo panel.`,
      });
      await setResult(`notifications.show ${type} OK`);
    });

    // === dialog ===
    panel.onAction('dialog-show', async () => {
      const res = await onda.dialog.show({
        title: 'Capability Demo',
        message: 'Type something and press OK:',
        fields: [
          { id: 'name', label: 'Your name', type: 'text', defaultValue: 'Mario', required: true },
          { id: 'newsletter', label: 'Subscribe (fake)', type: 'checkbox', defaultValue: true },
        ],
        buttons: [
          { id: 'ok', label: 'OK', variant: 'primary' },
          { id: 'cancel', label: 'Cancel', variant: 'secondary' },
        ],
      });
      await setResult(`dialog.show -> ${JSON.stringify(res)}`);
    });

    panel.onAction('dialog-confirm', async () => {
      const res = await onda.dialog.confirm({
        title: 'Confirm demo',
        message: 'Do you want to confirm this action?',
      });
      await setResult(`dialog.confirm -> ${JSON.stringify(res)}`);
    });

    panel.onAction('dialog-alert', async () => {
      await onda.dialog.alert({ title: 'Alert', message: 'This is a simple modal alert.' });
      await setResult('dialog.alert closed');
    });

    // === clipboard ===
    panel.onAction('clipboard-write', async () => {
      const text = `Hello from plugin ${Date.now()}`;
      await onda.clipboard.write(text);
      await setResult(`clipboard.write OK -> "${text}"`);
      onda.notifications.show({ type: 'success', message: 'Copied to clipboard.' });
    });

    panel.onAction('clipboard-read', async () => {
      const { text } = await onda.clipboard.read();
      await setResult(`clipboard.read -> "${text}"`);
    });

    // === storage (manual buttons) ===
    panel.onAction('storage-bump', async () => {
      opens += 1;
      await onda.storage.set('opens', opens);
      await setResult(`storage.set opens=${opens}`);
    });

    panel.onAction('storage-reset', async () => {
      opens = 0;
      await onda.storage.set('opens', 0);
      await setResult('storage.set opens=0');
    });

    // === http ===
    panel.onAction('http-fetch', async () => {
      try {
        const r = await onda.http.fetch('https://uselessfacts.jsph.pl/api/v2/facts/random');
        const fact = (r.data as { text?: string })?.text ?? '(no text in response)';
        await setResult(`http.fetch ${r.status} -> ${fact}`);
      } catch (e) {
        await setResult(`http.fetch ERROR -> ${(e as Error).message}`);
      }
    });

    // === exec ===
    panel.onAction('exec-run', async () => {
      try {
        const r = await onda.exec.run('uname -a');
        await setResult(
          `exec.run code=${r.code}\nstdout: ${r.stdout.trim()}\nstderr: ${r.stderr.trim()}`
        );
      } catch (e) {
        await setResult(`exec.run ERROR -> ${(e as Error).message}`);
      }
    });

    // === terminal:read ===
    panel.onAction('terminal-read', async () => {
      try {
        const r = await onda.terminal.getLastLines(20);
        const tail = r.content.slice(-200);
        await setResult(`terminal.getLastLines(20) tail:\n${tail}`);
      } catch (e) {
        await setResult(`terminal.read ERROR -> ${(e as Error).message}`);
      }
    });

    // === terminal:write ===
    panel.onAction('terminal-write', async () => {
      try {
        await onda.terminal.write('echo "Hello from Capability Demo plugin"\n');
        await setResult('terminal.write OK -> wrote echo to active terminal');
      } catch (e) {
        await setResult(`terminal.write ERROR -> ${(e as Error).message}`);
      }
    });

    // === themes (activate) ===
    // Theme contribution is declared in manifest.contributes.themes.
    // The host registers it automatically and prefixes the id with pluginId.
    panel.onAction('theme-activate', async () => {
      try {
        const themeId = `${PLUGIN_ID}:demo-dark`;
        const themes = (onda as unknown as {
          themes: { activate: (id: string) => Promise<unknown> };
        }).themes;
        await themes.activate(themeId);
        await setResult(`themes.activate("${themeId}") OK`);
      } catch (e) {
        await setResult(`themes.activate ERROR -> ${(e as Error).message}`);
      }
    });

    log('Ready. Press Cmd+Shift+Y or click the statusbar item to open.');
  },

  async onDeactivate() {
    log('Deactivated');
  },
};

function log(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.log(`[${PLUGIN_ID}]`, ...args);
}

self.__ondaPlugin = plugin;

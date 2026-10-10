import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import '../helpers/vscodeStubRegister';
import type * as vscode from 'vscode';
import {
  buildPreviewCoreHtml,
  PREVIEW_CORE_DIR,
  TEMPLATE_CORE_SCRIPTS,
  TEMPLATE_CORE_STYLES,
} from '../../src/templateEditor/previewCoreHtml';
import { checkOffsetEdits, textHash } from '../../src/templateEditor/webviewTextEdits';

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const coreRoot = path.join(repoRoot, ...PREVIEW_CORE_DIR);

const mockWebview = {
  cspSource: 'vscode-test-csp',
  asWebviewUri: (uri: { toString(): string }) => ({ toString: () => `webview:${uri.toString()}` }),
} as unknown as vscode.Webview;

suite('templateEditor', () => {
  test('textHash is 32-bit FNV-1a over UTF-16 code units', () => {
    assert.strictEqual(textHash(''), 0x811c9dc5);
    assert.strictEqual(textHash('a'), 0xe40c292c);
    assert.notStrictEqual(textHash('Шапка'), textHash('Шапкa'));
  });

  test('the webview hashes text exactly as the extension does', () => {
    const host = fs.readFileSync(path.join(coreRoot, 'host', 'template-editor.js'), 'utf8');
    const source = /function hash\(value\) \{[\s\S]*?\n {2}\}/.exec(host);
    assert.ok(source, 'hash() not found in host/template-editor.js');
    const webviewHash = new Function(`${source[0]}; return hash;`)() as (v: string) => number;
    for (const sample of ['', '<document/>', 'Товар\r\nКоличество', '\u{1F600} x'.repeat(50)]) {
      assert.strictEqual(webviewHash(sample), textHash(sample));
    }
  });

  test('checkOffsetEdits accepts ascending, non-overlapping ranges inside the text', () => {
    const edits = [
      { start: 0, end: 2, text: 'ab' },
      { start: 2, end: 2, text: 'x' },
      { start: 5, end: 10, text: '' },
    ];
    assert.deepStrictEqual(checkOffsetEdits(edits, 10), edits);
    assert.deepStrictEqual(checkOffsetEdits([], 0), []);
  });

  test('checkOffsetEdits rejects malformed input', () => {
    assert.strictEqual(checkOffsetEdits(null, 10), null);
    assert.strictEqual(checkOffsetEdits({ start: 0 }, 10), null);
    assert.strictEqual(checkOffsetEdits([{ start: 0, end: 11, text: '' }], 10), null);
    assert.strictEqual(checkOffsetEdits([{ start: 3, end: 2, text: '' }], 10), null);
    assert.strictEqual(
      checkOffsetEdits(
        [
          { start: 0, end: 5, text: '' },
          { start: 4, end: 6, text: '' },
        ],
        10
      ),
      null
    );
    assert.strictEqual(checkOffsetEdits([{ start: 0.5, end: 1, text: '' }], 10), null);
    assert.strictEqual(checkOffsetEdits([{ start: 0, end: 1, text: 1 }], 10), null);
  });

  test('every page asset is vendored', () => {
    const assets = [
      ...TEMPLATE_CORE_SCRIPTS,
      ...TEMPLATE_CORE_STYLES,
      'host/template-editor.js',
      'host/template-diff.js',
    ];
    for (const rel of assets) {
      assert.ok(fs.existsSync(path.join(coreRoot, ...rel.split('/'))), `missing ${rel}`);
    }
  });

  test('page HTML loads every script with the nonce and a strict CSP', () => {
    const extensionUri = { fsPath: repoRoot, scheme: 'file' } as unknown as vscode.Uri;
    const html = buildPreviewCoreHtml(
      mockWebview,
      extensionUri,
      {
        title: 'Макет <1С>',
        body: '<div id="x"></div>',
        scripts: ['a.js', 'host/b.js'],
        styles: ['c.css'],
      },
      'NONCE'
    );
    assert.ok(html.includes("script-src 'nonce-NONCE'"));
    assert.ok(!/script-src[^;]*unsafe-inline/.test(html));
    assert.ok(html.includes('vscode-test-csp'));
    assert.strictEqual(
      (html.match(/<script nonce="NONCE" src="webview:file:\/\/\//g) || []).length,
      2
    );
    assert.ok(html.includes('preview-core/host/b.js'));
    assert.ok(html.includes('<link rel="stylesheet" href="webview:file:///'));
    assert.ok(html.includes('<title>Макет &lt;1С&gt;</title>'));
    assert.ok(html.indexOf('<div id="x"></div>') < html.indexOf('<script'));
  });
});

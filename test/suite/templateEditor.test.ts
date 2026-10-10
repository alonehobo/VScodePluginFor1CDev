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
import { checkOffsetEdits } from '../../src/templateEditor/webviewTextEdits';
import { TemplateEditorProvider } from '../../src/templateEditor/templateEditorProvider';
import { vscodeStub, vscodeTestState } from '../helpers/vscodeModuleStub';

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const coreRoot = path.join(repoRoot, ...PREVIEW_CORE_DIR);

const mockWebview = {
  cspSource: 'vscode-test-csp',
  asWebviewUri: (uri: { toString(): string }) => ({ toString: () => `webview:${uri.toString()}` }),
} as unknown as vscode.Webview;

suite('templateEditor', () => {
  test('rejects a stale document version even for a known FNV-1a collision', async () => {
    const base = '<document><!--h3m2j4--></document>';
    const current = '<document><!--f3kxcm--></document>';
    assert.strictEqual(fnv1a(base), 4181877899);
    assert.strictEqual(fnv1a(current), 4181877899);

    let appliedEdit: unknown;
    const previousApplyEdit = vscodeTestState.applyEditImpl;
    vscodeTestState.applyEditImpl = async (edit: unknown) => {
      appliedEdit = edit;
      return true;
    };
    try {
      const document = {
        getText: () => current,
        version: 2,
        uri: { toString: () => 'file:///template.xml' },
        positionAt: (offset: number) => new vscodeStub.Position(0, offset),
      } as unknown as vscode.TextDocument;
      const provider = new TemplateEditorProvider({} as vscode.Uri) as unknown as {
        applyEdit(
          document: vscode.TextDocument,
          message: unknown
        ): Promise<boolean>;
      };

      const applied = await provider.applyEdit(document, {
        type: 'edit',
        baseVersion: 1,
        edits: [{ start: 0, end: 10, text: '<replacement' }],
      });

      assert.strictEqual(applied, false);
      assert.strictEqual(appliedEdit, undefined);
    } finally {
      vscodeTestState.applyEditImpl = previousApplyEdit;
    }
  });

  test('applies offset edits when the document version still matches', async () => {
    let appliedEdit: { replaces: Array<{ range: unknown; newText: string }> } | undefined;
    const previousApplyEdit = vscodeTestState.applyEditImpl;
    vscodeTestState.applyEditImpl = async (edit: { replaces: Array<{ range: unknown; newText: string }> }) => {
      appliedEdit = edit;
      return true;
    };
    try {
      const document = {
        getText: () => '<document/>',
        version: 7,
        uri: { toString: () => 'file:///template.xml' },
        positionAt: (offset: number) => new vscodeStub.Position(0, offset),
      } as unknown as vscode.TextDocument;
      const provider = new TemplateEditorProvider({} as vscode.Uri) as unknown as {
        applyEdit(document: vscode.TextDocument, message: unknown): Promise<boolean>;
      };

      const applied = await provider.applyEdit(document, {
        type: 'edit',
        baseVersion: 7,
        edits: [{ start: 0, end: 10, text: '<replacement' }],
      });

      assert.strictEqual(applied, true);
      assert.strictEqual(appliedEdit?.replaces.length, 1);
      assert.strictEqual(appliedEdit?.replaces[0].newText, '<replacement');
    } finally {
      vscodeTestState.applyEditImpl = previousApplyEdit;
    }
  });

  test('the webview sends a document version with edits instead of a text hash', () => {
    const host = fs.readFileSync(path.join(coreRoot, 'host', 'template-editor.js'), 'utf8');
    assert.ok(host.includes('var baseVersion = documentVersion'));
    assert.ok(host.includes('baseVersion: baseVersion'));
    assert.ok(host.includes('Number.isSafeInteger(msg.version)'));
    assert.ok(!host.includes('function hash('));
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

function fnv1a(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

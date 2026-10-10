import * as vscode from 'vscode';
import { buildWebviewCsp, createNonce } from '../utils/webviewSecurity';

/** Folder of the vendored preview-core modules (see resources/preview-core/UPSTREAM.md). */
export const PREVIEW_CORE_DIR = ['resources', 'preview-core'];

/** Modules the spreadsheet template pages load, in dependency order. */
export const TEMPLATE_CORE_SCRIPTS = [
  'xml-util.js',
  'doc-edits.js',
  'diff-nav.js',
  'font-editor.js',
  'template-preview.js',
  'template-markup.js',
  'template-edit.js',
  'template-diff.js',
  'template-diff-view.js',
];

export const TEMPLATE_CORE_STYLES = ['template.css', 'host/host.css'];

/**
 * Modules the data composition schema pages load. host/pictures.js comes
 * first: it answers the platform picture paths the schema window asks for.
 * The template comparison provides the splitter and the styles of the schema
 * comparison; host/query-core.js is the query parser the schema window reads a
 * data set's query with to fill its fields.
 */
export const DCS_CORE_SCRIPTS = [
  'host/pictures.js',
  'xml-util.js',
  'diff-nav.js',
  'template-preview.js',
  'template-diff-view.js',
  'host/query-core.js',
  'dcs-preview.js',
  'dcs-diff.js',
  'dcs-diff-view.js',
];

export const DCS_CORE_STYLES = ['template.css', 'dcs.css', 'dcs-edit.css', 'host/host.css'];

/** True when an Ext/Template.xml holds a data composition schema rather than a spreadsheet. */
export function isDataCompositionSchema(xml: string): boolean {
  // Walk the prolog once so untrusted comments cannot trigger regex backtracking.
  let at = skipWhitespace(xml, 0);
  if (xml.charAt(at) === '\uFEFF') {
    at = skipWhitespace(xml, at + 1);
  }

  if (xml.startsWith('<?xml', at)) {
    const declarationEnd = xml.indexOf('?>', at + 5);
    if (declarationEnd < 0) {
      return false;
    }
    at = skipWhitespace(xml, declarationEnd + 2);
  }

  while (xml.startsWith('<!--', at)) {
    const commentEnd = xml.indexOf('-->', at + 4);
    if (commentEnd < 0) {
      return false;
    }
    at = skipWhitespace(xml, commentEnd + 3);
  }

  if (xml.charAt(at) !== '<') {
    return false;
  }

  const nameStart = at + 1;
  let prefixEnd = nameStart;
  while (isWordCharacter(xml.charCodeAt(prefixEnd))) {
    prefixEnd++;
  }
  const rootStart = prefixEnd > nameStart && xml.charAt(prefixEnd) === ':'
    ? prefixEnd + 1
    : nameStart;
  const rootName = 'DataCompositionSchema';
  if (!xml.startsWith(rootName, rootStart)) {
    return false;
  }

  const delimiter = xml.charAt(rootStart + rootName.length);
  return delimiter === '>' || isWhitespace(delimiter);
}

function skipWhitespace(xml: string, at: number): number {
  while (at < xml.length && isWhitespace(xml.charAt(at))) {
    at++;
  }
  return at;
}

function isWhitespace(value: string): boolean {
  return /\s/.test(value);
}

function isWordCharacter(value: number): boolean {
  return (
    (value >= 0x30 && value <= 0x39) ||
    (value >= 0x41 && value <= 0x5a) ||
    (value >= 0x61 && value <= 0x7a) ||
    value === 0x5f
  );
}

export interface PreviewCorePage {
  title: string;
  /** Static markup of the page body; the host script fills it. */
  body: string;
  scripts: string[];
  styles: string[];
}

export function previewCoreRoot(extensionUri: vscode.Uri): vscode.Uri {
  return vscode.Uri.joinPath(extensionUri, ...PREVIEW_CORE_DIR);
}

/**
 * HTML of a webview page built from preview-core modules: every script carries
 * the nonce, styles come from the extension folder; inline styles stay allowed
 * because the renderers size cells and panes through element.style.
 */
export function buildPreviewCoreHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  page: PreviewCorePage,
  nonce: string = createNonce()
): string {
  const root = previewCoreRoot(extensionUri);
  const csp = buildWebviewCsp({
    nonce,
    cspSource: webview.cspSource,
    allowUnsafeInlineStyles: true,
    imgSources: [webview.cspSource, 'data:'],
    fontSources: [webview.cspSource],
  });
  const asset = (rel: string): string =>
    webview.asWebviewUri(vscode.Uri.joinPath(root, ...rel.split('/'))).toString();
  const styles = page.styles
    .map((rel) => `  <link rel="stylesheet" href="${escapeAttr(asset(rel))}">`)
    .join('\n');
  const scripts = page.scripts
    .map((rel) => `  <script nonce="${nonce}" src="${escapeAttr(asset(rel))}"></script>`)
    .join('\n');
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="${escapeAttr(csp)}">
  <title>${escapeHtml(page.title)}</title>
${styles}
</head>
<body>
${page.body}
${scripts}
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

import * as vscode from 'vscode';
import { Logger } from '../utils/logger';
import {
  buildPreviewCoreHtml,
  previewCoreRoot,
  TEMPLATE_CORE_SCRIPTS,
  TEMPLATE_CORE_STYLES,
} from './previewCoreHtml';
import { checkOffsetEdits } from './webviewTextEdits';

export const TEMPLATE_EDITOR_VIEW_TYPE = '1c-template-editor';

const TEMPLATE_EDITOR_BODY = `<div id="te-app">
  <div id="form-preview"></div>
  <div id="outline-panel"><div id="property-inspector"></div></div>
  <div id="sb-status"></div>
</div>`;

interface EditMessage {
  type: 'edit';
  baseVersion: number;
  edits: unknown;
}

function isEditMessage(msg: unknown): msg is EditMessage {
  return !!msg && typeof msg === 'object' && (msg as { type?: unknown }).type === 'edit';
}

/**
 * Visual editor of a spreadsheet template (Ext/Template.xml): the sheet as the
 * Designer draws it, cell editing, formatting, named areas and parameters.
 * The document stays a TextDocument, so undo, redo, dirty state, saving and
 * the plain XML editor beside it all keep working as usual.
 */
export class TemplateEditorProvider implements vscode.CustomTextEditorProvider {
  constructor(private readonly extensionUri: vscode.Uri) {}

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel
  ): Promise<void> {
    const webview = webviewPanel.webview;
    webview.options = {
      enableScripts: true,
      localResourceRoots: [previewCoreRoot(this.extensionUri)],
    };
    const readOnly = (): boolean =>
      vscode.workspace.fs.isWritableFileSystem(document.uri.scheme) === false;
    const post = (error?: string): void => {
      void webview.postMessage({
        type: 'update',
        text: document.getText(),
        version: document.version,
        readOnly: readOnly(),
        error,
      });
    };

    const changes = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === document.uri.toString() && e.contentChanges.length > 0) {
        post();
      }
    });
    webviewPanel.onDidDispose(() => changes.dispose());

    let pendingEdits: Promise<void> = Promise.resolve();
    webview.onDidReceiveMessage((msg: unknown) => {
      if (msg && typeof msg === 'object' && (msg as { type?: unknown }).type === 'ready') {
        post();
        return;
      }
      if (!isEditMessage(msg)) {
        return;
      }
      pendingEdits = pendingEdits.then(async () => {
        try {
          const applied = await this.applyEdit(document, msg);
          if (!applied) {
            post('Документ изменился во время правки; показан текущий текст.');
          }
        } catch (err) {
          Logger.error('Template editor: failed to apply edit', err);
          post('Не удалось применить правку.');
        }
      });
    });

    /* Last: the page posts 'ready' as soon as it loads, and the listener
     * above has to be in place by then. */
    webview.html = buildPreviewCoreHtml(webview, this.extensionUri, {
      title: 'Макет 1С',
      body: TEMPLATE_EDITOR_BODY,
      scripts: [...TEMPLATE_CORE_SCRIPTS, 'host/template-editor.js'],
      styles: TEMPLATE_CORE_STYLES,
    });
  }

  private async applyEdit(document: vscode.TextDocument, msg: EditMessage): Promise<boolean> {
    const version = document.version;
    if (!Number.isSafeInteger(msg.baseVersion) || msg.baseVersion !== version) {
      return false;
    }

    const text = document.getText();
    const edits = checkOffsetEdits(msg.edits, text.length);
    if (!edits) {
      return false;
    }
    if (edits.length === 0) {
      return true;
    }

    if (document.version !== version) {
      return false;
    }

    let editor = vscode.window.visibleTextEditors?.find(
      (editor) => editor.document.uri.toString() === document.uri.toString()
    );
    const openedTextEditor = !editor;
    const activeTabBeforeShow = vscode.window.tabGroups?.activeTabGroup?.activeTab;
    const activeInputBeforeShow = activeTabBeforeShow?.input;
    const customEditorWasActive = typeof vscode.TabInputCustom !== 'undefined'
      && activeInputBeforeShow instanceof vscode.TabInputCustom
      && activeInputBeforeShow.viewType === TEMPLATE_EDITOR_VIEW_TYPE
      && activeInputBeforeShow.uri.toString() === document.uri.toString();
    if (!editor && vscode.window.tabGroups && !customEditorWasActive) {
      return false;
    }
    if (!editor) {
      // WorkspaceEdit has no expected-version field. A visible TextEditor is
      // needed because TextEditor.edit submits its captured document version
      // with the transaction. Keep this text tab open: closing it while the
      // shared document is dirty can discard the edit.
      try {
        editor = await vscode.window.showTextDocument(document, {
          preserveFocus: true,
          preview: false,
        });
      } catch {
        return false;
      }
    }

    try {
      if (document.version !== version) {
        return false;
      }
      return await editor.edit((builder) => {
        for (const e of edits) {
          builder.replace(
            new vscode.Range(document.positionAt(e.start), document.positionAt(e.end)),
            e.text
          );
        }
      });
    } finally {
      if (openedTextEditor && customEditorWasActive && vscode.window.activeTextEditor === editor) {
        try {
          await vscode.commands.executeCommand(
            'vscode.openWith',
            document.uri,
            TEMPLATE_EDITOR_VIEW_TYPE,
            { preview: false }
          );
        } catch (err) {
          Logger.warn('Template editor: failed to return to custom editor after a versioned edit', err);
        }
      }
    }
  }
}

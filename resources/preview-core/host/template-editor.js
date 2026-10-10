/* Webview side of the 1C spreadsheet template editor (Ext/Template.xml).
 *
 * The extension owns the TextDocument; this page draws it with TemplatePreview,
 * edits it through TemplateEdit/TemplateMarkup and hands every change back as
 * text ranges computed against the document text it was drawn from. The
 * extension applies them as one WorkspaceEdit, so undo, redo, dirty state and
 * saving stay VS Code's own. A change that arrives from elsewhere (the text
 * editor, git, undo) comes back here as 'update' and redraws the sheet. */
(function () {
  'use strict';

  var vscode = acquireVsCodeApi();
  var host = document.getElementById('form-preview');
  var side = document.getElementById('property-inspector');
  var statusEl = document.getElementById('sb-status');

  /* Spare rows and columns past the document, so there is somewhere to write
   * below and to the right of the last cell; they become real once used. */
  var TRAILING_ROWS = 3;
  var TRAILING_COLUMNS = 2;

  var text = '';
  var readOnly = false;
  var model = null;
  var session = null;
  var toolbar = null;
  var panel = null;
  var selection = null;
  var statusTimer = null;

  /* 32-bit FNV-1a over UTF-16 code units; the extension computes the same. */
  function hash(value) {
    var h = 0x811c9dc5;
    for (var i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h;
  }

  function syncTheme() {
    var cls = document.body.classList;
    var dark = cls.contains('vscode-dark') || cls.contains('vscode-high-contrast');
    document.documentElement.classList.toggle('theme-dark', dark);
    document.documentElement.classList.toggle('theme-light', !dark);
    document.getElementById('outline-panel').classList.toggle('dark', dark);
  }

  function status(message, isError) {
    statusEl.textContent = message || '';
    statusEl.classList.toggle('error', !!(message && isError));
    if (statusTimer) clearTimeout(statusTimer);
    if (message) statusTimer = setTimeout(function () { status(''); }, isError ? 6000 : 9000);
  }

  /* An engine refusal. The engines also report '' once a field is left;
   * that must not wipe a message the extension has just shown. */
  function refusal(message) {
    if (message) status(message, true);
  }

  function sheetModel(parsed) {
    var P = window.TemplatePreview;
    if (readOnly) return parsed;
    return P.withTrailingColumns(P.withTrailingRows(parsed, TRAILING_ROWS), TRAILING_COLUMNS);
  }

  function renderPanel() {
    if (readOnly || !session) {
      side.innerHTML = '';
      panel = null;
      return;
    }
    if (panel) {
      panel.setSession(session);
      return;
    }
    panel = window.TemplateEdit.properties(document, session, {
      model: function () { return model; },
      readOnly: readOnly,
      onError: refusal,
      onNote: function (m) { status(m, false); }
    });
    side.innerHTML = '';
    if (panel) side.appendChild(panel.element);
  }

  function attach() {
    if (session) session.destroy();
    session = null;
    toolbar = null;
    var options = {
      model: model,
      xml: function () { return text; },
      readOnly: readOnly,
      onError: refusal,
      onSelect: function (next) {
        selection = next;
        if (toolbar) toolbar.sync();
        renderPanel();
      }
    };
    if (!readOnly) {
      options.apply = function (edits, next, _result, dirty) {
        /* Optimistic: the page shows the change at once. The ranges are
         * offsets into the text this page holds, so the extension applies
         * them only while the document still hashes the same, and otherwise
         * sends its current text back. */
        var base = hash(text);
        text = next;
        vscode.postMessage({ type: 'edit', base: base, edits: edits });
        status('');
        afterEdit(dirty);
      };
    }
    session = window.TemplateEdit.attach(host, options) || null;
    if (!session) return;
    if (!readOnly) {
      toolbar = window.TemplateEdit.toolbar(document, session, {
        model: function () { return model; },
        readOnly: readOnly,
        onError: refusal
      }) || null;
      if (toolbar) host.insertBefore(toolbar.element, host.firstChild);
    }
    if (selection) session.select(selection);
    else if (toolbar) toolbar.sync();
    renderPanel();
  }

  function draw() {
    var P = window.TemplatePreview;
    var scroll = host.querySelector('.tp-scroll');
    var top = scroll ? scroll.scrollTop : 0;
    var left = scroll ? scroll.scrollLeft : 0;
    var parsed = P.detect(text) ? P.parse(text) : { error: 'файл не является табличным документом' };
    if (parsed.error) {
      if (session) session.destroy();
      session = null;
      model = null;
      host.className = '';
      host.innerHTML = '';
      side.innerHTML = '';
      panel = null;
      var note = document.createElement('div');
      note.className = 'te-error';
      note.textContent = 'Не удалось показать макет: ' + parsed.error;
      host.appendChild(note);
      return;
    }
    model = sheetModel(parsed.model);
    P.render(model, host, {});
    var back = host.querySelector('.tp-scroll');
    if (back) {
      back.scrollTop = top;
      back.scrollLeft = left;
    }
    attach();
  }

  /* A change inside a few cells is patched into the drawn rows; anything
   * structural (rows, columns, areas) redraws the sheet. */
  function afterEdit(dirty) {
    var P = window.TemplatePreview;
    if (session && dirty && !dirty.structural) {
      var parsed = P.parse(text);
      var next = parsed.error ? null : sheetModel(parsed.model);
      if (next && P.update(next, host, dirty)) {
        model = next;
        session.setModel(next);
        if (toolbar) toolbar.sync();
        renderPanel();
        return;
      }
    }
    draw();
  }

  window.addEventListener('message', function (event) {
    var msg = event.data || {};
    if (msg.type !== 'update') return;
    readOnly = !!msg.readOnly;
    if (msg.text === text && model) return;
    text = msg.text;
    document.getElementById('te-app').classList.toggle('te-readonly', readOnly);
    draw();
    /* After the redraw: attaching a session clears the line. */
    if (msg.error) status(msg.error, true);
  });

  new MutationObserver(syncTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  syncTheme();
  vscode.postMessage({ type: 'ready' });
})();

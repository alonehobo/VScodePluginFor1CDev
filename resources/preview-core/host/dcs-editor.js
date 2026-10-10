/* Webview side of the data composition schema editor (a Template.xml whose
 * root is DataCompositionSchema).
 *
 * DcsPreview draws the Designer's schema window and computes every change as
 * one text edit of the elements it touches. This page applies the edit to its
 * copy of the text at once and hands it to the extension together with a hash
 * of the text it was computed against; the extension applies it as a
 * WorkspaceEdit while the document still matches, so undo, redo and saving stay
 * VS Code's own. A change from elsewhere arrives as 'update' and redraws the
 * window. */
(function () {
  'use strict';

  var vscode = acquireVsCodeApi();
  var host = document.getElementById('form-preview');
  var statusEl = document.getElementById('sb-status');

  var text = '';
  var readOnly = false;
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
  }

  function status(message, isError) {
    statusEl.textContent = message || '';
    statusEl.classList.toggle('error', !!(message && isError));
    if (statusTimer) clearTimeout(statusTimer);
    if (message) statusTimer = setTimeout(function () { status(''); }, isError ? 6000 : 9000);
  }

  function parsed() {
    var result = window.DcsPreview.parse(text);
    return result && result.model ? result.model : null;
  }

  /* One edit { start, end, text } over the current text. */
  function commit(edit) {
    if (!edit) return null;
    if (edit.error) return { error: edit.error };
    var base = hash(text);
    text = text.slice(0, edit.start) + edit.text + text.slice(edit.end);
    vscode.postMessage({ type: 'edit', base: base, edits: [{ start: edit.start, end: edit.end, text: edit.text }] });
    return { source: text, id: edit.id };
  }

  function onPropertyEdit(id, prop, value) {
    var model = parsed();
    if (!model) return null;
    return commit(window.DcsPreview.schemaEdit(model, { op: 'set', id: id, prop: prop, value: value }));
  }

  function onSchemaEdit(compute) {
    var model = parsed();
    return model ? commit(compute(model)) : null;
  }

  /* The query text of a data set: a plain text area. The window writes the
   * text when the field is left or typing pauses, and refills the set's
   * fields (onSettle) once the field is left. */
  function queryEditor(area, value, opts) {
    var box = document.createElement('textarea');
    box.className = 'dcs-host-query';
    box.spellcheck = false;
    box.value = value || '';
    box.readOnly = !!opts.readOnly;
    area.appendChild(box);
    var written = box.value;
    var timer = null;
    function flush() {
      if (timer) { clearTimeout(timer); timer = null; }
      if (opts.onChange && box.value !== written) {
        written = box.value;
        opts.onChange(written);
        return true;
      }
      return false;
    }
    box.addEventListener('input', function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, 600);
    });
    box.addEventListener('blur', function () {
      var changed = flush();
      if ((changed || written !== value) && opts.onSettle) opts.onSettle();
    });
    return {
      dispose: function () {
        flush();
        if (box.parentNode) box.parentNode.removeChild(box);
      }
    };
  }

  function draw() {
    var result = window.DcsPreview.detect(text)
      ? window.DcsPreview.parse(text)
      : { error: 'файл не является схемой компоновки данных' };
    if (!result || result.error || !result.model) {
      host.className = '';
      host.innerHTML = '';
      var note = document.createElement('div');
      note.className = 'te-error';
      note.textContent = 'Не удалось показать схему: ' + ((result && result.error) || 'нет модели');
      host.appendChild(note);
      return;
    }
    var editable = !readOnly;
    window.DcsPreview.render(result.model, host, {
      queryEditor: queryEditor,
      onPropertyEdit: editable ? onPropertyEdit : null,
      onSchemaEdit: editable ? onSchemaEdit : null
    });
  }

  window.addEventListener('message', function (event) {
    var msg = event.data || {};
    if (msg.type !== 'update') return;
    readOnly = !!msg.readOnly;
    if (msg.text === text && host.firstChild) return;
    text = msg.text;
    draw();
    if (msg.error) status(msg.error, true);
  });

  new MutationObserver(syncTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  syncTheme();
  vscode.postMessage({ type: 'ready' });
})();

/* Webview side of the spreadsheet template comparison: two Template.xml
 * versions drawn side by side by TemplateDiffView, differences marked on the
 * grid and listed below. Read-only; «XML» asks the extension for the plain
 * text diff of the same two versions. */
(function () {
  'use strict';

  var vscode = acquireVsCodeApi();
  var host = document.getElementById('diff-panel');

  function syncTheme() {
    var cls = document.body.classList;
    var dark = cls.contains('vscode-dark') || cls.contains('vscode-high-contrast');
    document.documentElement.classList.toggle('theme-dark', dark);
    document.documentElement.classList.toggle('theme-light', !dark);
  }

  function fail(message) {
    host.innerHTML = '';
    var note = document.createElement('div');
    note.className = 'te-error';
    note.textContent = message;
    host.appendChild(note);
  }

  function never() { return false; }

  function show(msg) {
    var P = window.TemplatePreview;
    var left = P.parse(msg.left.text || '<document/>');
    var right = P.parse(msg.right.text || '<document/>');
    if (left.error || right.error) {
      fail('Не удалось разобрать макет: ' + (left.error || right.error));
      return;
    }
    var diff = window.TemplateDiff.compare(left.model, right.model);
    if (diff.error) {
      fail('Не удалось сравнить макеты: ' + diff.error);
      return;
    }
    host.innerHTML = '';
    window.TemplateDiffView.render(document, host, {
      left: { model: left.model, label: msg.left.label },
      right: { model: right.model, label: msg.right.label },
      diff: diff,
      canRestore: never,
      onRestore: never,
      onShowXml: function () { vscode.postMessage({ type: 'showXml' }); }
    });
    /* Upstream opens the panes at two thirds of the page; an editor tab is
     * shorter than its window, so the list starts at half. The splitter
     * still moves it. */
    var panes = host.querySelector('.tpd-panes');
    if (panes) panes.style.flex = '0 1 50%';
  }

  window.addEventListener('message', function (event) {
    var msg = event.data || {};
    if (msg.type === 'show') show(msg);
  });

  new MutationObserver(syncTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  syncTheme();
  vscode.postMessage({ type: 'ready' });
})();

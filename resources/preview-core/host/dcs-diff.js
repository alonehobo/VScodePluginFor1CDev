/* Webview side of the data composition schema comparison: both schemas as
 * ordinary schema windows side by side, the described changes below, query
 * texts compared line by line. Read-only; «XML» asks the extension for the
 * plain text diff of the same two versions. */
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
    var diff = window.DcsDiff.compareXml(msg.left.text || '', msg.right.text || '');
    if (diff.error) {
      fail('Не удалось сравнить схемы: ' + diff.error);
      return;
    }
    host.innerHTML = '';
    window.DcsDiffView.render(document, host, {
      diff: diff,
      leftLabel: msg.left.label,
      rightLabel: msg.right.label,
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

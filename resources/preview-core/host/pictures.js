/* Icons for the data composition schema window.
 *
 * Upstream draws its toolbar and tree with the platform's standard pictures,
 * which are not redistributable and are not bundled here. The modules still
 * ask for them by their usual paths ('std-pictures/<Name>.png'); this file
 * answers those paths with simple 16x16 icons drawn for this extension, so the
 * modules stay unmodified. An unknown name gets a neutral dot rather than a
 * broken image. */
(function () {
  'use strict';

  var INK = '#4f6378';
  var ACCENT = '#2f7d32';
  var WARN = '#c0392b';
  var GOLD = '#c9a227';

  function svg(body) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" ' +
      'stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>');
  }

  var folder = '<path d="M1.5 4.5h4l1.5 1.5h7.5v7.5h-13z" fill="#f3d27a" stroke="' + GOLD + '"/>';
  var table = '<rect x="2" y="3" width="12" height="10" stroke="' + INK + '"/>' +
    '<path d="M2 6.5h12M2 9.8h12M6 3v10" stroke="' + INK + '"/>';
  var nested = '<rect x="1.5" y="1.5" width="10" height="9" stroke="' + INK + '"/>' +
    '<rect x="5" y="5.5" width="9.5" height="9" fill="#fff" stroke="' + ACCENT + '"/>';

  var ICONS = {
    Papka: folder,
    SozdatGruppu: folder + '<path d="M11.5 8v5M9 10.5h5" stroke="' + ACCENT + '"/>',
    NABOR: table,
    NovayaTablitsaKomponovkiDannykh: table,
    VlozhennayaTablitsa: '<path d="M6.5 9.5l3-3M5 7.5L3.5 9a2.1 2.1 0 003 3L8 10.5M11 8.5L12.5 7a2.1 2.1 0 00-3-3L8 5.5" stroke="' + INK + '"/>',
    KonstruktorZaprosaGruppaVremennykhTablits: '<rect x="1.5" y="2" width="9" height="6" stroke="' + INK + '"/>' +
      '<rect x="5.5" y="8" width="9" height="6" stroke="' + INK + '"/>',
    Rekvizit: '<rect x="2" y="5" width="12" height="6" stroke="' + INK + '"/><path d="M4.5 8h5" stroke="' + INK + '"/>',
    Izmerenie: '<path d="M2 12.5h12M2 12.5V3.5M5 12.5v-2M8 12.5v-3M11 12.5v-2" stroke="' + INK + '"/>',
    Resurs: '<path d="M12 3H4l4.5 5L4 13h8" stroke="' + ACCENT + '"/>',
    PolzovatelskiePolyaKomponovkiDannykh: '<path d="M7 3.5c-1.5 0-2 .8-2 2.2V13M3.5 7.5h4.5" stroke="' + INK + '"/>' +
      '<path d="M9.5 8l4 5M13.5 8l-4 5" stroke="' + ACCENT + '"/>',
    ParametryDannykhKomponovkiDannykh: '<rect x="2" y="2" width="12" height="12" rx="2" stroke="' + INK + '"/>' +
      '<path d="M6 12V4.5h2.5a2 2 0 010 4H6" stroke="' + INK + '"/>',
    NastroykaSpiska: '<rect x="2" y="2.5" width="12" height="11" stroke="' + INK + '"/>' +
      '<path d="M2 5.5h12M5 5.5v8" stroke="' + INK + '"/>',
    NovayaVlozhennayaSkhemaKomponovkiDannykh: nested,
    StandartnayaNastroykaKomponovkiDannykh: '<path d="M3 4h10M3 8h10M3 12h10" stroke="' + INK + '"/>' +
      '<circle cx="6" cy="4" r="1.4" fill="#fff" stroke="' + ACCENT + '"/><circle cx="10" cy="8" r="1.4" fill="#fff" stroke="' + ACCENT + '"/>' +
      '<circle cx="5" cy="12" r="1.4" fill="#fff" stroke="' + ACCENT + '"/>',
    NastroykiOtcheta: '<path d="M3.5 1.5h6l3 3v10h-9z" stroke="' + INK + '"/><path d="M5.5 8h5M5.5 10.5h5" stroke="' + INK + '"/>',
    Gruppirovka: '<path d="M3 2.5v10M3 4.5h4M3 8.5h4M9 4.5h4M9 8.5h4M9 12.5h4M3 12.5h4" stroke="' + INK + '"/>',
    NovayaDiagrammaKomponovkiDannykh: '<path d="M2 14h12" stroke="' + INK + '"/><rect x="3" y="8" width="2.5" height="6" fill="#9cc3e6" stroke="' + INK + '"/>' +
      '<rect x="6.8" y="4" width="2.5" height="10" fill="#9cc3e6" stroke="' + INK + '"/><rect x="10.6" y="6" width="2.5" height="8" fill="#9cc3e6" stroke="' + INK + '"/>',
    PolyaGruppirovkiKomponovkiDannykh: '<path d="M3 2v11h11" stroke="' + INK + '"/><path d="M5.5 10l3-3 2 2 3-4" stroke="' + ACCENT + '"/>',
    DobavitElementSpiska: '<path d="M8 3v10M3 8h10" stroke="' + ACCENT + '" stroke-width="1.8"/>',
    SkopirovatElementSpiska: '<rect x="2" y="2" width="8" height="9" stroke="' + INK + '"/><rect x="6" y="5" width="8" height="9" fill="#fff" stroke="' + INK + '"/>',
    IzmenitElementSpiska: '<path d="M3 13l1-3.5 7-7 2.5 2.5-7 7z" stroke="' + INK + '"/><path d="M9.5 4l2.5 2.5" stroke="' + INK + '"/>',
    UdalitElementSpiska: '<path d="M4 4l8 8M12 4l-8 8" stroke="' + WARN + '" stroke-width="1.8"/>',
    PeremestitVverkh: '<path d="M8 13V3.5M4 7.5l4-4 4 4" stroke="' + INK + '" stroke-width="1.6"/>',
    PeremestitVniz: '<path d="M8 3v9.5M4 8.5l4 4 4-4" stroke="' + INK + '" stroke-width="1.6"/>',
    Polzovatel: '<circle cx="8" cy="5.5" r="2.5" stroke="' + INK + '"/><path d="M3 14c.5-3 2.5-4.5 5-4.5s4.5 1.5 5 4.5" stroke="' + INK + '"/>'
  };
  var FALLBACK = '<circle cx="8" cy="8" r="2.5" fill="' + INK + '"/>';

  var cache = {};
  function resolve(src) {
    var m = /(?:^|\/)std-pictures\/([^/.?#]+)\.(?:png|svg)$/.exec(src || '');
    if (!m) return null;
    if (!cache[m[1]]) cache[m[1]] = svg(ICONS[m[1]] || FALLBACK);
    return cache[m[1]];
  }

  function fix(img) {
    var raw = img.getAttribute('src');
    var next = resolve(raw);
    if (next && raw !== next) img.setAttribute('src', next);
  }

  function scan(node) {
    if (node.nodeType !== 1) return;
    if (node.tagName === 'IMG') fix(node);
    var imgs = node.querySelectorAll ? node.querySelectorAll('img[src*="std-pictures/"]') : [];
    for (var i = 0; i < imgs.length; i++) fix(imgs[i]);
  }

  new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      if (r.type === 'attributes') fix(r.target);
      else for (var j = 0; j < r.addedNodes.length; j++) scan(r.addedNodes[j]);
    }
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });

  window.StdPictures = { resolve: resolve };
})();

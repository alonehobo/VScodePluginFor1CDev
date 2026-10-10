# Vendored preview-core modules from BslEdit

## Upstream

- **Repo:** https://github.com/alonehobo/BslEdit (`packages/1c-preview-core/browser/`)
- **License:** MIT, see `LICENSE` in this folder
- **Date:** 2026-10-10

The files are plain browser JavaScript (UMD-style, each module registers one
global such as `window.TemplatePreview`). They run inside the webview only;
`tsc` and ESLint do not process them. Fixes to these modules go upstream first
and arrive here with the next sync, so a local edit would be overwritten.

## Files

| File | Purpose |
|------|---------|
| `xml-util.js` | XML helpers shared by the parsers |
| `doc-edits.js` | line diff that turns a rewritten document into a few text edits |
| `diff-nav.js` | change list navigation for the comparison views |
| `font-editor.js` | font picker of the cell property panel |
| `template-preview.js` | `Template.xml` (SpreadsheetDocument) parser and Designer-style renderer |
| `template-markup.js` | editing engine: cells, formats, merges, named areas, parameters |
| `template-edit.js` | selection, keyboard, toolbar and property panel over the renderer |
| `template-diff.js` | semantic comparison of two templates (columns, rows, then cells) |
| `template-diff-view.js` | side-by-side comparison view with the change list |
| `template.css` | styles of the above, extracted from the upstream `viewer.css` |

`host/` holds the webview glue written for this extension
(`template-editor.js`, `template-diff.js`, `host.css`); it is maintained here.

## Обновление

Файлы синхронизируются из приватной рабочей копии BslEdit тем же экспортом,
что и публичный репозиторий BslEdit (санитизация и проверка на запрещённые
упоминания), затем обновляется дата в этом файле.

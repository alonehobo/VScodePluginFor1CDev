import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import '../helpers/vscodeStubRegister';
import {
  DCS_CORE_SCRIPTS,
  DCS_CORE_STYLES,
  isDataCompositionSchema,
  PREVIEW_CORE_DIR,
} from '../../src/templateEditor/previewCoreHtml';
import {
  DCS_EDITOR_PAGE,
  editorPageFor,
  TEMPLATE_EDITOR_PAGE,
} from '../../src/templateEditor/templateEditorProvider';

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const coreRoot = path.join(repoRoot, ...PREVIEW_CORE_DIR);
const fixtures = path.join(repoRoot, 'test', 'fixtures', 'preview-core');

suite('dcsEditor', () => {
  test('a schema and a spreadsheet are told apart by the root element', () => {
    const schema = fs.readFileSync(path.join(fixtures, 'Schema.xml'), 'utf8');
    const sheet = fs.readFileSync(path.join(fixtures, 'Template.xml'), 'utf8');
    assert.strictEqual(isDataCompositionSchema(schema), true);
    assert.strictEqual(isDataCompositionSchema('\uFEFF' + schema), true);
    assert.strictEqual(isDataCompositionSchema(sheet), false);
    assert.strictEqual(isDataCompositionSchema('<Root><DataCompositionSchema/></Root>'), false);
    assert.strictEqual(editorPageFor(schema), DCS_EDITOR_PAGE);
    assert.strictEqual(editorPageFor(sheet), TEMPLATE_EDITOR_PAGE);
    assert.strictEqual(editorPageFor(''), TEMPLATE_EDITOR_PAGE);
  });

  test('the schema page hashes text with the same function as the template page', () => {
    const hashOf = (page: string): string | undefined =>
      /function hash\(value\) \{[\s\S]*?\n {2}\}/.exec(
        fs.readFileSync(path.join(coreRoot, 'host', page), 'utf8')
      )?.[0];
    const schema = hashOf('dcs-editor.js');
    assert.ok(schema, 'hash() not found in host/dcs-editor.js');
    assert.strictEqual(schema, hashOf('template-editor.js'));
  });

  test('every schema page asset is vendored', () => {
    for (const rel of [
      ...DCS_CORE_SCRIPTS,
      ...DCS_CORE_STYLES,
      'host/dcs-editor.js',
      'host/dcs-diff.js',
    ]) {
      assert.ok(fs.existsSync(path.join(coreRoot, ...rel.split('/'))), `missing ${rel}`);
    }
  });

  test('every platform picture the schema window asks for has its own icon', () => {
    const preview = fs.readFileSync(path.join(coreRoot, 'dcs-preview.js'), 'utf8');
    const pictures = fs.readFileSync(path.join(coreRoot, 'host', 'pictures.js'), 'utf8');
    const asked = new Set(
      Array.from(preview.matchAll(/std-pictures\/(\w+)\.(?:png|svg)/g), (m) => m[1])
    );
    assert.ok(asked.size > 10, 'expected the schema window to reference its pictures');
    const icons = /var ICONS = \{([\s\S]*?)\n {2}\};/.exec(pictures);
    assert.ok(icons, 'ICONS not found in host/pictures.js');
    const drawn = new Set(Array.from(icons[1].matchAll(/^\s{4}(\w+):/gm), (m) => m[1]));
    const missing = [...asked].filter((name) => !drawn.has(name));
    assert.deepStrictEqual(missing, []);
  });

  test('no platform picture files are bundled', () => {
    assert.strictEqual(fs.existsSync(path.join(coreRoot, 'std-pictures')), false);
  });
});

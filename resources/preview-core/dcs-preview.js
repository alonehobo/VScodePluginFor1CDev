(function (root) {
'use strict';

var XU = root.XmlUtil;
var localName = XU.localName;
var namedChildren = XU.namedChildren;
var firstChild = XU.firstChild;
var textOf = XU.textOf;
var localizedFrom = XU.localizedFrom;
var terms = XU.terms;

function own(map, key) {
    return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : '';
}

// ----------------------------------------------------------------- terms

var SET_KINDS = {
    DataSetQuery: 'Запрос', DataSetObject: 'Объект', DataSetUnion: 'Объединение'
};

var COMPARISON = {
    Equal: 'Равно', NotEqual: 'Не равно', Less: 'Меньше', LessOrEqual: 'Меньше или равно',
    Greater: 'Больше', GreaterOrEqual: 'Больше или равно', InList: 'В списке', NotInList: 'Не в списке',
    InListByHierarchy: 'В группе из списка', NotInListByHierarchy: 'Не в группе из списка',
    InHierarchy: 'В группе', NotInHierarchy: 'Не в группе', Contains: 'Содержит',
    NotContains: 'Не содержит', BeginsWith: 'Начинается с', NotBeginsWith: 'Не начинается с',
    Like: 'Соответствует шаблону', NotLike: 'Не соответствует шаблону', Filled: 'Заполнено', NotFilled: 'Не заполнено'
};

var FILTER_GROUPS = { AndGroup: 'Группа И', OrGroup: 'Группа ИЛИ', NotGroup: 'Группа НЕ' };

var GROUP_TYPES = { Items: 'Без иерархии', Hierarchy: 'Иерархия', HierarchyOnly: 'Только иерархия' };

var PERIOD_ADDITION = {
    None: 'Без дополнения', Second: 'Секунда', Minute: 'Минута', Hour: 'Час', Day: 'День', Week: 'Неделя',
    TenDays: 'Декада', Month: 'Месяц', Quarter: 'Квартал', HalfYear: 'Полугодие', Year: 'Год'
};

var TEMPLATE_TYPES = {
    Header: 'Заголовок', Footer: 'Подвал', OverallHeader: 'Общий заголовок', OverallFooter: 'Общий подвал'
};

var TEMPLATE_KINDS = {
    template: 'Макет', groupTemplate: 'Макет группировки', groupHeaderTemplate: 'Макет заголовка группировки',
    fieldTemplate: 'Макет поля', totalFieldsTemplate: 'Макет полей итога'
};

var PARAMETER_USE = { Always: 'Всегда', Auto: 'Авто' };

/* Where a folder of selected fields puts its fields. */
var PLACEMENTS = { Auto: 'Авто', Horizontally: 'Горизонтально', Vertically: 'Вертикально', Together: 'Вместе', SpecialColumn: 'Отдельная колонка' };

/* Enumerations a settings value can hold: output, placement, totals. */
var VALUES = {
    Auto: 'Авто', Output: 'Выводить', DontOutput: 'Не выводить', None: 'Нет', Begin: 'Начало',
    End: 'Конец', BeginAndEnd: 'Начало и конец', Vertically: 'Вертикально', Horizontally: 'Горизонтально',
    Together: 'Вместе', Separately: 'Отдельно', SpecialColumn: 'Отдельная колонка',
    SeparatelyAndInTotalsOnly: 'Отдельно и только в итогах', Use: 'Использовать', DontUse: 'Не использовать',
    Wrap: 'Переносить', Cut: 'Обрезать', Clip: 'Обрезать', Left: 'Лево', Right: 'Право', Center: 'Центр',
    Top: 'Верх', Bottom: 'Низ', Full: 'Полное', Short: 'Краткое', Default: 'По умолчанию',
    Bold: 'Жирный', Normal: 'Обычный', Inaccessible: 'Недоступный', QuickAccess: 'Быстрый доступ'
};

var STANDARD_PERIODS = {
    Custom: 'Произвольный период', Today: 'Сегодня', Yesterday: 'Вчера', Tomorrow: 'Завтра',
    ThisWeek: 'Эта неделя', ThisTenDays: 'Эта декада', ThisMonth: 'Этот месяц', ThisQuarter: 'Этот квартал',
    ThisHalfYear: 'Это полугодие', ThisYear: 'Этот год', FromBeginningOfThisWeek: 'С начала этой недели',
    FromBeginningOfThisTenDays: 'С начала этой декады', FromBeginningOfThisMonth: 'С начала этого месяца',
    FromBeginningOfThisQuarter: 'С начала этого квартала', FromBeginningOfThisHalfYear: 'С начала этого полугодия',
    FromBeginningOfThisYear: 'С начала этого года', LastWeek: 'Прошлая неделя', LastTenDays: 'Прошлая декада',
    LastMonth: 'Прошлый месяц', LastQuarter: 'Прошлый квартал', LastHalfYear: 'Прошлое полугодие',
    LastYear: 'Прошлый год', NextDay: 'Следующий день', NextWeek: 'Следующая неделя',
    NextTenDays: 'Следующая декада', NextMonth: 'Следующий месяц', NextQuarter: 'Следующий квартал',
    NextHalfYear: 'Следующее полугодие', NextYear: 'Следующий год',
    TillEndOfThisYear: 'До конца этого года', LastWeekTillSameWeekDay: 'Прошлая неделя по такой же день',
    LastMonthTillSameDate: 'Прошлый месяц по такую же дату', LastYearTillSameDate: 'Прошлый год по такую же дату', Month: 'Месяц'
};

/* `rows` tells what the tab shows: a window that only reads does not draw a
 * tab the schema leaves empty; one that edits draws them all, as the
 * Designer does, for there one fills them. */
var TABS = [
    { id: 'sets', title: 'Наборы данных', rows: function (m) { return m.sets; } },
    { id: 'links', title: 'Связи наборов данных', rows: function (m) { return m.links; } },
    { id: 'calculated', title: 'Вычисляемые поля', rows: function (m) { return m.calculated; } },
    { id: 'totals', title: 'Ресурсы', rows: function (m) { return m.totals; } },
    { id: 'parameters', title: 'Параметры', rows: function (m) { return m.parameters; } },
    { id: 'templates', title: 'Макеты', rows: function (m) { return m.templates; } },
    { id: 'nested', title: 'Вложенные схемы', rows: function (m) { return m.nested; } },
    { id: 'settings', title: 'Настройки', rows: function (m) { return m.variants; } }
];

/* The tabs with something on them, and always at least one; all of them
 * where the schema is edited. */
function filledTabs(model, editing) {
    if (editing) return TABS.slice();
    var shown = TABS.filter(function (t) { return (t.rows(model) || []).length > 0; });
    return shown.length ? shown : [TABS[0]];
}

// ------------------------------------------------------------- raw source

/* Every element of the raw XML in document order with its start offset and
 * the range of its content. Comments, CDATA and processing instructions are
 * skipped, so the order is the DOM's. */
function scanElements(xml) {
    var out = [];
    var stack = [];
    var re = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<![^>]*>|<(\/?)([^\s>\/!?]+)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
    var m;
    while ((m = re.exec(xml))) {
        if (!m[2]) continue;
        if (m[1]) {
            var open = stack.pop();
            if (open) { open.end = m.index; open.close = m.index + m[0].length; }
            continue;
        }
        var after = m.index + m[0].length;
        var rec = { start: m.index, contentStart: after, end: after, close: after, selfClosing: !!m[4], tag: m[2] };
        out.push(rec);
        if (!m[4]) stack.push(rec);
    }
    return out;
}

function lineIndex(xml) {
    var starts = [0];
    for (var i = 0; i < xml.length; i++) if (xml.charCodeAt(i) === 10) starts.push(i + 1);
    return function (offset) {
        var lo = 0, hi = starts.length - 1;
        while (lo < hi) {
            var mid = (lo + hi + 1) >> 1;
            if (starts[mid] <= offset) lo = mid; else hi = mid - 1;
        }
        return lo + 1;
    };
}

/* Pairs DOM elements with scanned records by pre-order position. */
function positions(doc, xml) {
    var recs = scanElements(xml);
    var lineOf = lineIndex(xml);
    var list = [];
    var parents = typeof Map === 'function' ? new Map() : null;
    function walk(node) {
        list.push(node);
        var kids = node.children || [];
        for (var i = 0; i < kids.length; i++) {
            if (parents) parents.set(kids[i], node);
            walk(kids[i]);
        }
    }
    if (doc && doc.documentElement) walk(doc.documentElement);
    var aligned = list.length === recs.length;
    var map = typeof Map === 'function' ? new Map() : null;
    for (var i = 0; aligned && map && i < list.length; i++) map.set(list[i], recs[i]);
    return {
        line: function (el) {
            var rec = map && el && map.get(el);
            return rec ? lineOf(rec.start) : 0;
        },
        range: function (el) {
            var rec = map && el && map.get(el);
            return rec ? { start: rec.contentStart, end: rec.end } : null;
        },
        rec: function (el) {
            return (map && el && map.get(el)) || null;
        },
        parent: function (el) {
            return (parents && el && parents.get(el)) || null;
        }
    };
}

function decodeXml(s) {
    return String(s).replace(/&(lt|gt|quot|apos|amp|#(\d+)|#x([0-9a-fA-F]+));/g, function (all, name, dec, hex) {
        if (dec) return String.fromCharCode(parseInt(dec, 10));
        if (hex) return String.fromCharCode(parseInt(hex, 16));
        return { lt: '<', gt: '>', quot: '"', apos: "'", amp: '&' }[name];
    });
}

function encodeXml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ------------------------------------------------------------------ values

function xsiType(el) {
    if (!el || typeof el.getAttribute !== 'function') return '';
    var t = el.getAttribute('xsi:type') || '';
    var i = t.indexOf(':');
    return i >= 0 ? t.slice(i + 1) : t;
}

function isNil(el) {
    return !!(el && typeof el.getAttribute === 'function' && el.getAttribute('xsi:nil') === 'true');
}

function isTrue(el) {
    return textOf(el) === 'true';
}

function dateText(raw) {
    var m = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)/.exec(String(raw || ''));
    if (!m) return String(raw || '');
    if (m[1] === '0001' && m[2] === '01' && m[3] === '01' && m[4] + m[5] + m[6] === '000000') return '';
    var date = m[3] + '.' + m[2] + '.' + m[1];
    return m[4] + m[5] + m[6] === '000000' ? date : date + ' ' + m[4] + ':' + m[5] + ':' + m[6];
}

function typePresentation(typeEl) {
    if (!typeEl) return '';
    var md = root.MetadataPreview;
    if (md && md.typePresentation) return md.typePresentation(typeEl);
    var parts = [];
    var kids = typeEl.children || [];
    for (var i = 0; i < kids.length; i++) {
        var tag = localName(kids[i]);
        if (tag === 'Type' || tag === 'TypeSet') parts.push(terms.typeName(textOf(kids[i])) || textOf(kids[i]));
    }
    return parts.join(', ');
}

/* A value as the Designer's grids show it. `titleOf` turns a field path into
 * the field's title. */
function valueText(el, titleOf) {
    if (!el || isNil(el)) return '';
    var type = xsiType(el);
    var text = textOf(el);
    switch (type) {
        case 'Field': return titleOf ? titleOf(text) : text;
        case 'Parameter': return '&' + text;
        case 'boolean': return text === 'true' ? 'Да' : 'Нет';
        case 'dateTime': return dateText(text);
        case 'decimal': return text.replace('.', ',');
        case 'string': return text;
        case 'LocalStringType': return localizedFrom(el);
        case 'DesignTimeValue': return terms.metadataRef(text) || text;
        case 'StandardPeriod': {
            var variant = textOf(firstChild(el, 'variant'));
            var shown = own(STANDARD_PERIODS, variant) || variant;
            if (variant === 'Custom') {
                var from = dateText(textOf(firstChild(el, 'startDate')));
                var to = dateText(textOf(firstChild(el, 'endDate')));
                if (from || to) shown = from + ' – ' + to;
            }
            return shown;
        }
        case 'StandardBeginningDate': {
            var v = textOf(firstChild(el, 'variant'));
            return v === 'Custom' ? dateText(textOf(firstChild(el, 'date'))) : terms.identWords(v);
        }
        case 'Type': return terms.typeName(text) || text;
        case 'ValueListType': {
            var items = [];
            var list = namedChildren(el, 'item');
            for (var i = 0; i < list.length; i++) items.push(valueText(firstChild(list[i], 'value'), titleOf));
            return items.join('; ');
        }
    }
    if (el.children && el.children.length && !text) return '';
    if (/^(style|web|win|sys):/.test(text)) return text.replace(/^[a-z]+:/, '');
    if (!/\s/.test(text) && own(VALUES, text)) return VALUES[text];
    if (!text && typeof el.getAttribute === 'function') {
        var ref = el.getAttribute('ref');
        if (ref) return ref.replace(/^[a-z]+:/, '');
        var face = el.getAttribute('faceName');
        if (face) return face + (el.getAttribute('height') ? ', ' + el.getAttribute('height') : '');
    }
    return text;
}

// ------------------------------------------------------------------- parse

function detect(xml) {
    if (!xml || typeof xml !== 'string') return false;
    return /^\s*(?:\uFEFF)?(?:<\?xml[^>]*\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<(?:\w+:)?DataCompositionSchema[\s>]/.test(xml);
}

function restriction(el) {
    return {
        field: isTrue(firstChild(el, 'field')), condition: isTrue(firstChild(el, 'condition')),
        group: isTrue(firstChild(el, 'group')), order: isTrue(firstChild(el, 'order'))
    };
}

/* The field's "Доступные значения" cell: presentations, else the values. */
function availableText(el) {
    return namedChildren(el, 'availableValue').map(function (a) {
        return localizedFrom(firstChild(a, 'presentation')) || valueText(firstChild(a, 'value'), null);
    }).join('; ');
}

/* "Оформление" and "Параметры редактирования": the names of the parameters
 * set, as the Designer lists them. */
function parameterNames(el) {
    if (!el) return '';
    return namedChildren(el, 'item').filter(function (it) {
        return textOf(firstChild(it, 'use')) !== 'false';
    }).map(function (it) {
        var p = textOf(firstChild(it, 'parameter'));
        return terms.identWords(p) || p;
    }).join(', ');
}

function orderText(el) {
    return namedChildren(el, 'orderExpression').map(function (o) {
        return textOf(firstChild(o, 'expression')) + (textOf(firstChild(o, 'orderType')) === 'Desc' ? ' Убыв' : '');
    }).join(', ');
}

function roleText(el) {
    if (!el) return '';
    var parts = [];
    var kids = el.children || [];
    for (var i = 0; i < kids.length; i++) {
        var tag = localName(kids[i]);
        var v = textOf(kids[i]);
        if (tag === 'dimension' && v === 'true') parts.push('Измерение');
        else if (tag === 'periodNumber') parts.push('Период ' + v);
        else if (tag === 'periodType') parts.push(v === 'Additional' ? 'Дополнительный' : 'Основной');
        else if (tag === 'account' && v === 'true') parts.push('Счет');
        else if (tag === 'accountTypeExpression') parts.push('Выражение вида счета: ' + v);
        else if (tag === 'balance' && v === 'true') parts.push('Остаток');
        else if (tag === 'balanceGroup') parts.push('Группа: ' + v);
        else if (tag === 'balanceType') parts.push(v === 'ClosingBalance' ? 'Конечный остаток' : 'Начальный остаток');
        else if (tag === 'accountField') parts.push('Счет: ' + v);
        else if (tag === 'parentDimension') parts.push('Родитель: ' + v);
        else if (tag === 'ignoreNullValues' && v === 'true') parts.push('Игнорировать NULL');
        else if (tag === 'required' && v === 'true') parts.push('Обязательное');
    }
    return parts.join(', ');
}

function Parser(xml, doc) {
    this.pos = positions(doc, xml);
    this.titles = {};
    this.xml = xml;
    /* The elements a host may edit, by the id of their record. */
    this.owners = {};
}

Parser.prototype.owner = function (id, kind, el, auto) {
    this.owners[id] = { kind: kind, el: el, auto: auto || '' };
};

/* A parameter value the window can edit: one value of a single primitive
 * type, not a list. Anything else stays read-only. */
var SIMPLE_VALUE_TYPES = { 'xs:boolean': 'boolean', 'xs:string': 'string', 'xs:decimal': 'decimal', 'xs:dateTime': 'dateTime' };

/* `src` (the raw source) keeps a string value exactly, spaces at its ends included. */
function simpleValue(el, src) {
    var vt = firstChild(el, 'valueType');
    if (!vt || firstChild(vt, 'TypeSet') || firstChild(vt, 'TypeId') || isTrue(firstChild(el, 'valueListAllowed'))) return null;
    var types = namedChildren(vt, 'Type');
    var kind = types.length === 1 ? own(SIMPLE_VALUE_TYPES, textOf(types[0])) : '';
    var values = namedChildren(el, 'value');
    if (!kind || values.length > 1) return null;
    var v = values[0];
    var raw = !v || isNil(v) || xsiType(v) !== kind ? '' : src && kind === 'string' ? exactText(src, v) : textOf(v);
    var fractions = textOf(firstChild(firstChild(vt, 'DateQualifiers'), 'DateFractions'));
    var text = kind === 'dateTime' ? dateText(raw) : kind === 'decimal' ? raw.replace('.', ',')
        : kind === 'boolean' ? (raw === 'true' ? 'Да' : raw === 'false' ? 'Нет' : '') : raw;
    return { kind: kind, text: text, dateOnly: fractions === 'Date' };
}

Parser.prototype.set = function (el, path) {
    var type = xsiType(el) || 'DataSetQuery';
    var name = textOf(firstChild(el, 'name'));
    var id = 'set:' + path;
    var set = {
        id: id, kind: type, kindTitle: own(SET_KINDS, type) || type, name: name,
        source: textOf(firstChild(el, 'dataSource')), objectName: textOf(firstChild(el, 'objectName')),
        autoFill: textOf(firstChild(el, 'autoFillFields')) !== 'false',
        useQueryGroup: textOf(firstChild(el, 'useQueryGroupIfPossible')) !== 'false',
        line: this.pos.line(el), fields: [], items: [], query: null
    };
    this.owner(id, 'set', el);
    var q = firstChild(el, 'query');
    if (q) {
        var range = this.pos.range(q);
        var raw = range ? this.xml.slice(range.start, range.end) : '';
        set.query = {
            text: range ? decodeXml(raw).replace(/\r\n/g, '\n') : textOf(q),
            line: this.pos.line(q)
        };
    }
    var fields = namedChildren(el, 'field');
    for (var i = 0; i < fields.length; i++) set.fields.push(this.field(fields[i], id));
    var items = namedChildren(el, 'item');
    for (var k = 0; k < items.length; k++) set.items.push(this.set(items[k], path + '/' + textOf(firstChild(items[k], 'name'))));
    return set;
};

Parser.prototype.field = function (el, setId) {
    var type = xsiType(el);
    var path = textOf(firstChild(el, 'dataPath'));
    var title = localizedFrom(firstChild(el, 'title'));
    if (path && title && !own(this.titles, path)) this.titles[path] = title;
    this.owner('field:' + setId.slice(4) + ':' + path, 'field', el, path);
    return {
        id: 'field:' + setId.slice(4) + ':' + path,
        kind: type === 'DataSetFieldFolder' ? 'folder' : type === 'DataSetFieldNestedDataSet' ? 'nested' : 'field',
        dataPath: path, field: textOf(firstChild(el, 'field')), title: title,
        restrict: restriction(firstChild(el, 'useRestriction')),
        attrRestrict: restriction(firstChild(el, 'attributeUseRestriction')),
        role: roleText(firstChild(el, 'role')),
        type: typePresentation(firstChild(el, 'valueType')),
        presentation: textOf(firstChild(el, 'presentationExpression')),
        order: orderText(el), available: availableText(el),
        appearance: parameterNames(firstChild(el, 'appearance')),
        editParameters: parameterNames(firstChild(el, 'inputParameters')),
        hierarchySet: textOf(firstChild(el, 'inHierarchyDataSet')),
        hierarchyParameter: textOf(firstChild(el, 'inHierarchyDataSetParameter')),
        line: this.pos.line(el)
    };
};

Parser.prototype.titleOf = function () {
    var titles = this.titles;
    return function (path) {
        path = String(path || '');
        if (own(titles, path)) return titles[path];
        /* Организация.ИНН -> the owner's title and the attribute. */
        var dot = path.lastIndexOf('.');
        if (dot > 0 && own(titles, path.slice(0, dot))) return titles[path.slice(0, dot)] + '.' + path.slice(dot + 1);
        if (path === 'SystemFields.SerialNumber') return 'Номер по порядку';
        if (path === 'SystemFields.GroupSerialNumber') return 'Номер по порядку в группировке';
        if (path.indexOf('ПараметрыДанных.') === 0 || path.indexOf('DataParameters.') === 0)
            return 'Параметры данных.' + path.slice(path.indexOf('.') + 1);
        /* A field without its own title is titled from its name, as the
         * platform does: ПериодМесяц -> Период месяц. */
        return terms.identWords(path) || path;
    };
};

/* The items of a settings list (selected fields, a filter, an order ...) as
 * the rows of its grid. `listId` names the list: each item is registered as
 * an editable record under `listId:<index>`, an item inside a folder or a
 * filter group under its parent's id and `.<index>`. */
Parser.prototype.settingsItems = function (list, kind, depth, out, listId) {
    var titleOf = this.titleOf();
    var items = namedChildren(list, 'item');
    for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var type = xsiType(it);
        var use = textOf(firstChild(it, 'use')) !== 'false';
        var row = { depth: depth, use: use, line: this.pos.line(it), type: type };
        if (listId) {
            row.id = listId + (depth ? '.' : ':') + i;
            this.owner(row.id, 'sitem', it);
            this.owners[row.id].list = kind;
        }
        if (kind === 'selection') {
            if (type === 'SelectedItemAuto') row.text = 'Авто (поля)';
            else if (type === 'SelectedItemFolder') {
                row.text = localizedFrom(firstChild(it, 'lwsTitle')) || 'Группа';
                row.folder = true;
                var pl = textOf(firstChild(it, 'placement'));
                row.placement = own(VALUES, pl) || pl;
            } else {
                var f = textOf(firstChild(it, 'field'));
                row.text = titleOf(f);
                row.path = f;
                row.title = localizedFrom(firstChild(it, 'lwsTitle'));
            }
            out.push(row);
            if (type === 'SelectedItemFolder') this.settingsItems(it, kind, depth + 1, out, row.id);
        } else if (kind === 'filter') {
            if (type === 'FilterItemGroup') {
                row.text = own(FILTER_GROUPS, textOf(firstChild(it, 'groupType'))) || 'Группа';
                row.folder = true;
                row.groupType = textOf(firstChild(it, 'groupType'));
                out.push(row);
                this.settingsItems(it, kind, depth + 1, out, row.id);
                continue;
            }
            var left = firstChild(it, 'left');
            row.text = valueText(left, titleOf) || textOf(left);
            row.path = textOf(left);
            var cmp = textOf(firstChild(it, 'comparisonType'));
            row.comparison = own(COMPARISON, cmp) || cmp;
            row.comparisonType = cmp;
            row.value = valueText(firstChild(it, 'right'), titleOf);
            row.presentation = localizedFrom(firstChild(it, 'presentation'));
            out.push(row);
        } else if (kind === 'order') {
            if (type === 'OrderItemAuto') row.text = 'Авто';
            else {
                var of = textOf(firstChild(it, 'field'));
                row.text = titleOf(of);
                row.path = of;
                row.orderType = textOf(firstChild(it, 'orderType')) || 'Asc';
                row.direction = row.orderType === 'Desc' ? 'По убыванию' : 'По возрастанию';
            }
            out.push(row);
        } else if (kind === 'groupFields') {
            if (type === 'GroupItemAuto') row.text = 'Авто';
            else {
                var gf = textOf(firstChild(it, 'field'));
                row.text = titleOf(gf);
                row.path = gf;
                var gt = textOf(firstChild(it, 'groupType'));
                row.groupType = own(GROUP_TYPES, gt) || gt;
                var pa = textOf(firstChild(it, 'periodAdditionType'));
                row.period = own(PERIOD_ADDITION, pa) || '';
            }
            out.push(row);
        } else if (kind === 'parameters') {
            var pname = textOf(firstChild(it, 'parameter'));
            row.text = terms.identWords(pname) || pname;
            row.path = pname;
            row.value = valueText(firstChild(it, 'value'), titleOf);
            out.push(row);
            this.settingsItems(it, kind, depth + 1, out, row.id);
        } else if (kind === 'appearance') {
            var fields = [];
            var sel = namedChildren(firstChild(it, 'selection'), 'item');
            for (var s = 0; s < sel.length; s++) fields.push(titleOf(textOf(firstChild(sel[s], 'field'))));
            var conds = [];
            this.settingsItems(firstChild(it, 'filter'), 'filter', 0, conds);
            var looks = [];
            this.settingsItems(firstChild(it, 'appearance'), 'parameters', 0, looks);
            row.text = looks.filter(function (x) { return x.use && x.depth === 0; }).map(function (x) {
                return x.text + (x.value ? ': ' + x.value : '');
            }).join('; ');
            row.condition = filterSummary(conds);
            row.fields = fields.join(', ');
            row.presentation = localizedFrom(firstChild(it, 'presentation'));
            out.push(row);
        } else if (kind === 'userFields') {
            var dp = textOf(firstChild(it, 'dataPath'));
            row.text = localizedFrom(firstChild(it, 'lwsTitle')) || dp;
            row.path = dp;
            row.value = type === 'UserFieldCase' ? 'Выбор' : textOf(firstChild(it, 'detailExpression'));
            out.push(row);
        }
    }
    return out;
};

function filterSummary(rows) {
    var parts = [];
    for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (!r.use || r.folder) continue;
        parts.push(r.text + ' ' + (r.comparison || '').toLowerCase() + (r.value ? ' ' + r.value : ''));
    }
    return parts.join('; ');
}

var NODE_TITLES = {
    StructureItemTable: 'Таблица', StructureItemChart: 'Диаграмма', StructureItemNestedObject: 'Вложенный объект'
};

/* The settings lists of a structure node: the page of the Designer, the
 * element that holds the list and the kind of its items. */
var SETTINGS_LISTS = [
    { key: 'groupFields', tag: 'groupItems', kind: 'groupFields' },
    { key: 'selection', tag: 'selection', kind: 'selection' },
    { key: 'filter', tag: 'filter', kind: 'filter' },
    { key: 'order', tag: 'order', kind: 'order' },
    { key: 'appearance', tag: 'conditionalAppearance', kind: 'appearance' },
    { key: 'outputParameters', tag: 'outputParameters', kind: 'parameters' },
    { key: 'dataParameters', tag: 'dataParameters', kind: 'parameters' },
    { key: 'userFields', tag: 'userFields', kind: 'userFields' }
];

Parser.prototype.node = function (el, kind, id, title) {
    var node = {
        id: id, kind: kind, title: title, name: textOf(firstChild(el, 'name')),
        use: textOf(firstChild(el, 'use')) !== 'false', line: this.pos.line(el), children: []
    };
    this.owner(id, 'snode', el);
    this.owners[id].node = kind;
    for (var l = 0; l < SETTINGS_LISTS.length; l++) {
        var spec = SETTINGS_LISTS[l];
        var listEl = firstChild(el, spec.tag);
        var listId = id + '|' + spec.key;
        /* The list may be missing: an item added to it brings it along. */
        this.owner(listId, 'slist', listEl);
        this.owners[listId].parent = el;
        this.owners[listId].tag = spec.tag;
        this.owners[listId].node = kind;
        node[spec.key] = this.settingsItems(listEl, spec.kind, 0, [], listId);
    }
    if (kind === 'group') {
        var fields = node.groupFields.map(function (f) { return f.text; }).join(', ');
        node.title = fields || 'Детальные записи';
        node.detail = !fields;
    }
    if (node.name && kind !== 'root') node.title += ' (' + node.name + ')';
    var kids = el.children || [];
    var n = 0;
    var axes = { row: 'Строки', column: 'Колонки', point: 'Точки', series: 'Серии' };
    var axisNodes = {};
    for (var i = 0; i < kids.length; i++) {
        var tag = localName(kids[i]);
        if (tag === 'item') {
            var type = xsiType(kids[i]);
            var childKind = type === 'StructureItemTable' ? 'table' : type === 'StructureItemChart' ? 'chart'
                : type === 'StructureItemNestedObject' ? 'nestedObject' : 'group';
            node.children.push(this.node(kids[i], childKind, id + '.' + (n++), own(NODE_TITLES, type)));
        } else if (own(axes, tag)) {
            var axis = axisNodes[tag];
            if (!axis) {
                axis = axisNodes[tag] = {
                    id: id + '.' + tag, kind: 'axis', title: axes[tag], use: true, line: this.pos.line(kids[i]),
                    children: [], groupFields: [], selection: [], filter: [], order: [], appearance: [],
                    outputParameters: [], dataParameters: [], userFields: []
                };
            }
            axis.children.push(this.node(kids[i], 'group', axis.id + '.' + axis.children.length, ''));
        }
    }
    /* The Designer lists rows before columns whatever order the file has. */
    ['row', 'column', 'point', 'series'].forEach(function (tag) {
        if (axisNodes[tag]) node.children.push(axisNodes[tag]);
    });
    return node;
};

/* The owner id of the schema a record path starts with: the top one, or a
 * nested schema by its path (Детали/). */
function schemaKey(prefix) {
    return prefix ? 'schema:' + prefix : 'schema';
}

/* The schema `prefix` names inside `model` (a nested schema's own model),
 * the model itself for ''; null when there is no such nested schema. */
function scopeModel(model, prefix) {
    if (!model || !prefix) return model || null;
    var stack = [model];
    while (stack.length) {
        var m = stack.pop();
        if (m.prefix === prefix) return m;
        (m.nested || []).forEach(function (n) { if (n.schema) stack.push(n.schema); });
    }
    return null;
}

Parser.prototype.schema = function (top, prefix) {
    var self = this;
    /* A nested schema is a schema of its own: its records carry its path
     * (calc:Детали/0) and it adds them under its own <schema>. */
    this.owner(schemaKey(prefix), 'schema', top);
    var model = {
        sources: [], sets: [], links: [], calculated: [], totals: [], parameters: [],
        templates: [], nested: [], variants: [], prefix: prefix
    };
    var sources = namedChildren(top, 'dataSource');
    for (var s = 0; s < sources.length; s++) {
        model.sources.push({ name: textOf(firstChild(sources[s], 'name')), type: textOf(firstChild(sources[s], 'dataSourceType')) });
    }
    var sets = namedChildren(top, 'dataSet');
    for (var i = 0; i < sets.length; i++) model.sets.push(this.set(sets[i], prefix + textOf(firstChild(sets[i], 'name'))));
    namedChildren(top, 'calculatedField').forEach(function (el, k) {
        var path = textOf(firstChild(el, 'dataPath'));
        var title = localizedFrom(firstChild(el, 'title'));
        if (path && title && !own(self.titles, path)) self.titles[path] = title;
        self.owner('calc:' + prefix + k, 'calc', el, path);
        model.calculated.push({
            id: 'calc:' + prefix + k, dataPath: path, expression: textOf(firstChild(el, 'expression')), title: title,
            restrict: restriction(firstChild(el, 'useRestriction')), type: typePresentation(firstChild(el, 'valueType')),
            presentation: textOf(firstChild(el, 'presentationExpression')), order: orderText(el),
            available: availableText(el), appearance: parameterNames(firstChild(el, 'appearance')),
            editParameters: parameterNames(firstChild(el, 'inputParameters')), line: self.pos.line(el)
        });
    });
    var titleOf = this.titleOf();
    namedChildren(top, 'dataSetLink').forEach(function (el, k) {
        self.owner('link:' + prefix + k, 'link', el);
        model.links.push({
            id: 'link:' + prefix + k, source: textOf(firstChild(el, 'sourceDataSet')),
            dest: textOf(firstChild(el, 'destinationDataSet')),
            sourceExpr: textOf(firstChild(el, 'sourceExpression')), destExpr: textOf(firstChild(el, 'destinationExpression')),
            parameter: textOf(firstChild(el, 'parameter')), parameterList: isTrue(firstChild(el, 'parameterListAllowed')),
            condition: textOf(firstChild(el, 'linkConditionExpression')), start: textOf(firstChild(el, 'startExpression')),
            required: isTrue(firstChild(el, 'required')), line: self.pos.line(el)
        });
    });
    namedChildren(top, 'totalField').forEach(function (el, k) {
        var path = textOf(firstChild(el, 'dataPath'));
        self.owner('total:' + prefix + k, 'total', el);
        model.totals.push({
            id: 'total:' + prefix + k, dataPath: path, title: titleOf(path), expression: textOf(firstChild(el, 'expression')),
            groups: namedChildren(el, 'group').map(function (g) {
                var t = textOf(g);
                return t === 'ОбщийИтог' || t === 'Overall' ? 'Общий итог' : titleOf(t);
            }),
            line: self.pos.line(el)
        });
    });
    namedChildren(top, 'parameter').forEach(function (el) {
        var name = textOf(firstChild(el, 'name'));
        self.owner('param:' + prefix + name, 'param', el, name);
        model.parameters.push({
            id: 'param:' + prefix + name, name: name, title: localizedFrom(firstChild(el, 'title')),
            simpleValue: simpleValue(el, self),
            type: typePresentation(firstChild(el, 'valueType')), valueList: isTrue(firstChild(el, 'valueListAllowed')),
            value: valueText(firstChild(el, 'value'), titleOf), expression: textOf(firstChild(el, 'expression')),
            restricted: textOf(firstChild(el, 'useRestriction')) === 'true',
            availableAsField: textOf(firstChild(el, 'availableAsField')) !== 'false',
            use: own(PARAMETER_USE, textOf(firstChild(el, 'use'))) || 'Авто',
            denyIncomplete: isTrue(firstChild(el, 'denyIncompleteValues')), available: availableText(el),
            functionalOption: textOf(firstChild(el, 'functionalOptionsParameter')),
            editParameters: parameterNames(firstChild(el, 'inputParameters')), line: self.pos.line(el)
        });
    });
    var kids = top.children || [];
    var t = 0;
    for (var c = 0; c < kids.length; c++) {
        var tag = localName(kids[c]);
        if (!own(TEMPLATE_KINDS, tag)) continue;
        var el = kids[c];
        var group = textOf(firstChild(el, 'groupName')) || textOf(firstChild(el, 'groupName1'));
        var field = textOf(firstChild(el, 'groupField')) || textOf(firstChild(el, 'groupField1')) || textOf(firstChild(el, 'field'));
        var ttype = textOf(firstChild(el, 'templateType')) || textOf(firstChild(el, 'templateType1'));
        var inner = firstChild(el, 'template');
        var tid = 'tpl:' + prefix + (t++);
        self.owner(tid, 'tpl', el, tag === 'template' ? textOf(firstChild(el, 'name')) : '');
        self.owners[tid].tag = tag;
        model.templates.push({
            id: tid, tag: tag, kind: TEMPLATE_KINDS[tag], defId: tag === 'template' ? tid : '',
            name: tag === 'template' ? textOf(firstChild(el, 'name')) : textOf(inner),
            target: group || (field ? titleOf(field) : ''), templateType: own(TEMPLATE_TYPES, ttype) || ttype,
            parameters: tag === 'template' ? namedChildren(el, 'parameter').map(function (p) {
                var details = xsiType(p) === 'DetailsAreaTemplateParameter';
                return {
                    name: textOf(firstChild(p, 'name')), kind: details ? 'details' : 'expression',
                    expression: details ? 'Расшифровка: ' + namedChildren(p, 'fieldExpression').map(function (f) { return textOf(firstChild(f, 'field')); }).join(', ')
                        : textOf(firstChild(p, 'expression'))
                };
            }) : [],
            area: tag === 'template' ? parseArea(inner, self, tid) : null,
            line: self.pos.line(el)
        });
    }
    /* The Designer lists a template once: a binding (group, field, totals)
     * with the area it outputs, or an area no binding uses. */
    var defs = {};
    var used = {};
    model.templates.forEach(function (tpl) {
        if (tpl.kind === 'Макет') { if (!own(defs, tpl.name)) defs[tpl.name] = tpl; } else used[tpl.name] = true;
    });
    model.templates = model.templates.filter(function (tpl) {
        return tpl.kind !== 'Макет' || !own(used, tpl.name);
    });
    model.templates.forEach(function (tpl) {
        tpl.title = tpl.kind === 'Макет' ? tpl.kind : bindingText(tpl);
        if (tpl.kind !== 'Макет' && own(defs, tpl.name)) {
            tpl.parameters = defs[tpl.name].parameters;
            tpl.area = defs[tpl.name].area;
            tpl.defId = defs[tpl.name].id;
        }
    });
    namedChildren(top, 'nestedSchema').forEach(function (el) {
        var name = textOf(firstChild(el, 'name'));
        var schema = firstChild(el, 'schema');
        self.owner('nested:' + prefix + name, 'nested', el, name);
        model.nested.push({
            id: 'nested:' + prefix + name, name: name, title: localizedFrom(firstChild(el, 'title')),
            sets: schema ? namedChildren(schema, 'dataSet').length : 0,
            setNames: schema ? namedChildren(schema, 'dataSet').map(function (d) { return textOf(firstChild(d, 'name')); }) : [],
            settings: !!firstChild(el, 'settings'),
            line: self.pos.line(el),
            schema: schema ? self.schema(schema, prefix + name + '/') : null
        });
    });
    namedChildren(top, 'settingsVariant').forEach(function (el, k) {
        var name = textOf(firstChild(el, 'name'));
        var settings = firstChild(el, 'settings');
        var variant = {
            id: 'variant:' + prefix + k, name: name, presentation: localizedFrom(firstChild(el, 'presentation')),
            line: self.pos.line(el)
        };
        self.owner(variant.id, 'variant', el);
        variant.root = settings ? self.node(settings, 'root', variant.id + '/s', 'Отчет') : null;
        model.variants.push(variant);
    });
    return model;
};

/* --------------------------------------------------------------- areas

 * An area template (dcsat:AreaTemplate) is a list of table rows of cells.
 * A cell holds one field — a parameter of the area or a literal string — and
 * an appearance. The schema stores no grid: the Designer lays every area of
 * the template out into one spreadsheet and computes column widths and row
 * heights from the appearances, so the address it shows («R2C1») exists only
 * in that layout. The window draws each area on its own, with the widths the
 * appearance does state. */

var V_ALIGN = { Top: 'top', Center: 'middle', Bottom: 'bottom' };
var H_ALIGN = { Left: 'left', Center: 'center', Right: 'right' };

/* Widths and indents of an area count characters of the standard font
 * (Arial 8: 7 px at 96 dpi), as spreadsheet columns do. */
var AREA_CHAR_PX = 7;

function appearanceMap(el) {
    var out = {};
    var app = firstChild(el, 'appearance');
    if (!app) return out;
    namedChildren(app, 'item').forEach(function (it) {
        var name = textOf(firstChild(it, 'parameter'));
        if (!name) return;
        var v = firstChild(it, 'value');
        var ref = v && typeof v.getAttribute === 'function' ? (v.getAttribute('ref') || '') : '';
        out[name] = textOf(v) || ref;
    });
    return out;
}

function areaNumber(text) {
    var n = parseFloat(text);
    return isFinite(n) ? n : 0;
}

/* «style:ПравоПросмотраФон» -> «ПравоПросмотраФон»: the window cannot resolve
 * a colour or a picture of the configuration, so it only names it. */
function areaRefName(text) {
    var t = String(text || '');
    var i = t.indexOf(':');
    return i >= 0 ? t.slice(i + 1) : t;
}

function parseAreaCell(cell) {
    var app = appearanceMap(cell);
    var item = firstChild(cell, 'item');
    var value = item ? firstChild(item, 'value') : null;
    var type = value ? xsiType(value) : '';
    var own2 = function (k) { return own(app, k); };
    var notes = [];
    if (own2('Картинка')) notes.push('Картинка: ' + areaRefName(own2('Картинка')));
    if (own2('ЦветФона')) notes.push('Цвет фона: ' + areaRefName(own2('ЦветФона')));
    if (own2('ЦветТекста')) notes.push('Цвет текста: ' + areaRefName(own2('ЦветТекста')));
    var format = own(appearanceMap(item), 'Формат') || own2('Формат');
    if (format) notes.push('Формат: ' + format);
    if (own2('Расшифровка')) notes.push('Расшифровка: ' + own2('Расшифровка'));
    return {
        kind: type === 'Parameter' ? 'param' : (type ? 'text' : ''),
        text: type === 'Parameter' ? textOf(value) : localizedFrom(value),
        width: areaNumber(own2('МаксимальнаяШирина') || own2('МинимальнаяШирина')),
        indent: areaNumber(own2('Отступ')),
        rotated: areaNumber(own2('ОриентацияТекста')) === 90,
        wrap: own2('Размещение') === 'Wrap',
        valign: own(V_ALIGN, own2('ВертикальноеПоложение')),
        halign: own(H_ALIGN, own2('ГоризонтальноеПоложение')),
        picture: areaRefName(own2('Картинка')),
        note: notes.join('\n')
    };
}

/* `parser` and `tid` register the rows and cells as records the window
 * edits: arow:<template>:<row>, cell:<template>:<row>:<cell>. */
function parseArea(el, parser, tid) {
    if (!el) return null;
    var base = tid ? tid.slice(4) : '';
    var rows = namedChildren(el, 'item').filter(function (it) {
        return xsiType(it) === 'TableRow';
    }).map(function (it, r) {
        var row = { cells: namedChildren(it, 'tableCell').map(parseAreaCell) };
        if (parser) {
            row.id = 'arow:' + base + ':' + r;
            parser.owner(row.id, 'arow', it);
            namedChildren(it, 'tableCell').forEach(function (cell, c) {
                row.cells[c].id = 'cell:' + base + ':' + r + ':' + c;
                parser.owner(row.cells[c].id, 'cell', cell);
            });
        }
        return row;
    });
    return rows.length ? { rows: rows } : null;
}

function bindingText(b) {
    return b.kind + (b.target ? ' «' + b.target + '»' : '') + (b.templateType ? ', ' + b.templateType.toLowerCase() : '');
}

function parse(xml) {
    var doc;
    var src = String(xml || '').replace(/^\uFEFF/, '');
    try {
        doc = new DOMParser().parseFromString(src, 'application/xml');
    } catch (e) {
        return { error: 'Не удалось разобрать XML: ' + e.message };
    }
    var top = doc && doc.documentElement;
    if (!top || localName(top) !== 'DataCompositionSchema') return { error: 'Это не схема компоновки данных.' };
    var bad = doc.querySelector && doc.querySelector('parsererror');
    if (bad) return { error: 'Не удалось разобрать XML: ' + textOf(bad) };
    var parser = new Parser(src, doc);
    var model = parser.schema(top, '');
    model.titles = parser.titles;
    /* Offsets were taken without the BOM; a host edits the text with it. */
    model.bom = String(xml || '').charAt(0) === '\uFEFF' ? 1 : 0;
    /* What property edits need, kept out of the model's enumerable data. */
    var source = { owners: parser.owners, pos: parser.pos, xml: src, eol: /\r\n/.test(src) ? '\r\n' : '\n' };
    (function share(m) {
        Object.defineProperty(m, 'source', { value: source, enumerable: false });
        if (m !== model) Object.defineProperty(m, 'bom', { value: model.bom, enumerable: false });
        m.nested.forEach(function (n) { if (n.schema) share(n.schema); });
    })(model);
    return { model: model };
}

// ---------------------------------------------------------- property edits

/* The child order of every element the window edits, as all 1338 schemas of
 * the AT export write it (none contradicts it). A new child goes right after
 * the last present child that precedes it. */
var CHILD_ORDER = {
    schema: ['dataSource', 'dataSet', 'dataSetLink', 'calculatedField', 'totalField', 'parameter', 'template', 'fieldTemplate',
        'groupTemplate', 'groupHeaderTemplate', 'nestedSchema', 'totalFieldsTemplate', 'settingsVariant'],
    set: ['name', 'field', 'dataSource', 'query', 'objectName', 'item', 'autoFillFields', 'useQueryGroupIfPossible'],
    field: ['dataPath', 'field', 'title', 'useRestriction', 'attributeUseRestriction', 'role', 'presentationExpression',
        'orderExpression', 'inHierarchyDataSet', 'inHierarchyDataSetParameter', 'valueType', 'appearance', 'availableValue',
        'inputParameters'],
    calc: ['dataPath', 'expression', 'title', 'useRestriction', 'presentationExpression', 'orderExpression', 'appearance',
        'availableValue', 'valueType', 'inputParameters'],
    total: ['dataPath', 'expression', 'group'],
    param: ['name', 'title', 'valueType', 'value', 'useRestriction', 'expression', 'availableValue', 'valueListAllowed',
        'availableAsField', 'functionalOptionsParameter', 'inputParameters', 'denyIncompleteValues', 'use'],
    link: ['sourceDataSet', 'destinationDataSet', 'sourceExpression', 'destinationExpression', 'parameter',
        'parameterListAllowed', 'startExpression', 'linkConditionExpression', 'required'],
    restriction: ['field', 'condition', 'group', 'order'],
    nested: ['name', 'title', 'schema', 'settings'],
    tpl: ['name', 'template', 'parameter']
};

var RESTRICTIONS = { restrict: 'useRestriction', attrRestrict: 'attributeUseRestriction' };

/* How each editable property is written:
 * text      — the element's text, the element kept even when empty;
 * optional  — the same, an empty text removes the element;
 * title     — the Russian title, no element while the title is automatic;
 * flags     — a use restriction flag (`restrict.group`), written only when set;
 * bool:D    — true/false, the element absent while it equals D (no D: always written);
 * enum:D    — a word, absent while it equals D;
 * value     — a parameter value of a single primitive type;
 * name      — a name unique among its siblings, letters, digits and «_»;
 * set       — the name of a data set of the schema.
 * The defaults are the values no schema of the AT export writes. */
var PROPERTIES = {
    set: { autoFillFields: 'bool:true', useQueryGroupIfPossible: 'bool:true', query: 'text', objectName: 'path' },
    field: { dataPath: 'path', field: 'path', title: 'title', presentationExpression: 'optional', restrict: 'flags', attrRestrict: 'flags' },
    calc: { dataPath: 'path', expression: 'text', title: 'title', presentationExpression: 'optional', restrict: 'flags' },
    total: { expression: 'text' },
    param: {
        title: 'title', expression: 'optional', value: 'value', useRestriction: 'bool:', availableAsField: 'bool:true',
        denyIncompleteValues: 'bool:false', use: 'enum:Auto'
    },
    link: {
        sourceDataSet: 'set', destinationDataSet: 'set', sourceExpression: 'text', destinationExpression: 'text',
        parameter: 'optional', parameterListAllowed: 'bool:false', startExpression: 'optional', linkConditionExpression: 'optional',
        required: 'bool:false'
    },
    nested: { name: 'name', title: 'title' }
};

var ENUMS = { use: ['Auto', 'Always'] };

function propertySpec(model, id, prop) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner) return null;
    prop = String(prop || '');
    var dot = prop.indexOf('.');
    var base = dot > 0 ? prop.slice(0, dot) : prop;
    var how = own(PROPERTIES[owner.kind] || {}, base);
    if (!how) return null;
    var flag = dot > 0 ? prop.slice(dot + 1) : '';
    if ((how === 'flags') !== (CHILD_ORDER.restriction.indexOf(flag) >= 0)) return null;
    var colon = how.indexOf(':');
    return {
        src: src, owner: owner, base: base, flag: flag,
        how: colon > 0 ? how.slice(0, colon) : how, def: colon > 0 ? how.slice(colon + 1) : ''
    };
}

/* The exact text of an element, line breaks as \n. */
function exactText(src, el) {
    var rec = el && src.pos.rec(el);
    if (!rec) return textOf(el);
    return decodeXml(src.xml.slice(rec.contentStart, rec.end)).replace(/\r\n/g, '\n');
}

function ruItem(title) {
    var items = namedChildren(title, 'item');
    for (var i = 0; i < items.length; i++) if (textOf(firstChild(items[i], 'lang')) === 'ru') return items[i];
    return null;
}

/* The titles the platform would show by itself: writing one of them is the
 * same as writing none. */
function automaticTitle(owner, text) {
    var name = owner.auto;
    var last = lastName(name);
    return !text || text === name || text === last || text === terms.identWords(last) || text === terms.identWords(name);
}

/* The current value of an editable property: a string, or a boolean for a
 * flag. null when the property cannot be edited. */
function propertyValue(model, id, prop) {
    var s = propertySpec(model, id, prop);
    if (!s) return null;
    var el = s.owner.el;
    var c = firstChild(el, s.base);
    /* Only a query set has a query to change. */
    if (s.base === 'query' && !c) return null;
    switch (s.how) {
        case 'text': case 'optional': return c ? exactText(s.src, c) : '';
        case 'path': case 'name': case 'set': return c ? exactText(s.src, c) : null;
        case 'title': {
            var t = firstChild(el, 'title');
            /* Some exports write a title as a plain string. */
            if (t && xsiType(t) === 'string') return exactText(s.src, t);
            var item = ruItem(t);
            return item ? exactText(s.src, firstChild(item, 'content')) : '';
        }
        case 'flags': return isTrue(firstChild(firstChild(el, RESTRICTIONS[s.base]), s.flag));
        case 'bool': return (c ? textOf(c) : s.def) === 'true';
        case 'enum': return c ? textOf(c) : s.def;
        case 'value': {
            var sv = simpleValue(el, s.src);
            return sv ? sv.text : null;
        }
    }
    return null;
}

function indentBefore(xml, at) {
    var i = at;
    while (i > 0 && (xml.charAt(i - 1) === ' ' || xml.charAt(i - 1) === '\t')) i--;
    return xml.slice(i, at);
}

/* The start of the line break and indent before `at`, so removing an element
 * takes its line with it. */
function lineStart(xml, at) {
    var i = at - indentBefore(xml, at).length;
    if (xml.charAt(i - 1) !== '\n') return at;
    i--;
    if (xml.charAt(i - 1) === '\r') i--;
    return i;
}

function encodeText(src, rec, text) {
    var raw = rec ? src.xml.slice(rec.contentStart, rec.end) : '';
    var eol = /\n/.test(raw) ? (/\r\n/.test(raw) ? '\r\n' : '\n') : src.eol;
    return encodeXml(text).replace(/\n/g, eol);
}

/* Lines of [depth, text] joined at `indent`, the first one unindented. */
function fragment(lines, indent, eol) {
    return lines.map(function (l, i) {
        return (i ? eol + indent : '') + new Array(l[0] + 1).join('\t') + l[1];
    }).join('');
}

function textOp(src, el, text) {
    var rec = src.pos.rec(el);
    if (!rec) return null;
    var body = encodeText(src, rec, text);
    var open = src.xml.slice(rec.start, rec.contentStart);
    if (!body) return rec.selfClosing ? null : { start: rec.start, end: rec.close, text: open.replace(/>$/, '/>') };
    if (rec.selfClosing) return { start: rec.start, end: rec.close, text: open.replace(/\s*\/>$/, '>') + body + '</' + rec.tag + '>' };
    return { start: rec.contentStart, end: rec.end, text: body };
}

function removeOp(src, el) {
    var rec = src.pos.rec(el);
    return rec ? { start: lineStart(src.xml, rec.start), end: rec.close, text: '' } : null;
}

function insertOp(src, parent, order, name, lines) {
    var prec = src.pos.rec(parent);
    var at = order.indexOf(name);
    if (!prec || prec.selfClosing || at < 0) return null;
    var kids = parent.children || [];
    var anchor = null;
    /* After children of the same name too: a repeated element (a field, a
     * resource) is appended to its run. */
    for (var i = 0; i < kids.length; i++) {
        var k = order.indexOf(localName(kids[i]));
        if (k >= 0 && k <= at) anchor = kids[i];
    }
    var first = kids.length ? src.pos.rec(kids[0]) : null;
    var indent = first ? indentBefore(src.xml, first.start) : indentBefore(src.xml, prec.start) + '\t';
    var arec = anchor && src.pos.rec(anchor);
    var pos = arec ? arec.close : prec.contentStart;
    return { start: pos, end: pos, text: src.eol + indent + fragment(lines, indent, src.eol) };
}

function titleLines(text) {
    return [[0, '<title xsi:type="v8:LocalStringType">']].concat(ruItemLines(text, 1), [[0, '</title>']]);
}

function ruItemLines(text, depth) {
    return [[depth, '<v8:item>'], [depth + 1, '<v8:lang>ru</v8:lang>'],
        [depth + 1, '<v8:content>' + encodeXml(text) + '</v8:content>'], [depth, '</v8:item>']];
}

function titleOp(src, owner, value) {
    var text = String(value == null ? '' : value).replace(/\s*\n\s*/g, ' ');
    var el = owner.el;
    var title = firstChild(el, 'title');
    if (title && xsiType(title) === 'string') {
        if (exactText(src, title) === text) return null;
        return text ? textOp(src, title, text) : removeOp(src, title);
    }
    var item = ruItem(title);
    var content = item && firstChild(item, 'content');
    /* A written title left as it is stays, even one the platform would show anyway. */
    if (content && exactText(src, content) === text) return null;
    /* An empty title takes the Russian one away: the whole element when it
     * held nothing else. */
    if (!text) {
        if (!item) return null;
        return namedChildren(title, 'item').length > 1 ? removeOp(src, item) : removeOp(src, title);
    }
    /* A written title keeps its element whatever it becomes, so typing the
     * old text back restores the old source; a missing one is written only
     * when it differs from the title the platform shows by itself. */
    if (!title) return automaticTitle(owner, text.trim()) ? null : insertOp(src, el, CHILD_ORDER[owner.kind], 'title', titleLines(text));
    if (content) return textOp(src, content, text);
    var trec = src.pos.rec(title);
    if (!trec) return null;
    var kids = title.children || [];
    if (!kids.length) {
        var at = lineStart(src.xml, trec.start);
        var indent = indentBefore(src.xml, trec.start);
        return { start: at, end: trec.close, text: src.eol + indent + fragment(titleLines(text), indent, src.eol) };
    }
    var firstRec = src.pos.rec(kids[0]);
    var ind = indentBefore(src.xml, firstRec.start);
    return { start: trec.contentStart, end: trec.contentStart, text: src.eol + ind + fragment(ruItemLines(text, 0), ind, src.eol) };
}

function flagOp(src, s, on) {
    var el = s.owner.el;
    var name = RESTRICTIONS[s.base];
    var box = firstChild(el, name);
    var flag = box && firstChild(box, s.flag);
    if (!on) {
        if (!flag) return null;
        return (box.children || []).length === 1 ? removeOp(src, box) : removeOp(src, flag);
    }
    if (flag) return textOf(flag) === 'true' ? null : textOp(src, flag, 'true');
    var line = '<' + s.flag + '>true</' + s.flag + '>';
    if (box) return insertOp(src, box, CHILD_ORDER.restriction, s.flag, [[0, line]]);
    return insertOp(src, el, CHILD_ORDER[s.owner.kind], name, [[0, '<' + name + '>'], [1, line], [0, '</' + name + '>']]);
}

function scalarOp(src, s, word) {
    var el = s.owner.el;
    var c = firstChild(el, s.base);
    if (s.def && word === s.def) return c ? removeOp(src, c) : null;
    if (c) return textOf(c) === word ? null : textOp(src, c, word);
    return insertOp(src, el, CHILD_ORDER[s.owner.kind], s.base, [[0, '<' + s.base + '>' + word + '</' + s.base + '>']]);
}

var YES = { 'да': 1, 'истина': 1, 'true': 1, '1': 1, 'yes': 1 };
var NO = { 'нет': 1, 'ложь': 1, 'false': 1, '0': 1, 'no': 1, '': 1 };

function daysIn(y, m) {
    return [31, y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

/* A value typed in the window as the text its <value> element holds. */
function valueWord(sv, text) {
    var t = String(text == null ? '' : text);
    if (sv.kind === 'string') return { word: t };
    t = t.trim();
    if (sv.kind === 'boolean') {
        var low = t.toLowerCase();
        if (own(YES, low)) return { word: 'true' };
        if (own(NO, low)) return { word: 'false' };
        return { error: 'Ожидается «Да» или «Нет»' };
    }
    if (sv.kind === 'decimal') {
        var n = t.replace(/[\s ]/g, '').replace(',', '.');
        if (!n) return { word: '0' };
        var m = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(n);
        if (!m || !(m[2] || m[3])) return { error: 'Ожидается число' };
        var whole = m[2].replace(/^0+(?=\d)/, '') || '0';
        var frac = (m[3] || '').replace(/0+$/, '');
        var num = whole + (frac ? '.' + frac : '');
        return { word: m[1] === '-' && num !== '0' ? '-' + num : num };
    }
    if (!t) return { word: '0001-01-01T00:00:00' };
    var iso = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)$/.exec(t);
    var ru = /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d\d)(?::(\d\d))?)?$/.exec(t);
    var y, mo, d, h = 0, mi = 0, se = 0;
    if (iso) { y = +iso[1]; mo = +iso[2]; d = +iso[3]; h = +iso[4]; mi = +iso[5]; se = +iso[6]; }
    else if (ru) { d = +ru[1]; mo = +ru[2]; y = +ru[3]; h = +(ru[4] || 0); mi = +(ru[5] || 0); se = +(ru[6] || 0); }
    else return { error: 'Ожидается дата ДД.ММ.ГГГГ или ДД.ММ.ГГГГ ЧЧ:ММ:СС' };
    if (y < 1 || mo < 1 || mo > 12 || d < 1 || d > daysIn(y, mo) || h > 23 || mi > 59 || se > 59) return { error: 'Такой даты нет' };
    if (sv.dateOnly && h + mi + se) return { error: 'У параметра только дата, без времени' };
    function two(x) { return (x < 10 ? '0' : '') + x; }
    return { word: ('000' + y).slice(-4) + '-' + two(mo) + '-' + two(d) + 'T' + two(h) + ':' + two(mi) + ':' + two(se) };
}

function valueOp(src, s, text) {
    var el = s.owner.el;
    var sv = simpleValue(el, src);
    if (!sv) return { error: 'Значение такого типа здесь не меняется' };
    /* The text shown is the value: an untouched one, xsi:nil included, stays. */
    if (String(text == null ? '' : text) === sv.text) return null;
    var w = valueWord(sv, text);
    if (w.error) return w;
    var type = 'xs:' + sv.kind;
    var xml = sv.kind === 'string' && !w.word ? '<value xsi:type="' + type + '"/>'
        : '<value xsi:type="' + type + '">' + encodeText(src, null, w.word) + '</value>';
    var v = firstChild(el, 'value');
    var rec = v && src.pos.rec(v);
    if (!v) return insertOp(src, el, CHILD_ORDER.param, 'value', [[0, xml]]);
    if (!rec) return null;
    return src.xml.slice(rec.start, rec.close) === xml ? null : { start: rec.start, end: rec.close, text: xml };
}

/* The data sets a link of record `id` may join: those of its own schema. */
function linkSets(model, id) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    var schema = owner && parentOf(src, owner.el);
    return kidsNamed(schema, 'dataSet').map(function (d) { return textOf(firstChild(d, 'name')); });
}

/* A data set renamed: its links name it by the new name too. */
function renameSetEdit(model, id, name) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner || owner.kind !== 'set') return null;
    var n = String(name == null ? '' : name).trim();
    var old = textOf(firstChild(owner.el, 'name'));
    if (n === old) return null;
    if (!PATH_RE.test(n) || n.indexOf('.') >= 0) return { error: 'Имя — буквы, цифры и «_», не с цифры' };
    if (allSets(scopeModel(model, model.prefix || '').sets, 0, []).some(function (x) { return x.set.name === n; })) return { error: 'Набор «' + n + '» уже есть' };
    var ops = [textOp(src, firstChild(owner.el, 'name'), n)];
    var schemaEl = parentOf(src, owner.el);
    while (schemaEl && localName(schemaEl) === 'dataSet') schemaEl = parentOf(src, schemaEl);
    kidsNamed(schemaEl, 'dataSetLink').forEach(function (l) {
        ['sourceDataSet', 'destinationDataSet'].forEach(function (t) {
            var e = firstChild(l, t);
            if (e && textOf(e) === old) ops.push(textOp(src, e, n));
        });
    });
    return withBom(model, combine(src, ops), id.slice(0, id.length - old.length) + n);
}

/* The source edit that sets property `prop` of record `id` to `value`:
 * { start, end, text } in the text the model was parsed from (BOM included),
 * { error } for a value that cannot be written, null when nothing changes. */
function propertyEdit(model, id, prop, value) {
    var s = propertySpec(model, id, prop);
    if (!s) return null;
    var src = s.src;
    var op = null;
    /* The value it already has: nothing to write, whatever line breaks the text keeps. */
    var now = propertyValue(model, id, prop);
    if (typeof now === 'string' && typeof value === 'string' && now === value.replace(/\r\n/g, '\n')) return null;
    if (typeof now === 'boolean' && now === value) return null;
    /* A path or a column name: names through dots, and a path no other record of the set takes. */
    if (s.how === 'path') {
        var name = String(value == null ? '' : value).trim();
        /* A column of a nested table is named through a dot too (Товары.Количество).
         * An object set may stay without its object, as some exports leave it. */
        if (!PATH_RE.test(name) && !(s.base === 'objectName' && !name)) return { error: (s.base === 'field' ? 'Поле' : 'Путь') + ' — имена через точку: буквы, цифры и «_»' };
        if (s.base === 'dataPath') {
            var siblings = kidsNamed(parentOf(src, s.owner.el), localName(s.owner.el));
            if (siblings.some(function (k) { return k !== s.owner.el && textOf(firstChild(k, 'dataPath')) === name; })) return { error: 'Путь «' + name + '» уже есть' };
        }
        var pe = firstChild(s.owner.el, s.base);
        op = pe ? textOp(src, pe, name) : null;
    } else if (s.how === 'set') {
        var sn = String(value == null ? '' : value).trim();
        if (linkSets(model, id).indexOf(sn) < 0) return { error: 'Набора данных «' + sn + '» нет' };
        /* A set linked to itself is a hierarchy: the platform takes it. */
        var se = firstChild(s.owner.el, s.base);
        op = se ? textOp(src, se, sn) : null;
    } else if (s.how === 'name') {
        var nm = String(value == null ? '' : value).trim();
        if (!PATH_RE.test(nm) || nm.indexOf('.') >= 0) return { error: 'Имя — буквы, цифры и «_», не с цифры' };
        var same = kidsNamed(parentOf(src, s.owner.el), localName(s.owner.el));
        if (same.some(function (k) { return k !== s.owner.el && textOf(firstChild(k, 'name')) === nm; })) return { error: 'Имя «' + nm + '» уже занято' };
        var ne = firstChild(s.owner.el, 'name');
        op = ne ? textOp(src, ne, nm) : null;
    } else if (s.how === 'text' || s.how === 'optional') {
        var text = String(value == null ? '' : value).replace(/\r\n/g, '\n');
        var c = firstChild(s.owner.el, s.base);
        if (c) op = s.how === 'optional' && !text.trim() ? removeOp(src, c) : textOp(src, c, text);
        else if (text.trim()) {
            op = insertOp(src, s.owner.el, CHILD_ORDER[s.owner.kind], s.base,
                [[0, '<' + s.base + '>' + encodeText(src, null, text) + '</' + s.base + '>']]);
        }
    } else if (s.how === 'title') op = titleOp(src, s.owner, value);
    else if (s.how === 'flags') op = flagOp(src, s, !!value);
    else if (s.how === 'bool') op = scalarOp(src, s, value ? 'true' : 'false');
    else if (s.how === 'enum') {
        if ((ENUMS[s.base] || []).indexOf(value) < 0) return { error: 'Недопустимое значение' };
        op = scalarOp(src, s, value);
    } else if (s.how === 'value') op = valueOp(src, s, value);
    if (!op || op.error) return op;
    if (src.xml.slice(op.start, op.end) === op.text) return null;
    var bom = model.bom || 0;
    return { start: op.start + bom, end: op.end + bom, text: op.text };
}

// ------------------------------------------------------------------ adding

var PATH_RE = /^[A-Za-zА-Яа-яЁё_][0-9A-Za-zА-Яа-яЁё_]*(?:\.[A-Za-zА-Яа-яЁё_][0-9A-Za-zА-Яа-яЁё_]*)*$/;

function findSet(sets, id) {
    for (var i = 0; i < sets.length; i++) {
        if (sets[i].id === id) return sets[i];
        var inner = findSet(sets[i].items, id);
        if (inner) return inner;
    }
    return null;
}

/* The source edit that adds a data set field (`what` 'field', `target` the
 * set id), a calculated field ('calc') or a resource ('total') in the
 * smallest form the AT export writes them: a field is its path and column,
 * a calculated field its path and expression (no title: the platform shows
 * one by itself), a resource its field and expression. It goes after the
 * last element of its kind. { start, end, text, id } with the id of the new
 * record, or { error }. */
function addEdit(model, what, target, values) {
    var src = model && model.source;
    if (!src) return null;
    values = values || {};
    var path = String(values.dataPath || '').trim();
    if (!path) return { error: 'Укажите путь к данным' };
    if (!PATH_RE.test(path)) return { error: 'Путь к данным — имена через точку: буквы, цифры и «_»' };
    var enc = function (s) { return encodeText(src, null, String(s).replace(/\r\n/g, '\n')); };
    var parent, order, name, lines, id;
    if (what === 'field') {
        var owner = own(src.owners, target);
        var set = owner && owner.kind === 'set' ? findSet(model.sets, target) : null;
        if (!set) return null;
        if (set.fields.some(function (f) { return f.dataPath === path; })) return { error: 'В наборе уже есть поле «' + path + '»' };
        var column = String(values.field || '').trim() || path;
        if (!PATH_RE.test(column)) return { error: 'Поле — имя колонки запроса: буквы, цифры и «_»' };
        parent = owner.el;
        order = CHILD_ORDER.set;
        name = 'field';
        /* A folder groups the fields whose path goes through it (Реквизиты.ИНН);
         * a nested set is a table of the data (the rows of a document). */
        var fieldType = { folder: 'DataSetFieldFolder', nested: 'DataSetFieldNestedDataSet' }[values.kind] || 'DataSetFieldField';
        lines = [[0, '<field xsi:type="' + fieldType + '">'], [1, '<dataPath>' + enc(path) + '</dataPath>']];
        if (fieldType !== 'DataSetFieldFolder') lines.push([1, '<field>' + enc(column) + '</field>']);
        var ftitle = String(values.title || '').trim();
        if (ftitle && !automaticTitle({ auto: path }, ftitle)) titleLines(ftitle).forEach(function (l) { lines.push([l[0] + 1, l[1]]); });
        lines.push([0, '</field>']);
        id = 'field:' + target.slice(4) + ':' + path;
    } else if (what === 'calc' || what === 'total') {
        var schema = own(src.owners, schemaKey(model.prefix));
        if (!schema) return null;
        var expression = String(values.expression || '');
        if (what === 'calc') {
            if (model.calculated.some(function (c) { return c.dataPath === path; })) return { error: 'Вычисляемое поле «' + path + '» уже есть' };
            if (!expression.trim()) return { error: 'Укажите выражение' };
        } else if (!expression.trim()) expression = 'Сумма(' + path + ')';
        parent = schema.el;
        order = CHILD_ORDER.schema;
        name = what === 'calc' ? 'calculatedField' : 'totalField';
        lines = [[0, '<' + name + '>'], [1, '<dataPath>' + enc(path) + '</dataPath>'],
            [1, '<expression>' + enc(expression) + '</expression>'], [0, '</' + name + '>']];
        id = (what === 'calc' ? 'calc:' : 'total:') + (model.prefix || '') + (what === 'calc' ? model.calculated.length : model.totals.length);
    } else return null;
    var op = insertOp(src, parent, order, name, lines);
    if (!op) return null;
    var bom = model.bom || 0;
    return { start: op.start + bom, end: op.end + bom, text: op.text, id: id };
}

function applyAdd(xml, model, what, target, values) {
    var edit = addEdit(model, what, target, values);
    if (!edit || edit.error) return edit;
    return { xml: xml.slice(0, edit.start) + edit.text + xml.slice(edit.end), id: edit.id };
}

/* The output columns of a query, for the names a new field is offered:
 * the aliases of the first SELECT of the last statement that is not a
 * temporary table, else the last name of each column's path. A hint only —
 * the user may type any name. */
/* A keyword of the query language as a whole word: \b knows no Cyrillic. */
var WORD = 'A-Za-zА-Яа-яЁё0-9_';

function keyword(words, flags) {
    return new RegExp('(?:^|[^' + WORD + '])(?:' + words + ')(?![' + WORD + '])', flags || 'i');
}

var WORD_CHAR_RE = new RegExp('[' + WORD + ']');
var SELECT_RE = keyword('ВЫБРАТЬ|SELECT');
var TEMP_TABLE_RE = keyword('ПОМЕСТИТЬ|INTO');
var DROP_RE = new RegExp('^\\s*(?:УНИЧТОЖИТЬ|DROP)(?![' + WORD + '])', 'i');
var SELECT_HEAD_RE = new RegExp('(?:^|[^' + WORD + '])(?:ВЫБРАТЬ|SELECT)(?:\\s+(?:РАЗРЕШЕННЫЕ|РАЗЛИЧНЫЕ|ALLOWED|DISTINCT)|\\s+(?:ПЕРВЫЕ|TOP)\\s+\\d+)*(?![' + WORD + '])', 'i');
var LIST_END_RE = new RegExp('^(?:ИЗ|FROM|ОБЪЕДИНИТЬ|UNION|СГРУППИРОВАТЬ|GROUP|УПОРЯДОЧИТЬ|ORDER|ГДЕ|WHERE|ИТОГИ|TOTALS|ИМЕЮЩИЕ|HAVING|ДЛЯ|FOR)(?![' + WORD + '])', 'i');
var ALIAS_RE = new RegExp('(?:^|[^' + WORD + '])(?:КАК|AS)\\s+([A-Za-zА-Яа-яЁё_][' + WORD + ']*)\\s*$', 'i');

function queryColumns(text) {
    var q = String(text || '').replace(/\/\/[^\n]*/g, '').replace(/"(?:[^"]|"")*"/g, '""');
    /* Data composition braces ({ГДЕ ...}, {ВЫБРАТЬ ...}) hold no output columns. */
    var prev;
    do { prev = q; q = q.replace(/\{[^{}]*\}/g, ' '); } while (q !== prev);
    var statements = q.split(';').filter(function (s) {
        return SELECT_RE.test(s) && !TEMP_TABLE_RE.test(s) && !DROP_RE.test(s);
    });
    var st = statements[statements.length - 1];
    if (!st) return [];
    var m = SELECT_HEAD_RE.exec(st);
    if (!m) return [];
    var rest = st.slice(m.index + m[0].length);
    var list = '';
    var depth = 0;
    for (var i = 0; i < rest.length; i++) {
        var ch = rest.charAt(i);
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (!depth && !WORD_CHAR_RE.test(rest.charAt(i - 1) || ' ') && LIST_END_RE.test(rest.slice(i))) break;
        list += ch;
    }
    var out = [];
    var part = '';
    depth = 0;
    function take(p) {
        p = p.trim();
        if (!p || /\*$/.test(p)) return;
        var alias = ALIAS_RE.exec(p);
        var name = alias ? alias[1] : (/(?:^|\.)([A-Za-zА-Яа-яЁё_][\wА-Яа-яЁё]*)$/.exec(p) || [])[1];
        if (name && out.indexOf(name) < 0) out.push(name);
    }
    for (var k = 0; k < list.length; k++) {
        var c = list.charAt(k);
        if (c === '(') depth++;
        else if (c === ')') depth--;
        if (c === ',' && !depth) { take(part); part = ''; } else part += c;
    }
    take(part);
    return out;
}

/* ------------------------------------------------------------- autofill */

/* What a query gives a data set, as the Designer's autofill reads it:
 * { columns: [{ name, nested: [name] | null }], parameters: [name] }, or
 * null where the text is no query the parser takes (half typed).
 * - The result is the last statement that selects into no temporary table;
 *   a union takes the names of its first query.
 * - A column without КАК is named by its path past the table alias
 *   (Т.Контрагент.ИНН -> КонтрагентИНН), a parameter by its name, an
 *   aggregate by the field it counts, any other expression Поле1, Поле2 ...
 *   (all as the AT export names them); a repeated name gets
 *   1, 2 ... appended, as the platform names them.
 * - Т.Товары.(Номенклатура, Количество) is a nested table with its columns.
 * - Parameters are the &names of the text out of strings and comments. */
function queryResult(text) {
    var core = root.BslQueryBuilderCore;
    if (!core || !core.parseSdbl) return null;
    var pkg;
    try { pkg = core.parseSdbl(String(text || '')); } catch (e) { return null; }
    var selects = (pkg && pkg.queries || []).filter(function (q) { return q && q.type === 'Select' && !q.into; });
    var last = selects[selects.length - 1];
    if (!last) return null;
    var aliases = {};
    (last.from || []).forEach(function addFrom(c) {
        if (c.alias) aliases[c.alias.toLowerCase()] = 1;
        else if (c.source && c.source.type === 'Table') aliases[String(c.source.name).split('.').pop().toLowerCase()] = 1;
        if (c.source && c.source.type === 'JoinedTable') (c.source.clauses || []).forEach(addFrom);
        (c.joins || []).forEach(function (j) { addFrom({ source: j.source, alias: j.alias }); });
    });
    function pathName(e) {
        if (!e || typeof e === 'string') return '';
        if (e.type === 'Identifier' || e.type === 'Parameter') return e.name;
        if (e.type === 'CompoundIdentifier') {
            var parts = e.parts.slice();
            if (parts.length > 1 && own(aliases, parts[0].toLowerCase())) parts.shift();
            return parts.join('');
        }
        if (e.type === 'MemberAccess') { var b = pathName(e.expression); return b ? b + e.member : ''; }
        if (e.type === 'TableProjection') return pathName(e.expression);
        if (e.type === 'Aggregate' && e.aggregateType !== 'Count') return pathName(e.expression);
        return '';
    }
    function names(fields) {
        var taken = {}, generated = 0;
        return fields.map(function (f) {
            var name = f.alias || pathName(f.expression);
            if (!name) name = 'Поле' + (++generated);
            var base = name, n = 0;
            while (own(taken, name.toLowerCase())) name = base + (++n);
            taken[name.toLowerCase()] = 1;
            return name;
        });
    }
    var columns = names(last.fields || []).map(function (name, i) {
        var e = last.fields[i].expression;
        return { name: name, nested: e && e.type === 'TableProjection' ? names(e.fields || []) : null };
    });
    if (!columns.length) return null;
    var plainText = String(text || '').replace(/\/\/[^\n]*/g, '').replace(/"(?:[^"]|"")*"/g, '""');
    var parameters = [], seen = {};
    plainText.replace(new RegExp('&([A-Za-zА-Яа-яЁё_][' + WORD + ']*)', 'g'), function (all, p) {
        if (!own(seen, p.toLowerCase())) { seen[p.toLowerCase()] = 1; parameters.push(p); }
        return all;
    });
    return { columns: columns, parameters: parameters };
}

/* The edit that brings the fields of a query set with autofill on to its
 * query, as the Designer does when the query changes: a column without a
 * field gets one (a nested table its nested set and the fields of its
 * columns) after the last field. A field whose column is gone stays and is
 * named in `absent`, unless opts.removeMissing: then it is removed when it is
 * as autofill made it (its path and column, nothing else) and kept otherwise,
 * the user's titles, roles and appearance being worth more than a step with
 * the query: such fields are named in `stale`. Folders
 * and the fields of columns still there keep everything. A parameter of the text the schema lacks is added the way
 * the Designer adds it: its name, a title from the name, an empty value,
 * restricted for the user. { start, end, text, added, removed, stale, absent, parameters }
 * or null when nothing changes, the set fills by hand or the query is not
 * understood; { none: true, stale, absent } when only fields without a column are there. */
function autoFillEdit(model, setId, opts) {
    var removeMissing = !!(opts && opts.removeMissing);
    var src = model && model.source;
    var set = src && findSet(model.sets, setId);
    if (!set || set.kind !== 'DataSetQuery' || !set.autoFill || !set.query) return null;
    var result = queryResult(set.query.text);
    if (!result) return null;
    var owner = own(src.owners, setId);
    var col = {};
    result.columns.forEach(function (c) { col[c.name.toLowerCase()] = c; });
    var ops = [], removed = [], stale = [], absent = [], added = [], have = {};
    var fieldEls = kidsNamed(owner.el, 'field');
    set.fields.forEach(function (f, i) {
        if (f.kind === 'folder' || !f.field) return;
        var parts = f.field.split('.');
        var c = own(col, parts[0].toLowerCase());
        var keep = c && (parts.length === 1 || !c.nested
            || c.nested.some(function (n) { return n.toLowerCase() === parts[1].toLowerCase(); }));
        if (keep && parts.length > 1 && c.nested) have[f.field.toLowerCase()] = 1;
        if (keep && parts.length === 1) have[parts[0].toLowerCase()] = 1;
        if (keep || !fieldEls[i]) return;
        if (!removeMissing) { absent.push(f.dataPath); return; }
        var made = f.kind === 'field' && f.dataPath === f.field
            && Array.prototype.every.call(fieldEls[i].children || [], function (k) { var n = localName(k); return n === 'dataPath' || n === 'field'; });
        if (made) { ops.push(removeOp(src, fieldEls[i])); removed.push(f.dataPath); } else stale.push(f.dataPath);
    });
    var taken = {};
    set.fields.forEach(function (f) { if (!removed.some(function (r) { return r === f.dataPath; })) taken[String(f.dataPath).toLowerCase()] = 1; });
    var enc = function (s) { return encodeText(src, null, s); };
    var lines = [];
    function field(type, path, column) {
        if (own(taken, path.toLowerCase())) return;
        taken[path.toLowerCase()] = 1;
        added.push(path);
        lines.push([0, '<field xsi:type="' + type + '">'], [1, '<dataPath>' + enc(path) + '</dataPath>'],
            [1, '<field>' + enc(column) + '</field>'], [0, '</field>']);
    }
    result.columns.forEach(function (c) {
        if (!own(have, c.name.toLowerCase())) field(c.nested ? 'DataSetFieldNestedDataSet' : 'DataSetFieldField', c.name, c.name);
        (c.nested || []).forEach(function (n) {
            var p = c.name + '.' + n;
            if (!own(have, p.toLowerCase())) field('DataSetFieldField', p, p);
        });
    });
    /* After the last field that stays, or where the first field goes. */
    if (lines.length) {
        var kept = fieldEls.filter(function (el, i) { return removed.indexOf(set.fields[i].dataPath) < 0; });
        var anchor = kept[kept.length - 1];
        var arec = anchor && src.pos.rec(anchor);
        if (arec) {
            var indent = indentBefore(src.xml, arec.start);
            ops.push({ start: arec.close, end: arec.close, text: src.eol + indent + fragment(lines, indent, src.eol) });
        } else ops.push(insertOp(src, owner.el, CHILD_ORDER.set, 'field', lines));
    }
    var known = {};
    model.parameters.forEach(function (p) { known[String(p.name).toLowerCase()] = 1; });
    var newParams = result.parameters.filter(function (p) { return !own(known, p.toLowerCase()); });
    var schema = own(src.owners, schemaKey(model.prefix));
    if (newParams.length && schema) {
        var plines = [];
        newParams.forEach(function (p) {
            plines.push([0, '<parameter>'], [1, '<name>' + enc(p) + '</name>']);
            titleLines(terms.identWords(p) || p).forEach(function (l) { plines.push([l[0] + 1, l[1]]); });
            plines.push([1, '<value xsi:nil="true"/>'], [1, '<useRestriction>true</useRestriction>'], [0, '</parameter>']);
        });
        ops.push(insertOp(src, schema.el, CHILD_ORDER.schema, 'parameter', plines));
    } else newParams = [];
    if (!ops.length) return stale.length || absent.length ? { none: true, added: [], removed: [], stale: stale, absent: absent, parameters: [] } : null;
    var edit = withBom(model, combine(src, ops));
    if (!edit) return null;
    edit.stale = stale;
    edit.absent = absent;
    edit.added = added;
    edit.removed = removed;
    edit.parameters = newParams;
    return edit;
}

/* The edit that fills a data set of the "object" kind from the columns of the
 * value table the code hands the schema ([{ name, title, type }], type typed
 * as the window types it: «СправочникСсылка.X, Строка(50)»): a column without
 * a field gets one with its type and title after the last field; a field of a
 * column with no type of its own gets the column's. Nothing else is changed:
 * fields the table lacks stay (named in `absent`), a type set by hand stays.
 * { start, end, text, added, typed, absent } or { none: true, absent } when
 * nothing is to change; null for no such set. */
function objectFieldsEdit(model, setId, columns) {
    var src = model && model.source;
    var set = src && findSet(model.sets, setId);
    if (!set || set.kind !== 'DataSetObject') return null;
    var owner = own(src.owners, setId);
    var fieldEls = kidsNamed(owner.el, 'field');
    var byColumn = {}, taken = {};
    set.fields.forEach(function (f, i) {
        if (f.kind === 'field' && f.field && fieldEls[i]) byColumn[f.field.toLowerCase()] = fieldEls[i];
        taken[String(f.dataPath).toLowerCase()] = 1;
    });
    var depth = elementDepth(src, owner.el) + 3;
    var enc = function (s) { return encodeText(src, null, s); };
    var ops = [], lines = [], added = [], typed = [];
    (columns || []).forEach(function (c) {
        var name = String(c.name || '');
        if (!PATH_RE.test(name) || name.indexOf('.') >= 0) return;
        var t = c.type ? typeLines(c.type, depth) : { lines: null };
        if (t.error) t = { lines: null };
        var el = own(byColumn, name.toLowerCase());
        if (el) {
            if (t.lines && !firstChild(el, 'valueType')) {
                ops.push(insertOp(src, el, CHILD_ORDER.field, 'valueType', t.lines));
                typed.push(name);
            }
            return;
        }
        if (own(taken, name.toLowerCase())) return;
        taken[name.toLowerCase()] = 1;
        added.push(name);
        lines.push([0, '<field xsi:type="DataSetFieldField">'], [1, '<dataPath>' + enc(name) + '</dataPath>'], [1, '<field>' + enc(name) + '</field>']);
        if (c.title) titleLines(c.title).forEach(function (l) { lines.push([l[0] + 1, l[1]]); });
        if (t.lines) t.lines.forEach(function (l) { lines.push([l[0] + 1, l[1]]); });
        lines.push([0, '</field>']);
    });
    if (lines.length) {
        var last = fieldEls[fieldEls.length - 1];
        var lrec = last && src.pos.rec(last);
        if (lrec) {
            var indent = indentBefore(src.xml, lrec.start);
            ops.push({ start: lrec.close, end: lrec.close, text: src.eol + indent + fragment(lines, indent, src.eol) });
        } else ops.push(insertOp(src, owner.el, CHILD_ORDER.set, 'field', lines));
    }
    var names = {};
    (columns || []).forEach(function (c) { names[String(c.name).toLowerCase()] = 1; });
    var absent = set.fields.filter(function (f) {
        return f.kind === 'field' && f.field && !own(names, f.field.split('.')[0].toLowerCase());
    }).map(function (f) { return f.dataPath; });
    if (!ops.length) return { none: true, added: [], typed: [], absent: absent };
    var edit = withBom(model, combine(src, ops));
    if (!edit) return null;
    edit.added = added;
    edit.typed = typed;
    edit.absent = absent;
    return edit;
}

function applyProperty(xml, model, id, prop, value) {
    var edit = propertyEdit(model, id, prop, value);
    if (!edit || edit.error) return edit && edit.error ? edit : null;
    return xml.slice(0, edit.start) + edit.text + xml.slice(edit.end);
}

// ---------------------------------------------------------- structure edits

var GROUP_ORDER = ['use', 'name', 'groupItems', 'filter', 'order', 'selection', 'conditionalAppearance', 'outputParameters',
    'item', 'viewMode', 'id', 'userSettingID', 'userSettingPresentation', 'itemsViewMode', 'itemsUserSettingID', 'itemsUserSettingPresentation'];
var SETTINGS_ORDER = {
    settings: ['userFields', 'selection', 'filter', 'dataParameters', 'order', 'conditionalAppearance', 'outputParameters',
        'item', 'additionalProperties', 'itemsViewMode', 'itemsUserSettingID', 'itemsUserSettingPresentation'],
    StructureItemGroup: GROUP_ORDER,
    StructureItemTable: ['use', 'name', 'column', 'row', 'selection', 'conditionalAppearance', 'outputParameters', 'viewMode',
        'userSettingID', 'userSettingPresentation', 'columnsViewMode', 'rowsViewMode', 'columnsUserSettingID', 'rowsUserSettingID',
        'rowsUserSettingPresentation'],
    StructureItemChart: ['use', 'name', 'point', 'series', 'selection', 'conditionalAppearance', 'outputParameters', 'viewMode',
        'userSettingID', 'userSettingPresentation', 'pointsViewMode', 'seriesViewMode', 'pointsUserSettingPresentation'],
    StructureItemNestedObject: ['name', 'objectID', 'settings', 'userSettingID', 'userSettingPresentation', 'viewMode'],
    list: ['item', 'viewMode', 'userSettingID', 'userSettingPresentation'],
    SelectedItemField: ['use', 'field', 'lwsTitle', 'viewMode', 'title'],
    SelectedItemFolder: ['use', 'field', 'lwsTitle', 'title', 'item', 'placement', 'viewMode'],
    SelectedItemAuto: ['use'],
    FilterItemComparison: ['use', 'left', 'comparisonType', 'right', 'presentation', 'viewMode', 'userSettingID',
        'userSettingPresentation', 'application'],
    FilterItemGroup: ['use', 'groupType', 'item', 'presentation', 'application', 'viewMode', 'userSettingID', 'userSettingPresentation'],
    OrderItemField: ['use', 'field', 'orderType', 'viewMode'],
    OrderItemAuto: ['use'],
    GroupItemField: ['use', 'field', 'groupType', 'periodAdditionType', 'periodAdditionBegin', 'periodAdditionEnd'],
    GroupItemAuto: ['use'],
    SettingsParameterValue: ['use', 'parameter', 'value', 'item', 'viewMode', 'userSettingID', 'userSettingPresentation'],
    appearance: ['use', 'selection', 'filter', 'appearance', 'presentation', 'viewMode', 'userSettingID', 'userSettingPresentation',
        'useInGroup', 'useInHierarchicalGroup', 'useInOverall', 'useInFieldsHeader', 'useInHeader', 'useInParameters', 'useInFilter',
        'useInResourceFieldsHeader', 'useInOverallHeader', 'useInOverallResourceFieldsHeader'],
    variant: ['name', 'presentation', 'settings']
};

/* The order of an element's children, whichever part of the schema it is. */
function orderOf(owner) {
    if (!owner) return null;
    if (owner.kind === 'variant') return SETTINGS_ORDER.variant;
    if (owner.kind === 'slist') return SETTINGS_ORDER.list;
    if (owner.kind === 'snode') {
        var tag = localName(owner.el);
        if (tag === 'settings') return SETTINGS_ORDER.settings;
        return own(SETTINGS_ORDER, xsiType(owner.el)) || GROUP_ORDER;
    }
    if (owner.kind === 'sitem') return own(SETTINGS_ORDER, xsiType(owner.el)) || (owner.list === 'appearance' ? SETTINGS_ORDER.appearance : null);
    return CHILD_ORDER[owner.kind] || null;
}

function tagOf(src, el) {
    var rec = el && src.pos.rec(el);
    return rec ? rec.tag : '';
}

function prefixOf(tag) {
    var i = String(tag || '').indexOf(':');
    return i >= 0 ? tag.slice(0, i + 1) : '';
}

/* The namespace prefix a new child of `el` gets: that of its children, else
 * its own (a settings element is all of one namespace), else `fallback`. */
function childPrefix(src, el, fallback) {
    var kids = (el && el.children) || [];
    if (kids.length) return prefixOf(tagOf(src, kids[0]));
    var p = prefixOf(tagOf(src, el));
    return p || fallback || '';
}

/* The prefix the children of an editable record are written with: the schema's
 * own records are in its default namespace, the settings in dcsset (parameter
 * values in dcscor, as their siblings show). */
function ownerPrefix(src, owner) {
    if (!owner || owner.kind === 'set' || owner.kind === 'field' || owner.kind === 'calc' || owner.kind === 'total'
        || owner.kind === 'param' || owner.kind === 'link' || owner.kind === 'schema') return '';
    return childPrefix(src, owner.el, 'dcsset:');
}

/* Removes a child; a parent left empty closes itself again, as it was before
 * the child came (insertChild opens a self-closed one). */
function removeChildOp(src, parent, child) {
    var prec = src.pos.rec(parent);
    if (prec && (parent.children || []).length === 1 && !src.xml.slice(prec.contentStart, src.pos.rec(child).start).trim()) {
        var open = src.xml.slice(prec.start, prec.contentStart).replace(/>$/, '/>');
        return { start: prec.start, end: prec.close, text: open };
    }
    return removeOp(src, child);
}

/* Inserts a child, opening a self-closed parent. */
function insertChild(src, parent, order, name, lines) {
    var prec = src.pos.rec(parent);
    if (!prec || !order) return null;
    if (!prec.selfClosing) return insertOp(src, parent, order, name, lines);
    var indent = indentBefore(src.xml, prec.start);
    var open = src.xml.slice(prec.start, prec.close).replace(/\s*\/>$/, '>');
    return {
        start: prec.start, end: prec.close,
        text: open + src.eol + indent + '\t' + fragment(lines, indent + '\t', src.eol) + src.eol + indent + '</' + prec.tag + '>'
    };
}

/* One edit out of several that touch different places: the span from the
 * first to the last, its untouched parts kept. */
function combine(src, ops) {
    /* An insertion goes before a removal that starts where it is. */
    ops = ops.filter(Boolean).sort(function (a, b) { return a.start - b.start || a.end - b.end; });
    if (!ops.length) return null;
    for (var i = 1; i < ops.length; i++) if (ops[i].start < ops[i - 1].end) return null;
    var start = ops[0].start, end = ops[ops.length - 1].end;
    var text = '';
    var at = start;
    for (var k = 0; k < ops.length; k++) {
        text += src.xml.slice(at, ops[k].start) + ops[k].text;
        at = ops[k].end;
    }
    return { start: start, end: end, text: text };
}

function withBom(model, op, id) {
    if (!op || op.error) return op;
    var bom = model.bom || 0;
    var out = { start: op.start + bom, end: op.end + bom, text: op.text };
    if (id !== undefined) out.id = id;
    return out;
}

/* Element children of `el` with the local name `tag`. */
function kidsNamed(el, tag) {
    return Array.prototype.filter.call((el && el.children) || [], function (k) { return localName(k) === tag; });
}

function parentOf(src, el) {
    return src.pos.parent(el);
}

function elementText(src, el) {
    var rec = src.pos.rec(el);
    return rec ? src.xml.slice(rec.start, rec.close) : '';
}

/* ------------------------------------------------------------- removing */

/* The kinds of record the window removes, moves and copies. */
var MOVABLE = { field: 1, calc: 1, total: 1, param: 1, link: 1, set: 1, variant: 1, sitem: 1, snode: 1, nested: 1, tpl: 1, arow: 1, cell: 1 };

function removeEdit(model, id) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner || !owner.el || !own(MOVABLE, owner.kind)) return null;
    if (owner.kind === 'snode' && localName(owner.el) === 'settings') return { error: 'Корень настроек не удаляется' };
    var ops = [];
    var parent = parentOf(src, owner.el);
    /* The last item of a settings list takes its empty list along. */
    if (owner.kind === 'sitem' && parent && (parent.children || []).length === 1 && localName(parent) !== 'item') ops.push(removeOp(src, parent));
    else ops.push(removeOp(src, owner.el));
    /* A binding takes its area along when no other binding outputs it, as the Designer drops both. */
    if (owner.kind === 'tpl' && owner.tag !== 'template') {
        var areaName = textOf(firstChild(owner.el, 'template'));
        var users = Array.prototype.filter.call(parent.children || [], function (k) {
            return k !== owner.el && /Template$/.test(localName(k)) && textOf(firstChild(k, 'template')) === areaName;
        });
        if (!users.length) kidsNamed(parent, 'template').forEach(function (d) { if (textOf(firstChild(d, 'name')) === areaName) ops.push(removeOp(src, d)); });
    }
    /* A data set takes its links along: a link to a set that is gone breaks the schema. */
    if (owner.kind === 'set') {
        var name = textOf(firstChild(owner.el, 'name'));
        var schemaEl = parent;
        while (schemaEl && localName(schemaEl) === 'dataSet') schemaEl = parentOf(src, schemaEl);
        if (schemaEl && localName(schemaEl) === 'item') schemaEl = null;
        kidsNamed(schemaEl, 'dataSetLink').forEach(function (l) {
            if (textOf(firstChild(l, 'sourceDataSet')) === name || textOf(firstChild(l, 'destinationDataSet')) === name) ops.push(removeOp(src, l));
        });
    }
    return withBom(model, combine(src, ops));
}

/* ---------------------------------------------------------------- moving */

/* The record's neighbour of the same kind, one step in `dir` (-1 up, 1 down). */
function neighbour(src, owner, dir) {
    var parent = parentOf(src, owner.el);
    var tag = localName(owner.el);
    var list = kidsNamed(parent, tag);
    var i = list.indexOf(owner.el);
    return i < 0 ? null : list[i + dir] || null;
}

/* The id a moved record gets: records numbered by their place change it. */
function movedId(id, dir) {
    /* A record of a nested schema is numbered after its schema's name: total:Схема/0. */
    var m = /^(.*[:./])(\d+)$/.exec(id);
    if (/^(field|param|set|nested|tpl):/.test(id) || !m) return id;
    return m[1] + (+m[2] + dir);
}

function moveEdit(model, id, dir) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner || !owner.el || !own(MOVABLE, owner.kind) || (dir !== -1 && dir !== 1)) return null;
    if (owner.kind === 'snode' && localName(owner.el) === 'settings') return null;
    var other = neighbour(src, owner, dir);
    if (!other) return null;
    var a = dir < 0 ? other : owner.el, b = dir < 0 ? owner.el : other;
    var ra = src.pos.rec(a), rb = src.pos.rec(b);
    if (!ra || !rb) return null;
    var text = src.xml.slice(rb.start, rb.close) + src.xml.slice(ra.close, rb.start) + src.xml.slice(ra.start, ra.close);
    return withBom(model, { start: ra.start, end: rb.close, text: text }, movedId(id, dir));
}

/* --------------------------------------------------------------- copying */

/* A name not taken yet: Имя1, Имя2 ... */
function freeName(base, taken) {
    base = String(base || '').replace(/\d+$/, '') || 'Новый';
    for (var n = 1; ; n++) if (!own(taken, base + n)) return base + n;
}

function copyEdit(model, id) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner || !owner.el) return null;
    var keyTag = { param: 'name', calc: 'dataPath', variant: 'name', nested: 'name', field: 'dataPath', set: 'name' }[owner.kind];
    if (!keyTag && owner.kind !== 'link' && owner.kind !== 'sitem' && owner.kind !== 'total') return null;
    var rec = src.pos.rec(owner.el);
    var text = src.xml.slice(rec.start, rec.close);
    var newId;
    if (keyTag) {
        var keyEl = firstChild(owner.el, keyTag);
        var kr = keyEl && src.pos.rec(keyEl);
        if (!kr) return null;
        var taken = {};
        if (owner.kind === 'param') model.parameters.forEach(function (p) { taken[p.name] = 1; });
        else if (owner.kind === 'calc') {
            model.calculated.forEach(function (c) { taken[c.dataPath] = 1; });
            availableFields(model).forEach(function walk(n) { taken[n.path] = 1; n.children.forEach(walk); });
        } else if (owner.kind === 'nested') model.nested.forEach(function (n) { taken[n.name] = 1; });
        else if (owner.kind === 'field') kidsNamed(parentOf(src, owner.el), 'field').forEach(function (f) { taken[textOf(firstChild(f, 'dataPath'))] = 1; });
        else if (owner.kind === 'set') allSets(model.sets, 0, []).forEach(function (x) { taken[x.set.name] = 1; });
        else model.variants.forEach(function (v) { taken[v.name] = 1; });
        var name = freeName(textOf(keyEl), taken);
        text = text.slice(0, kr.contentStart - rec.start) + encodeXml(name) + text.slice(kr.end - rec.start);
        newId = owner.kind === 'field' ? id.slice(0, id.lastIndexOf(':') + 1) + name
            : owner.kind === 'set' ? id.slice(0, id.length - textOf(keyEl).length) + name
            : owner.kind === 'param' || owner.kind === 'nested' ? id.replace(/[^:\/]+$/, name)
            : owner.kind === 'calc' ? id.replace(/\d+$/, String(kidsNamed(parentOf(src, owner.el), 'calculatedField').length))
            : id.replace(/\d+$/, String(kidsNamed(parentOf(src, owner.el), 'settingsVariant').length));
    } else {
        var list = kidsNamed(parentOf(src, owner.el), localName(owner.el));
        newId = owner.kind === 'link' || owner.kind === 'total' ? id.replace(/\d+$/, String(list.length)) : movedId(id, list.length - list.indexOf(owner.el));
    }
    /* The copy goes after the last of its kind, where it gets its number. */
    var last = kidsNamed(parentOf(src, owner.el), localName(owner.el)).pop();
    var lr = src.pos.rec(last);
    return withBom(model, { start: lr.close, end: lr.close, text: src.eol + indentBefore(src.xml, lr.start) + text }, newId);
}

/* --------------------------------------------------------------- types */

/* The kinds of reference a parameter type names, as the Designer writes them. */
var REF_KINDS = {
    'Справочник': 'Catalog', 'Документ': 'Document', 'Перечисление': 'Enum', 'ПланВидовХарактеристик': 'ChartOfCharacteristicTypes',
    'ПланСчетов': 'ChartOfAccounts', 'ПланВидовРасчета': 'ChartOfCalculationTypes', 'БизнесПроцесс': 'BusinessProcess',
    'Задача': 'Task', 'ПланОбмена': 'ExchangePlan'
};
var SIMPLE_TYPES = {
    'Булево': 'xs:boolean', 'СтандартныйПериод': 'v8:StandardPeriod', 'СтандартнаяДатаНачала': 'v8:StandardBeginningDate',
    'УникальныйИдентификатор': 'v8:UUID'
};

/* The valueType element for a type typed as the window shows it:
 * «Строка(50)», «Число(15, 2)», «Дата(дата)», «Булево», «СправочникСсылка.Имя»,
 * several of them through «, » outside the brackets. */
function typeLines(text, depth) {
    var parts = [];
    var cur = '', level = 0;
    String(text || '').split('').forEach(function (ch) {
        if (ch === '(') level++;
        if (ch === ')') level--;
        if (ch === ',' && !level) { parts.push(cur.trim()); cur = ''; } else cur += ch;
    });
    if (cur.trim()) parts.push(cur.trim());
    if (!parts.length) return { lines: null };
    var types = [], quals = [];
    var nsName = 'd' + depth + 'p1';
    for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var m;
        if ((m = /^Строка(?:\((\d+|неогр\.)(,\s*фикс\.)?\))?$/i.exec(p))) {
            types.push('<v8:Type>xs:string</v8:Type>');
            quals.push([2, ['<v8:StringQualifiers>', '\t<v8:Length>' + (m[1] && m[1] !== 'неогр.' ? m[1] : '0') + '</v8:Length>',
                '\t<v8:AllowedLength>' + (m[2] ? 'Fixed' : 'Variable') + '</v8:AllowedLength>', '</v8:StringQualifiers>']]);
        } else if ((m = /^Число(?:\((\d+),\s*(\d+)(;\s*неотрицательное)?\))?$/i.exec(p))) {
            types.push('<v8:Type>xs:decimal</v8:Type>');
            quals.push([1, ['<v8:NumberQualifiers>', '\t<v8:Digits>' + (m[1] || '15') + '</v8:Digits>',
                '\t<v8:FractionDigits>' + (m[2] || '2') + '</v8:FractionDigits>',
                '\t<v8:AllowedSign>' + (m[3] ? 'Nonnegative' : 'Any') + '</v8:AllowedSign>', '</v8:NumberQualifiers>']]);
        } else if ((m = /^Дата(?:\((дата и время|дата|время)\))?$/i.exec(p))) {
            types.push('<v8:Type>xs:dateTime</v8:Type>');
            var part = !m[1] || m[1] === 'дата' ? 'Date' : m[1] === 'время' ? 'Time' : 'DateTime';
            quals.push([3, ['<v8:DateQualifiers>', '\t<v8:DateFractions>' + part + '</v8:DateFractions>', '</v8:DateQualifiers>']]);
        } else if (own(SIMPLE_TYPES, p)) {
            types.push('<v8:Type>' + SIMPLE_TYPES[p] + '</v8:Type>');
        } else if ((m = /^([А-Яа-яЁё]+)Ссылка\.([A-Za-zА-Яа-яЁё_][0-9A-Za-zА-Яа-яЁё_]*)$/.exec(p)) && own(REF_KINDS, m[1])) {
            types.push('<v8:Type xmlns:' + nsName + '="http://v8.1c.ru/8.1/data/enterprise/current-config">' + nsName + ':'
                + REF_KINDS[m[1]] + 'Ref.' + m[2] + '</v8:Type>');
        } else return { error: 'Неизвестный тип «' + p + '». Например: Строка(50), Число(15, 2), Дата, Булево, СправочникСсылка.Имя' };
    }
    /* Qualifiers follow the types: numbers, strings, dates, as the platform writes them. */
    var seen = {};
    quals = quals.filter(function (q) { if (seen[q[0]]) return false; seen[q[0]] = 1; return true; }).sort(function (a, b) { return a[0] - b[0]; });
    var lines = [[0, '<valueType>']];
    types.forEach(function (t) { lines.push([1, t]); });
    quals.forEach(function (q) { q[1].forEach(function (l) { lines.push([1 + (l.charAt(0) === '\t' ? 1 : 0), l.replace(/^\t/, '')]); }); });
    lines.push([0, '</valueType>']);
    return { lines: lines };
}

/* The groupings a resource is calculated by (Рассчитывать по...): the
 * <group> elements in the order given; none — by every grouping. */
function totalGroups(model, id) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner || owner.kind !== 'total') return null;
    return kidsNamed(owner.el, 'group').map(function (g) { return textOf(g); });
}

function groupsEdit(model, id, groups) {
    var src = model && model.source;
    var now = totalGroups(model, id);
    if (!now) return null;
    var list = [];
    (groups || []).forEach(function (g) {
        g = String(g || '').trim();
        if (g && list.indexOf(g) < 0) list.push(g);
    });
    if (list.join('\n') === now.join('\n')) return null;
    for (var i = 0; i < list.length; i++) {
        if (!PATH_RE.test(list[i].replace(/ (Иерархия|Hierarchy)$/, ''))) return { error: 'Группировка — путь поля через точку: «' + list[i] + '»' };
    }
    var owner = own(src.owners, id);
    var olds = kidsNamed(owner.el, 'group');
    var lines = list.map(function (g) { return [0, '<group>' + encodeXml(g) + '</group>']; });
    if (!olds.length) return withBom(model, insertOp(src, owner.el, CHILD_ORDER.total, 'group', lines));
    var first = src.pos.rec(olds[0]), last = src.pos.rec(olds[olds.length - 1]);
    if (!lines.length) return withBom(model, { start: lineStart(src.xml, first.start), end: last.close, text: '' });
    var indent = indentBefore(src.xml, first.start);
    return withBom(model, { start: first.start, end: last.close, text: fragment(lines, indent, src.eol) });
}

/* ------------------------------------------------- properties of parts */

/* The record of `id` when it is one of `kinds` (a data set field only when
 * it is a plain field). */
function partOwner(model, id, kinds) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner || !own(kinds, owner.kind)) return null;
    if (owner.kind === 'field' && xsiType(owner.el) !== 'DataSetFieldField') return null;
    return owner;
}

/* Replaces the run of `tag` children of the owner with `lines` (none:
 * removes them), the run kept where it was or put by the child order. */
function runOp(src, owner, tag, lines) {
    var olds = kidsNamed(owner.el, tag);
    if (!olds.length) return lines.length ? insertOp(src, owner.el, CHILD_ORDER[owner.kind], tag, lines) : null;
    var first = src.pos.rec(olds[0]), last = src.pos.rec(olds[olds.length - 1]);
    if (!lines.length) return { start: lineStart(src.xml, first.start), end: last.close, text: '' };
    return { start: first.start, end: last.close, text: fragment(lines, indentBefore(src.xml, first.start), src.eol) };
}

/* The namespace prefix the schema declares for the common types (dcscom). */
function commonPrefix(src) {
    var m = /xmlns:([\w.-]+)="http:\/\/v8\.1c\.ru\/8\.1\/data-composition-system\/common"/.exec(src.xml);
    return m ? m[1] + ':' : null;
}

/* Выражения упорядочивания: [{ expression, orderType: Asc | Desc, autoOrder }]. */
var ORDERED = { field: 1, calc: 1 };

function orderList(model, id) {
    var owner = partOwner(model, id, ORDERED);
    if (!owner) return null;
    var src = model.source;
    return kidsNamed(owner.el, 'orderExpression').map(function (o) {
        return {
            expression: exactText(src, firstChild(o, 'expression')), orderType: textOf(firstChild(o, 'orderType')) === 'Desc' ? 'Desc' : 'Asc',
            autoOrder: textOf(firstChild(o, 'autoOrder')) === 'true'
        };
    });
}

function orderEdit(model, id, list) {
    var owner = partOwner(model, id, ORDERED);
    if (!owner) return null;
    var src = model.source;
    var rows = (list || []).filter(function (r) { return String(r.expression || '').trim(); });
    var now = orderList(model, id);
    var key = function (l) { return l.map(function (r) { return [r.expression, r.orderType === 'Desc' ? 'Desc' : 'Asc', !!r.autoOrder].join('\u0001'); }).join('\u0002'); };
    if (key(rows) === key(now)) return null;
    var p = commonPrefix(src);
    if (p === null) return { error: 'Схема не объявляет пространство имен dcscom' };
    var lines = [];
    rows.forEach(function (r) {
        lines.push([0, '<orderExpression>'], [1, '<' + p + 'expression>' + encodeText(src, null, String(r.expression).replace(/\r\n/g, '\n')) + '</' + p + 'expression>'],
            [1, '<' + p + 'orderType>' + (r.orderType === 'Desc' ? 'Desc' : 'Asc') + '</' + p + 'orderType>'],
            [1, '<' + p + 'autoOrder>' + (r.autoOrder ? 'true' : 'false') + '</' + p + 'autoOrder>'], [0, '</orderExpression>']);
    });
    return withBom(model, runOp(src, owner, 'orderExpression', lines));
}

/* Доступные значения: [{ value, presentation }] as the window shows them;
 * an untouched row keeps its elements as they are (a reference value, other
 * languages of its presentation). */
function availableList(model, id) {
    var owner = partOwner(model, id, TYPED);
    if (!owner) return null;
    var src = model.source;
    return kidsNamed(owner.el, 'availableValue').map(function (a) {
        var v = firstChild(a, 'value');
        var pr = firstChild(a, 'presentation');
        var shown = !v || isNil(v) ? '' : xsiType(v) === 'string' ? exactText(src, v) : valueText(v, null);
        var pres = localizedFrom(pr);
        return { value: shown, presentation: pres, keep: { value: shown, presentation: pres, valueXml: v ? elementText(src, v) : '', presentationXml: pr ? elementText(src, pr) : '' } };
    });
}

/* The single primitive type of a record's values, '' for any other. */
function primitiveKind(el) {
    var vt = firstChild(el, 'valueType');
    var types = namedChildren(vt, 'Type');
    return types.length === 1 && !firstChild(vt, 'TypeSet') ? own(SIMPLE_VALUE_TYPES, textOf(types[0])) || '' : '';
}

function availableEdit(model, id, list) {
    var owner = partOwner(model, id, TYPED);
    if (!owner) return null;
    var src = model.source;
    var kind = primitiveKind(owner.el);
    var lines = [];
    var error = null;
    var same = true;
    var now = availableList(model, id);
    (list || []).forEach(function (r, i) {
        if (error) return;
        var value = r.value == null ? '' : String(r.value);
        var pres = String(r.presentation == null ? '' : r.presentation).replace(/\s*\n\s*/g, ' ');
        var keep = r.keep || null;
        if (!keep || !now[i] || now[i].keep.valueXml !== keep.valueXml || value !== keep.value || pres !== keep.presentation) same = false;
        var valueXml;
        if (keep && value === keep.value && keep.valueXml) valueXml = keep.valueXml;
        else {
            var t = kind || (/^\s*$/.test(value) ? 'string' : '');
            if (!kind && keep && keep.valueXml && !/xsi:type="xs:/.test(keep.valueXml)) { error = { error: 'Значение ссылочного типа меняется в конфигураторе: «' + keep.value + '»' }; return; }
            var x = filterValueXml('', value, t, 'value');
            if (x && x.error) { error = x; return; }
            valueXml = x || '<value xsi:type="xs:string"/>';
        }
        lines.push([0, '<availableValue>'], [1, valueXml]);
        if (keep && pres === keep.presentation && keep.presentationXml) lines.push([1, keep.presentationXml]);
        else if (pres) ruTitleLines('presentation', pres).forEach(function (l) { lines.push([l[0] + 1, l[1]]); });
        lines.push([0, '</availableValue>']);
    });
    if (error) return error;
    if (same && (list || []).length === now.length) return null;
    return withBom(model, runOp(src, owner, 'availableValue', lines));
}

/* The role of a data set field, as the platform orders its parts (all 18852
 * roles of the AT and MOEK exports agree on it). */
var ROLE_ORDER = ['dimension', 'periodNumber', 'balance', 'periodType', 'balanceGroupName', 'account', 'parentDimension', 'balanceType',
    'accountTypeExpression', 'accountingBalanceType', 'accountField', 'ignoreNullValues', 'required'];
var ROLE_FLAGS = { dimension: 1, balance: 1, account: 1, ignoreNullValues: 1, required: 1 };

function roleOf(model, id) {
    var owner = partOwner(model, id, { field: 1 });
    if (!owner) return null;
    var out = {};
    var role = firstChild(owner.el, 'role');
    Array.prototype.forEach.call(role && role.children || [], function (k) {
        var tag = localName(k);
        out[tag] = own(ROLE_FLAGS, tag) ? textOf(k) === 'true' : textOf(k);
    });
    return out;
}

/* What the window writes of a role: flags only when set, the period type
 * with the period, the balance's parts with the balance. */
function roleParts(r) {
    var out = [];
    var add = function (tag, v) { if (v !== '' && v != null && v !== false) out.push([tag, v === true ? 'true' : String(v)]); };
    ROLE_ORDER.forEach(function (tag) {
        var v = r[tag];
        if (tag === 'periodType') { if (String(r.periodNumber || '').trim()) add(tag, v === 'Additional' ? 'Additional' : 'Main'); return; }
        if ((tag === 'balanceGroupName' || tag === 'balanceType' || tag === 'accountField' || tag === 'accountingBalanceType') && !r.balance) return;
        if (tag === 'accountTypeExpression' && !r.account) return;
        if (own(ROLE_FLAGS, tag)) { if (v === true || v === 'true') add(tag, true); return; }
        add(tag, String(v == null ? '' : v).trim());
    });
    return out;
}

function roleEdit(model, id, role) {
    var owner = partOwner(model, id, { field: 1 });
    if (!owner) return null;
    var src = model.source;
    var parts = roleParts(role || {});
    var now = roleParts(roleOf(model, id));
    var period = (parts.filter(function (x) { return x[0] === 'periodNumber'; })[0] || [])[1];
    if (period !== undefined && !/^\d+$/.test(period)) return { error: 'Номер периода — целое число' };
    var old = firstChild(owner.el, 'role');
    if (JSON.stringify(parts) === JSON.stringify(now) && old) return null;
    if (!parts.length && !old) return null;
    var p = old && old.children && old.children.length ? prefixOf(tagOf(src, old.children[0])) : commonPrefix(src);
    if (p === null) return { error: 'Схема не объявляет пространство имен dcscom' };
    var lines = parts.length ? [[0, '<role>']].concat(parts.map(function (x) { return [1, '<' + p + x[0] + '>' + encodeXml(x[1]) + '</' + p + x[0] + '>']; }), [[0, '</role>']]) : [];
    return withBom(model, runOp(src, owner, 'role', lines));
}

/* ---------------------------------------------------- parameter values

 * Lists of parameter values: the appearance of a field and of a conditional
 * appearance item, the edit parameters (inputParameters) of a field or a
 * parameter, the output parameters of the settings. Each parameter has a
 * kind of value; the words of an enumeration are those the AT and MOEK
 * exports write (2902 schemas). A parameter the window does not know keeps
 * its value as it is; only its use flag changes. */
var ENTERPRISE_NS = 'http://v8.1c.ru/8.1/data/enterprise';
var COLOR_NS = { web: 'http://v8.1c.ru/8.1/data/ui/colors/web', win: 'http://v8.1c.ru/8.1/data/ui/colors/windows', style: 'http://v8.1c.ru/8.1/data/ui/style' };

function E(type, words) { return { t: 'enum', type: type, words: words.split(' ') }; }
var T_DEC = { t: 'decimal' }, T_BOOL = { t: 'boolean' }, T_STR = { t: 'string' }, T_LSTR = { t: 'lstring' }, T_COLOR = { t: 'color' };
var TOTALS = E('dcscor:DataCompositionTotalPlacement', 'Auto None Begin End BeginAndEnd');
var OUTPUT = E('dcsset:DataCompositionTextOutputType', 'Auto Output DontOutput');
var H_ALIGNS = E('v8ui:HorizontalAlign', 'Auto Left Center Right');
var V_ALIGNS = E('v8ui:VerticalAlign', 'Top Center Bottom');
var PARAMETER_KINDS = {
    appearance: {
        'ЦветТекста': T_COLOR, 'ЦветФона': T_COLOR, 'ЦветГраницы': T_COLOR, 'ЦветВДиаграмме': T_COLOR, 'Текст': T_LSTR, 'Формат': T_LSTR,
        'ГоризонтальноеПоложение': H_ALIGNS, 'ВертикальноеПоложение': V_ALIGNS,
        'Размещение': E('dcscor:DataCompositionTextPlacementType', 'Auto Wrap Overflow Cut'),
        'МинимальнаяШирина': T_DEC, 'МаксимальнаяШирина': T_DEC, 'МинимальнаяВысота': T_DEC, 'МаксимальнаяВысота': T_DEC,
        'Отступ': T_DEC, 'АвтоОтступ': T_DEC, 'ОриентацияТекста': T_DEC, 'ВыделятьОтрицательные': T_BOOL,
        'ОтметкаНезаполненного': T_BOOL, 'РастягиватьПоГоризонтали': T_BOOL,
        'ГоризонтальноеПоложениеКартинки': H_ALIGNS, 'ВертикальноеПоложениеКартинки': V_ALIGNS,
        'ВыводитьКартинку': E('dcsset:DataCompositionPictureOutputType', 'Auto OutputByRef OutputByValue')
    },
    input: {
        'ПараметрыВыбора': { t: 'choiceParameters' }, 'СвязиПараметровВыбора': { t: 'choiceLinks' }, 'СвязьПоТипу': { t: 'typeLink' },
        'БыстрыйВыбор': T_BOOL, 'ВыборГруппИЭлементов': { t: 'enum', type: 'FoldersAndItemsUse', ns: ENTERPRISE_NS, words: ['Items', 'Folders', 'FoldersAndItems'] },
        'ФорматРедактирования': T_LSTR, 'ФормаВыбора': T_STR, 'Маска': T_STR
    },
    output: {
        'Заголовок': T_LSTR, 'ВыводитьЗаголовок': OUTPUT, 'ВыводитьПараметрыДанных': OUTPUT, 'ВыводитьОтбор': OUTPUT, 'МакетОформления': T_STR,
        'РасположениеПолейГруппировки': E('dcsset:DataCompositionGroupFieldsPlacement', 'Together Separately SeparatelyAndInTotalsOnly'),
        'РасположениеРеквизитов': E('dcsset:DataCompositionAttributesPlacement', 'Together Separately WithOwnerField SpecialPosition'),
        'РасположениеРесурсов': E('dcsset:DataCompositionResourcesPlacement', 'Vertically Horizontally'),
        'АвтоПозицияРесурсов': E('dcsset:DataCompositionResourcesAutoPosition', 'DontUse AfterAllFields'),
        'ГоризонтальноеРасположениеОбщихИтогов': TOTALS, 'ВертикальноеРасположениеОбщихИтогов': TOTALS,
        'РасположениеОбщихИтогов': TOTALS, 'РасположениеИтогов': TOTALS,
        'РасположениеГруппировки': E('dcsset:DataCompositionGroupPlacement', 'None Begin End BeginAndEnd'),
        'ТипМакета': E('dcsset:DataCompositionGroupTemplateType', 'Vertical Horizontal'),
        'ТипЗаголовкаПолей': E('dcscor:DataCompositionFieldsTitleType', 'Auto Short Full'),
        'ВариантИспользованияГруппировки': E('dcsset:DataCompositionGroupUseVariant', 'Auto AdditionalInformation'),
        'ТипДиаграммы': E('v8ui:ChartType', 'Column StackedColumn Column3D Line StackedArea Pie Pie3D'),
        'ФиксацияСлева': E('dcsset:DataCompositionFixation', 'Auto DontUse'),
        'ФиксацияСверху': E('dcsset:DataCompositionFixation', 'Auto DontUse'),
        'КоличествоЗаписей': T_DEC, 'ПроцентЗаписей': T_DEC
    }
};
var ENUM_TITLES = {
    Items: 'Элементы', Folders: 'Группы', FoldersAndItems: 'Группы и элементы', Overflow: 'Переполнять', OutputByRef: 'Выводить по ссылке',
    OutputByValue: 'Выводить по значению', WithOwnerField: 'С полем владельцем', SpecialPosition: 'Специальное расположение',
    AfterAllFields: 'После всех полей', Vertical: 'Вертикально', Horizontal: 'Горизонтально', AdditionalInformation: 'Дополнительная информация',
    Column: 'Гистограмма', StackedColumn: 'Гистограмма с накоплением', Column3D: 'Объемная гистограмма', Line: 'График',
    StackedArea: 'С областями с накоплением', Pie: 'Круговая', Pie3D: 'Объемная круговая', Clear: 'Очищать', DontChange: 'Не изменять'
};
function enumTitle(w) { return own(ENUM_TITLES, w) || own(VALUES, w) || w; }

/* What a list holds: the container tag of a record and the catalog. */
var PARAMETER_LISTS = { appearance: 'appearance', inputParameters: 'input', outputParameters: 'output' };

/* Does an element or one of its ancestors declare the namespace prefix? */
function declaresPrefix(src, el, prefix) {
    var re = new RegExp('\\sxmlns:' + prefix + '="');
    for (var at = el; at; at = parentOf(src, at)) {
        var rec = src.pos.rec(at);
        if (rec && re.test(src.xml.slice(rec.start, rec.contentStart))) return true;
    }
    return false;
}

/* The text a value of a choice parameter is typed as: «Истина», 10, a date,
 * Перечисление.Виды.Основной (a value of the configuration), "a string". */
var DESIGN_TIME_RE = /^(Справочник|Перечисление|Документ|ПланСчетов|ПланВидовХарактеристик|ПланВидовРасчета|БизнесПроцесс|Задача|ПланОбмена)\.[A-Za-zА-Яа-яЁё_][0-9A-Za-zА-Яа-яЁё_]*(\.[A-Za-zА-Яа-яЁё_][0-9A-Za-zА-Яа-яЁё_]*)?$/;

function typedValueText(src, v) {
    if (!v || isNil(v)) return '';
    var t = xsiType(v);
    var text = t === 'string' ? exactText(src, v) : textOf(v);
    if (t === 'string') return '"' + text.replace(/"/g, '""') + '"';
    if (t === 'boolean') return text === 'true' ? 'Истина' : 'Ложь';
    if (t === 'decimal') return text.replace('.', ',');
    if (t === 'dateTime') return dateText(text);
    return text;
}

function typedValueXml(p, tag, text) {
    var t = String(text == null ? '' : text).trim();
    var open = '<' + p + tag + ' xsi:type="', close = '</' + p + tag + '>';
    var m = /^"([\s\S]*)"$/.exec(t);
    if (m) return open + 'xs:string">' + encodeXml(m[1].replace(/""/g, '"')) + close;
    if (/^(истина|да|true)$/i.test(t)) return open + 'xs:boolean">true' + close;
    if (/^(ложь|нет|false)$/i.test(t)) return open + 'xs:boolean">false' + close;
    if (/^[+-]?\d[\d\s ]*(?:[.,]\d+)?$/.test(t)) return open + 'xs:decimal">' + valueWord({ kind: 'decimal' }, t).word + close;
    if (/^\d{1,2}\.\d{1,2}\.\d{4}/.test(t)) {
        var w = valueWord({ kind: 'dateTime', dateOnly: false }, t);
        if (w.error) return w;
        return open + 'xs:dateTime">' + w.word + close;
    }
    if (DESIGN_TIME_RE.test(t)) return open + 'dcscor:DesignTimeValue">' + encodeXml(t) + close;
    if (!t) return '<' + p + tag + ' xsi:nil="true"/>';
    return open + 'xs:string">' + encodeXml(t) + close;
}

/* Where a list of parameters lives: the element holding it (`holder`), its
 * child order, the list element if it is there, the tag a new one gets,
 * the catalog and whether its items name their type. A record of the schema
 * (`appearance`, `inputParameters`), the output parameters of a structure
 * node (its `<node>|outputParameters` list) or the appearance of a
 * conditional appearance item. */
function parameterList(model, id, listTag) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner || !own(PARAMETER_LISTS, listTag)) return null;
    var spot;
    if (owner.kind === 'slist' && owner.tag === 'outputParameters' && listTag === 'outputParameters') {
        spot = { holder: owner.parent, order: orderOf({ kind: 'snode', el: owner.parent }), list: owner.el,
            tag: (prefixOf(tagOf(src, owner.parent)) || 'dcsset:') + 'outputParameters', typed: true };
    } else if (owner.kind === 'cell' && listTag === 'appearance') {
        spot = { holder: owner.el, order: ['item', 'appearance'], list: firstChild(owner.el, 'appearance'),
            tag: (prefixOf(tagOf(src, owner.el)) || 'dcsat:') + 'appearance', typed: false };
    } else if (owner.kind === 'sitem' && owner.list === 'appearance' && listTag === 'appearance') {
        spot = { holder: owner.el, order: SETTINGS_ORDER.appearance, list: firstChild(owner.el, 'appearance'),
            tag: (prefixOf(tagOf(src, owner.el)) || 'dcsset:') + 'appearance', typed: true };
    } else {
        if (owner.kind === 'field' && xsiType(owner.el) !== 'DataSetFieldField') return null;
        var order = CHILD_ORDER[owner.kind];
        if (!order || order.indexOf(listTag) < 0) return null;
        spot = { holder: owner.el, order: order, list: firstChild(owner.el, listTag), tag: listTag, typed: listTag === 'appearance' };
    }
    spot.local = listTag;
    spot.catalog = PARAMETER_KINDS[PARAMETER_LISTS[listTag]];
    return spot;
}

/* The rows of the list: { use, parameter, kind, value, list, keep }. */
function parameterRows(model, id, listTag) {
    var spot = parameterList(model, id, listTag);
    if (!spot) return null;
    var src = model.source;
    var catalog = spot.catalog;
    return kidsNamed(spot.list, 'item').map(function (it) {
        var name = textOf(firstChild(it, 'parameter'));
        var v = firstChild(it, 'value');
        var kind = own(catalog, name) || { t: 'raw' };
        var row = { use: textOf(firstChild(it, 'use')) !== 'false', parameter: name, kind: kind.t, value: '', list: null };
        if (kind.t === 'boolean') row.value = textOf(v) === 'true';
        else if (kind.t === 'decimal') row.value = textOf(v).replace('.', ',');
        else if (kind.t === 'string') row.value = v ? exactText(src, v) : '';
        else if (kind.t === 'lstring') row.value = xsiType(v) === 'LocalStringType' ? localizedFrom(v) : textOf(v);
        else if (kind.t === 'enum' || kind.t === 'color') row.value = textOf(v) || (v && typeof v.getAttribute === 'function' ? v.getAttribute('ref') || '' : '');
        else if (kind.t === 'typeLink') row.value = textOf(firstChild(v, 'field'));
        else if (kind.t === 'choiceParameters') {
            row.list = kidsNamed(v, 'item').map(function (ci) {
                return { name: textOf(firstChild(ci, 'choiceParameter')), value: kidsNamed(ci, 'value').map(function (x) { return typedValueText(src, x); }).join('; ') };
            });
        } else if (kind.t === 'choiceLinks') {
            row.list = kidsNamed(v, 'item').map(function (ci) {
                return { name: textOf(firstChild(ci, 'choiceParameter')), value: textOf(firstChild(ci, 'value')), mode: textOf(firstChild(ci, 'mode')) || 'Clear' };
            });
        } else row.value = valueText(v, null);
        row.keep = { xml: elementText(src, it), sig: rowSignature(row), val: JSON.stringify([row.parameter, row.value, row.list]) };
        return row;
    });
}

function rowSignature(r) {
    return JSON.stringify([!!r.use, r.parameter, r.value, r.list]);
}

/* A row whose value is the one read keeps its element as it is (a style
 * colour, a font, a value the window cannot write); a changed use flag is
 * written into it. null for a row to write anew. */
function keptParameterItem(r, p) {
    if (!r.keep) return null;
    if (rowSignature(r) === r.keep.sig) return [[0, r.keep.xml]];
    if (JSON.stringify([r.parameter, r.value, r.list]) !== r.keep.val) return null;
    var esc = p.replace(':', '\\:');
    var x = r.keep.xml.replace(new RegExp('\\r?\\n[ \\t]*<' + esc + 'use>(?:true|false)</' + esc + 'use>'), '');
    if (!r.use) {
        var m = /^(<[^>]*>)(\r?\n)([ \t]*)/.exec(x);
        if (m) x = m[1] + m[2] + m[3] + '<' + p + 'use>false</' + p + 'use>' + m[2] + m[3] + x.slice(m[0].length);
    }
    return [[0, x]];
}

/* A shown text of a list of choice parameters or links. */
function listSummary(kind, list) {
    return (list || []).map(function (x) {
        return x.name + (kind === 'choiceLinks' ? ' ← ' + x.value + (x.mode === 'DontChange' ? ' (не изменять)' : '') : ' = ' + x.value);
    }).join('; ');
}

function parameterItemLines(src, listEl, p, typed, r, kind, depth) {
    var lines = [[0, '<' + p + 'item' + (typed ? ' xsi:type="dcsset:SettingsParameterValue"' : '') + '>']];
    if (!r.use) lines.push([1, '<' + p + 'use>false</' + p + 'use>']);
    lines.push([1, '<' + p + 'parameter>' + encodeXml(r.parameter) + '</' + p + 'parameter>']);
    var open = '<' + p + 'value', close = '</' + p + 'value>';
    var v = r.value;
    var t = kind.t;
    if (t === 'boolean') lines.push([1, open + ' xsi:type="xs:boolean">' + (v === true || v === 'true' ? 'true' : 'false') + close]);
    else if (t === 'decimal') {
        var w = valueWord({ kind: 'decimal' }, v);
        if (w.error) return { error: r.parameter + ': ' + w.error };
        lines.push([1, open + ' xsi:type="xs:decimal">' + w.word + close]);
    } else if (t === 'string') lines.push([1, open + ' xsi:type="xs:string">' + encodeText(src, null, String(v || '')) + close]);
    else if (t === 'lstring') {
        lines.push([1, open + ' xsi:type="v8:LocalStringType">']);
        ruItemLines(String(v || ''), 2).forEach(function (l) { lines.push(l); });
        lines.push([1, close]);
    } else if (t === 'enum') {
        if (kind.words.indexOf(v) < 0) return { error: r.parameter + ': недопустимое значение «' + v + '»' };
        if (kind.ns) {
            var np = 'd' + depth + 'p1';
            lines.push([1, open + ' xmlns:' + np + '="' + kind.ns + '" xsi:type="' + np + ':' + kind.type + '">' + v + close]);
        } else lines.push([1, open + ' xsi:type="' + kind.type + '">' + v + close]);
    } else if (t === 'color') {
        var c = String(v || '').trim();
        var cm = /^(web|win|style):([A-Za-zА-Яа-яЁё_][0-9A-Za-zА-Яа-яЁё_]*)$/.exec(c);
        if (!cm && !/^#[0-9A-Fa-f]{6}$/.test(c) && c !== 'auto') return { error: r.parameter + ': цвет — web:Имя, style:Имя, win:Имя, #RRGGBB или auto' };
        var decl = cm && !declaresPrefix(src, listEl, cm[1]) ? ' xmlns:' + cm[1] + '="' + COLOR_NS[cm[1]] + '"' : '';
        lines.push([1, open + decl + ' xsi:type="v8ui:Color">' + c + close]);
    } else if (t === 'typeLink') {
        var f = String(v || '').trim();
        if (!PATH_RE.test(f)) return { error: r.parameter + ': укажите поле' };
        lines.push([1, open + ' xsi:type="dcscor:TypeLink">'], [2, '<' + p + 'field>' + encodeXml(f) + '</' + p + 'field>'], [1, close]);
    } else if (t === 'choiceParameters' || t === 'choiceLinks') {
        lines.push([1, open + ' xsi:type="dcscor:' + (t === 'choiceParameters' ? 'ChoiceParameters' : 'ChoiceParameterLinks') + '">']);
        var err = null;
        (r.list || []).forEach(function (x) {
            if (err || !String(x.name || '').trim()) return;
            var name = String(x.name).trim();
            if (!PATH_RE.test(name)) { err = { error: 'Параметр выбора — имя через точку: «' + name + '»' }; return; }
            lines.push([2, '<' + p + 'item>'], [3, '<' + p + 'choiceParameter>' + encodeXml(name) + '</' + p + 'choiceParameter>']);
            if (t === 'choiceParameters') {
                String(x.value == null ? '' : x.value).split(/;\s*/).forEach(function (one, i, all) {
                    if (!one.trim() && all.length > 1) return;
                    var vx = typedValueXml(p, 'value', one);
                    if (vx && vx.error) err = vx; else lines.push([3, vx]);
                });
            } else {
                var field = String(x.value || '').trim();
                if (!PATH_RE.test(field)) { err = { error: 'Связь параметра выбора — поле: «' + field + '»' }; return; }
                var mp = 'd' + (depth + 2) + 'p1';
                lines.push([3, '<' + p + 'value>' + encodeXml(field) + '</' + p + 'value>'],
                    [3, '<' + p + 'mode xmlns:' + mp + '="' + ENTERPRISE_NS + '" xsi:type="' + mp + ':LinkedValueChangeMode">' + (x.mode === 'DontChange' ? 'DontChange' : 'Clear') + '</' + p + 'mode>']);
            }
            lines.push([2, '</' + p + 'item>']);
        });
        if (err) return err;
        lines.push([1, close]);
    } else return { error: r.parameter + ': значение этого вида меняется в конфигураторе' };
    lines.push([0, '</' + p + 'item>']);
    return lines;
}

/* The lines of the whole list element for `rows` ([] for none). */
function parameterListLines(model, id, listTag, rows) {
    var src = model.source;
    var spot = parameterList(model, id, listTag);
    var listEl = spot.list;
    var catalog = spot.catalog;
    var typed = spot.typed;
    var first = listEl && kidsNamed(listEl, 'item')[0];
    var p = first ? prefixOf(tagOf(src, first)) : 'dcscor:';
    var depth = elementDepth(src, spot.holder) + 3;
    rows = (rows || []).filter(function (r) { return String(r.parameter || '').trim(); });
    var seen = {};
    var lines = [];
    for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (own(seen, r.parameter)) return { error: 'Параметр «' + r.parameter + '» указан дважды' };
        seen[r.parameter] = 1;
        var kind = own(catalog, r.parameter) || { t: 'raw' };
        var item = keptParameterItem(r, p);
        if (!item) {
            item = parameterItemLines(src, listEl || spot.holder, p, typed, r, kind, depth);
            if (item.error) return item;
        }
        item.forEach(function (l) { lines.push([l[0] + 1, l[1]]); });
    }
    return lines.length ? [[0, '<' + spot.tag + '>']].concat(lines, [[0, '</' + spot.tag + '>']]) : [];
}

function parametersEdit(model, id, listTag, rows) {
    var now = parameterRows(model, id, listTag);
    if (!now) return null;
    var src = model.source;
    var spot = parameterList(model, id, listTag);
    var listEl = spot.list;
    var catalog = spot.catalog;
    var typed = spot.typed;
    var first = listEl && kidsNamed(listEl, 'item')[0];
    var p = first ? prefixOf(tagOf(src, first)) : 'dcscor:';
    var depth = elementDepth(src, spot.holder) + 3;
    rows = (rows || []).filter(function (r) { return String(r.parameter || '').trim(); });
    if (rows.length === now.length && rows.every(function (r, i) { return r.keep && r.keep.xml === now[i].keep.xml && rowSignature(r) === r.keep.sig; })) return null;
    var seen = {};
    var lines = [];
    for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (own(seen, r.parameter)) return { error: 'Параметр «' + r.parameter + '» указан дважды' };
        seen[r.parameter] = 1;
        var kind = own(catalog, r.parameter) || { t: 'raw' };
        var item;
        item = keptParameterItem(r, p);
        if (!item) {
            item = parameterItemLines(src, listEl || spot.holder, p, typed, r, kind, depth);
            if (item.error) return item;
        }
        item.forEach(function (l) { lines.push([l[0] + 1, l[1]]); });
    }
    var all = lines.length ? [[0, '<' + spot.tag + '>']].concat(lines, [[0, '</' + spot.tag + '>']]) : [];
    if (listEl) {
        var rec = src.pos.rec(listEl);
        if (!all.length) return withBom(model, removeChildOp(src, spot.holder, listEl));
        return withBom(model, { start: rec.start, end: rec.close, text: fragment(all, indentBefore(src.xml, rec.start), src.eol) });
    }
    return all.length ? withBom(model, insertChild(src, spot.holder, spot.order, spot.local, all)) : null;
}

/* ----------------------------------------------------- parameter value

 * The value of a parameter of any type: a standard period, a standard
 * beginning date, or values (one, or a list where the parameter allows
 * one) typed as «Истина», 10, a date, "a string" or a value of the
 * configuration (Справочник.Валюты.ПустаяСсылка). The value of a data
 * parameter in the settings takes the type of the schema's parameter. */
var BEGINNING_DATES = { Custom: 'Произвольная дата' };
['This', 'Next', 'Last'].forEach(function (when) {
    var w = { This: ['этого', 'этой'], Next: ['следующего', 'следующей'], Last: ['прошлого', 'прошлой'] }[when];
    [['Day', 'дня', 0], ['Week', 'недели', 1], ['TenDays', 'декады', 1], ['Month', 'месяца', 0], ['Quarter', 'квартала', 0],
        ['HalfYear', 'полугодия', 0], ['Year', 'года', 0]].forEach(function (u) {
        BEGINNING_DATES['BeginningOf' + when + u[0]] = 'Начало ' + w[u[2]] + ' ' + u[1];
    });
});

/* Where a value lives: { el (the record), order, typeEl (its valueType, the
 * schema parameter's for a data parameter), list, prefix }. */
function valueSpot(model, id) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner) return null;
    if (owner.kind === 'param') {
        return { el: owner.el, order: CHILD_ORDER.param, typeEl: firstChild(owner.el, 'valueType'), list: isTrue(firstChild(owner.el, 'valueListAllowed')), prefix: '' };
    }
    if (owner.kind === 'sitem' && xsiType(owner.el) === 'SettingsParameterValue' && localName(parentOf(src, owner.el)) === 'dataParameters') {
        var name = textOf(firstChild(owner.el, 'parameter'));
        var param = null;
        (function find(m) {
            m.parameters.forEach(function (x) { if (!param && x.name === name) param = own(src.owners, x.id); });
        })(model);
        var first = (owner.el.children || [])[0];
        return {
            el: owner.el, order: SETTINGS_ORDER.SettingsParameterValue, typeEl: param ? firstChild(param.el, 'valueType') : null,
            list: param ? isTrue(firstChild(param.el, 'valueListAllowed')) : false, prefix: first ? prefixOf(tagOf(src, first)) : 'dcscor:'
        };
    }
    return null;
}

function valueKindOf(typeEl) {
    var types = namedChildren(typeEl, 'Type').map(function (t) { return textOf(t); });
    if (types.length === 1 && types[0] === 'v8:StandardPeriod') return 'period';
    if (types.length === 1 && types[0] === 'v8:StandardBeginningDate') return 'beginDate';
    return 'values';
}

function paramValueOf(model, id) {
    var spot = valueSpot(model, id);
    if (!spot) return null;
    var src = model.source;
    var values = kidsNamed(spot.el, 'value');
    var kind = valueKindOf(spot.typeEl);
    var v = values[0];
    var vt = v ? xsiType(v) : '';
    if (vt === 'StandardPeriod') kind = 'period';
    else if (vt === 'StandardBeginningDate') kind = 'beginDate';
    var out = { kind: kind, list: spot.list, keep: values.map(function (x) { return elementText(src, x); }).join('\n') };
    if (kind === 'period') {
        out.variant = v && vt === 'StandardPeriod' ? textOf(firstChild(v, 'variant')) || 'Custom' : 'Custom';
        out.start = v ? dateText(textOf(firstChild(v, 'startDate'))) : '';
        out.end = v ? dateText(textOf(firstChild(v, 'endDate'))) : '';
    } else if (kind === 'beginDate') {
        out.variant = v && vt === 'StandardBeginningDate' ? textOf(firstChild(v, 'variant')) || 'Custom' : 'Custom';
        out.date = v ? dateText(textOf(firstChild(v, 'date'))) : '';
    } else {
        out.values = values.filter(function (x) { return !isNil(x); }).map(function (x) {
            var t = xsiType(x);
            return { value: t === 'ValueListType' || t === 'LocalStringType' ? null : typedValueText(src, x), xml: elementText(src, x) };
        });
    }
    out.sig = JSON.stringify([out.variant, out.start, out.end, out.date, out.values && out.values.map(function (x) { return x.value; })]);
    return out;
}

function paramValueEdit(model, id, data) {
    var spot = valueSpot(model, id);
    if (!spot) return null;
    var src = model.source;
    var now = paramValueOf(model, id);
    var sig = JSON.stringify([data.variant, data.start, data.end, data.date, data.values && data.values.map(function (x) { return x.value; })]);
    if (sig === now.sig) return null;
    var p = spot.prefix;
    var open = '<' + p + 'value', close = '</' + p + 'value>';
    var lines = [];
    var date = function (text, end) {
        if (!String(text || '').trim()) return { word: '0001-01-01T00:00:00' };
        var w = valueWord({ kind: 'dateTime', dateOnly: false }, text);
        if (!w.error && end && /T00:00:00$/.test(w.word) && !/\d:\d/.test(text)) w.word = w.word.replace(/T00:00:00$/, 'T23:59:59');
        return w;
    };
    if (data.kind === 'period') {
        if (!own(STANDARD_PERIODS, data.variant)) return { error: 'Недопустимый вариант периода' };
        lines.push([0, open + ' xsi:type="v8:StandardPeriod">'], [1, '<v8:variant xsi:type="v8:StandardPeriodVariant">' + data.variant + '</v8:variant>']);
        if (data.variant === 'Custom') {
            var a = date(data.start), b = date(data.end, true);
            if (a.error) return a;
            if (b.error) return b;
            lines.push([1, '<v8:startDate>' + a.word + '</v8:startDate>'], [1, '<v8:endDate>' + b.word + '</v8:endDate>']);
        }
        lines.push([0, close]);
    } else if (data.kind === 'beginDate') {
        if (!own(BEGINNING_DATES, data.variant)) return { error: 'Недопустимый вариант даты начала' };
        lines.push([0, open + ' xsi:type="v8:StandardBeginningDate">'], [1, '<v8:variant xsi:type="v8:StandardBeginningDateVariant">' + data.variant + '</v8:variant>']);
        if (data.variant === 'Custom') {
            var d = date(data.date);
            if (d.error) return d;
            lines.push([1, '<v8:date>' + d.word + '</v8:date>']);
        }
        lines.push([0, close]);
    } else {
        var rows = (data.values || []).filter(function (x) { return x.value === null || String(x.value).trim(); });
        if (rows.length > 1 && !spot.list) return { error: 'Параметр без списка значений принимает одно значение' };
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            if (r.value === null || (r.xml && now.values[i] && now.values[i].value === r.value && now.values[i].xml === r.xml)) { lines.push([0, r.xml]); continue; }
            var x = typedValueXml(p, 'value', r.value);
            if (x && x.error) return x;
            lines.push([0, x]);
        }
        if (!lines.length) lines.push([0, open + ' xsi:nil="true"/>']);
    }
    return withBom(model, replaceChildrenOp(src, spot.el, spot.order, ['value'], lines));
}

/* ------------------------------------------------------------ templates

 * Templates: an area (a definition: a name, rows of cells and parameters)
 * and its bindings to a grouping, a grouping's header or a field. The window
 * edits the parameters, the bindings and the cells of an area. */
var AT_NS = 'http://v8.1c.ru/8.1/data-composition-system/area-template';
var TEMPLATE_TAGS = { area: 'template', field: 'fieldTemplate', group: 'groupTemplate', groupHeader: 'groupHeaderTemplate' };
var MAIN_ACTIONS = { '': 'Нет', OpenValue: 'Открыть значение', DrillDown: 'Расшифровать' };

function templateOwner(model, id, tag) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    return owner && owner.kind === 'tpl' && (!tag || owner.tag === tag) ? owner : null;
}

/* The parameters of an area: [{ kind: expression | details, name,
 * expression, fields: [{ field, expression }], mainAction, keep }]. */
function templateParams(model, id) {
    var owner = templateOwner(model, id, 'template');
    if (!owner) return null;
    var src = model.source;
    return kidsNamed(owner.el, 'parameter').map(function (p) {
        var details = xsiType(p) === 'DetailsAreaTemplateParameter';
        var row = {
            kind: details ? 'details' : 'expression', name: textOf(firstChild(p, 'name')),
            expression: details ? '' : exactText(src, firstChild(p, 'expression')),
            fields: details ? kidsNamed(p, 'fieldExpression').map(function (f) {
                return { field: textOf(firstChild(f, 'field')), expression: exactText(src, firstChild(f, 'expression')) };
            }) : [],
            mainAction: textOf(firstChild(p, 'mainAction'))
        };
        row.keep = { xml: elementText(src, p), sig: templateParamSig(row) };
        return row;
    });
}

function templateParamSig(r) {
    return JSON.stringify([r.kind, r.name, r.expression, r.fields, r.mainAction || '']);
}

function templateParamsEdit(model, id, rows) {
    var owner = templateOwner(model, id, 'template');
    if (!owner) return null;
    var src = model.source;
    var now = templateParams(model, id);
    rows = (rows || []).filter(function (r) { return String(r.name || '').trim(); });
    if (rows.length === now.length && rows.every(function (r, i) { return r.keep && r.keep.xml === now[i].keep.xml && templateParamSig(r) === r.keep.sig; })) return null;
    var seen = {};
    var lines = [];
    for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var name = String(r.name).trim();
        if (!/^[0-9A-Za-zА-Яа-яЁё_.]+$/.test(name)) return { error: 'Имя параметра — буквы, цифры, «_» и точки: «' + name + '»' };
        if (own(seen, name)) return { error: 'Параметр «' + name + '» указан дважды' };
        seen[name] = 1;
        if (r.keep && templateParamSig(r) === r.keep.sig) { lines.push([0, r.keep.xml]); continue; }
        var details = r.kind === 'details';
        lines.push([0, '<parameter xmlns:dcsat="' + AT_NS + '" xsi:type="dcsat:' + (details ? 'DetailsAreaTemplateParameter' : 'ExpressionAreaTemplateParameter') + '">'],
            [1, '<dcsat:name>' + encodeXml(name) + '</dcsat:name>']);
        if (!details) lines.push([1, '<dcsat:expression>' + encodeText(src, null, String(r.expression || '').replace(/\r\n/g, '\n')) + '</dcsat:expression>']);
        else {
            for (var k = 0; k < (r.fields || []).length; k++) {
                var f = r.fields[k];
                if (!String(f.field || '').trim()) continue;
                if (!PATH_RE.test(String(f.field).trim())) return { error: 'Поле расшифровки — путь через точку: «' + f.field + '»' };
                lines.push([1, '<dcsat:fieldExpression>'], [2, '<dcsat:field>' + encodeXml(String(f.field).trim()) + '</dcsat:field>'],
                    [2, '<dcsat:expression>' + encodeText(src, null, String(f.expression || f.field)) + '</dcsat:expression>'], [1, '</dcsat:fieldExpression>']);
            }
            if (r.mainAction) {
                if (!own(MAIN_ACTIONS, r.mainAction)) return { error: 'Недопустимое основное действие' };
                lines.push([1, '<dcsat:mainAction>' + r.mainAction + '</dcsat:mainAction>']);
            }
        }
        lines.push([0, '</parameter>']);
    }
    return withBom(model, runOp(src, owner, 'parameter', lines));
}

/* The names of the groupings of the settings: a binding names one of them
 * (groupName), anything else is a field (groupField). */
function groupingNames(model) {
    var out = {};
    (function walk(nodes) {
        nodes.forEach(function (n) { if (n && n.name) out[n.name] = 1; if (n) walk(n.children || []); });
    })(model.variants.map(function (v) { return v.root; }));
    return out;
}

/* A binding of an area: { kind: group | groupHeader | field, target, templateType, area }. */
function templateBindingOf(model, id) {
    var owner = templateOwner(model, id);
    if (!owner || owner.tag === 'template' || owner.tag === 'totalFieldsTemplate') return null;
    var el = owner.el;
    var targets = kidsNamed(el, 'groupName').concat(kidsNamed(el, 'groupField'));
    return {
        kind: owner.tag === 'fieldTemplate' ? 'field' : owner.tag === 'groupHeaderTemplate' ? 'groupHeader' : 'group',
        target: owner.tag === 'fieldTemplate' ? textOf(firstChild(el, 'field')) : targets.length === 1 ? textOf(targets[0]) : '',
        simple: owner.tag === 'fieldTemplate' || targets.length === 1,
        templateType: textOf(firstChild(el, 'templateType')) || 'Header', area: textOf(firstChild(el, 'template'))
    };
}

function templateBindingLines(model, data) {
    var tag = TEMPLATE_TAGS[data.kind];
    if (!tag || tag === 'template') return { error: 'Недопустимый вид макета' };
    var target = String(data.target || '').trim();
    var area = String(data.area || '').trim();
    if (!PATH_RE.test(target)) return { error: data.kind === 'field' ? 'Укажите поле' : 'Укажите группировку (имя) или поле' };
    var lines = [[0, '<' + tag + '>']];
    if (data.kind === 'field') lines.push([1, '<field>' + encodeXml(target) + '</field>']);
    else {
        var byName = own(groupingNames(model), target);
        lines.push([1, byName ? '<groupName>' + encodeXml(target) + '</groupName>' : '<groupField>' + encodeXml(target) + '</groupField>']);
        if (!own(TEMPLATE_TYPES, data.templateType || '')) return { error: 'Недопустимый тип макета' };
        lines.push([1, '<templateType>' + data.templateType + '</templateType>']);
    }
    lines.push([1, '<template>' + encodeXml(area) + '</template>'], [0, '</' + tag + '>']);
    return lines;
}

/* The lines of a new area: one row of one empty cell. */
function newAreaLines(name) {
    return [[0, '<template>'], [1, '<name>' + encodeXml(name) + '</name>'],
        [1, '<template xmlns:dcsat="' + AT_NS + '" xsi:type="dcsat:AreaTemplate">'], [2, '<dcsat:item xsi:type="dcsat:TableRow">'],
        [3, '<dcsat:tableCell/>'], [2, '</dcsat:item>'], [1, '</template>'], [0, '</template>']];
}

/* The index a new template element gets among the template elements of the
 * schema, which keep the order area, field, group, group header. */
function templateIndex(schemaEl, tag) {
    var order = ['template', 'fieldTemplate', 'groupTemplate', 'groupHeaderTemplate'];
    var at = order.indexOf(tag);
    return Array.prototype.filter.call(schemaEl.children || [], function (k) {
        var i = order.indexOf(localName(k));
        return i >= 0 && i <= at || localName(k) === 'totalFieldsTemplate' && false;
    }).length;
}

function addTemplateEdit(model, values) {
    var src = model.source;
    var schema = own(src.owners, schemaKey(model.prefix));
    if (!schema) return null;
    var pre = model.prefix || '';
    var kind = values.kind || 'area';
    var taken = {};
    kidsNamed(schema.el, 'template').forEach(function (t) { taken[textOf(firstChild(t, 'name'))] = 1; });
    var area = String(values.area || '').trim();
    var ops = [];
    var defName = '';
    if (kind === 'area' || !area) {
        defName = String(kind === 'area' ? values.name || '' : '').trim() || freeName('Макет', taken);
        if (!PATH_RE.test(defName) || defName.indexOf('.') >= 0) return { error: 'Имя макета — буквы, цифры и «_»' };
        if (own(taken, defName)) return { error: 'Макет «' + defName + '» уже есть' };
        ops.push(insertOp(src, schema.el, CHILD_ORDER.schema, 'template', newAreaLines(defName)));
        area = defName;
    } else if (!own(taken, area)) return { error: 'Макета «' + area + '» нет' };
    var id;
    if (kind === 'area') id = 'tpl:' + pre + templateIndex(schema.el, 'template');
    else {
        var lines = templateBindingLines(model, { kind: kind, target: values.target, templateType: values.templateType || 'Header', area: area });
        if (lines.error) return lines;
        ops.push(insertOp(src, schema.el, CHILD_ORDER.schema, TEMPLATE_TAGS[kind], lines));
        id = 'tpl:' + pre + (templateIndex(schema.el, TEMPLATE_TAGS[kind]) + (defName ? 1 : 0));
    }
    /* An area and its binding land next to each other: one insert after the other. */
    if (ops.length === 2 && ops[0] && ops[1] && ops[0].start === ops[1].start) ops = [{ start: ops[0].start, end: ops[0].end, text: ops[0].text + ops[1].text }];
    return withBom(model, combine(src, ops), id);
}

function templateBindingEdit(model, id, data) {
    var owner = templateOwner(model, id);
    var now = templateBindingOf(model, id);
    if (!owner || !now) return null;
    if (data.kind === now.kind && data.target === now.target && data.area === now.area && (data.kind === 'field' || data.templateType === now.templateType)) return null;
    if (!now.simple && data.target === now.target && data.kind === now.kind) {
        /* Several groupings: only the type and the area change. */
        var ops = [];
        var te = firstChild(owner.el, 'templateType');
        if (te && data.templateType !== now.templateType) {
            if (!own(TEMPLATE_TYPES, data.templateType || '')) return { error: 'Недопустимый тип макета' };
            ops.push(textOp(model.source, te, data.templateType));
        }
        var ae = firstChild(owner.el, 'template');
        if (ae && data.area !== now.area) ops.push(textOp(model.source, ae, data.area));
        return withBom(model, combine(model.source, ops));
    }
    if (data.kind !== now.kind) return { error: 'Вид макета не меняется: добавьте новый' };
    var lines = templateBindingLines(model, data);
    if (lines.error) return lines;
    var rec = model.source.pos.rec(owner.el);
    return withBom(model, { start: rec.start, end: rec.close, text: fragment(lines, indentBefore(model.source.xml, rec.start), model.source.eol) });
}

/* A cell of an area: { kind: text | parameter | empty, value, appearance (rows), keep }. */
function cellOf(model, id) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner || owner.kind !== 'cell') return null;
    var items = kidsNamed(owner.el, 'item');
    var item = items[0];
    var v = item && firstChild(item, 'value');
    var vt = v ? xsiType(v) : '';
    var mixed = items.length > 1 || (item && xsiType(item) !== 'Field');
    var out = {
        kind: mixed ? 'mixed' : !item ? 'empty' : vt === 'Parameter' ? 'parameter' : 'text',
        value: mixed ? items.map(function (it) { var x = firstChild(it, 'value'); return xsiType(x) === 'Parameter' ? '<' + textOf(x) + '>' : localizedFrom(x); }).join(' ')
            : !v ? '' : vt === 'Parameter' ? textOf(v) : localizedFrom(v),
        appearance: parameterRows(model, id, 'appearance')
    };
    out.keep = { items: items.map(function (it) { return elementText(src, it); }), sig: JSON.stringify([out.kind, out.value]),
        fieldAppearanceXml: item && !mixed ? elementText(src, firstChild(item, 'appearance')) : '' };
    return out;
}

function cellEdit(model, id, data) {
    var now = cellOf(model, id);
    if (!now) return null;
    var src = model.source;
    var owner = own(src.owners, id);
    var p = prefixOf(tagOf(src, owner.el)) || 'dcsat:';
    var lines = [];
    var keep = data.keep || now.keep;
    var sig = JSON.stringify([data.kind, data.kind === 'empty' ? '' : String(data.value || '')]);
    if (data.kind === 'mixed') {
        /* Several fields in one cell are written as they were. */
        (keep.items || []).forEach(function (x) { lines.push([1, x]); });
    } else if (data.kind !== 'empty') {
        if (keep.items && keep.items.length === 1 && sig === keep.sig) lines.push([1, keep.items[0]]);
        else {
            var value = String(data.value || '');
            lines.push([1, '<' + p + 'item xsi:type="dcsat:Field">']);
            if (data.kind === 'parameter') {
                if (!PATH_RE.test(value.trim())) return { error: 'Имя параметра макета — буквы, цифры и «_»' };
                lines.push([2, '<' + p + 'value xsi:type="dcscor:Parameter">' + encodeXml(value.trim()) + '</' + p + 'value>']);
            } else {
                lines.push([2, '<' + p + 'value xsi:type="v8:LocalStringType">']);
                ruItemLines(value.replace(/\s*\n\s*/g, ' '), 3).forEach(function (l) { lines.push(l); });
                lines.push([2, '</' + p + 'value>']);
            }
            if (keep.fieldAppearanceXml) lines.push([2, keep.fieldAppearanceXml]);
            lines.push([1, '</' + p + 'item>']);
        }
    }
    var looks = parameterListLines(model, id, 'appearance', data.appearance || now.appearance || []);
    if (looks.error) return looks;
    looks.forEach(function (l) { lines.push([l[0] + 1, l[1]]); });
    var rec = src.pos.rec(owner.el);
    var tag = rec.tag;
    var text = lines.length ? fragment([[0, '<' + tag + '>']].concat(lines, [[0, '</' + tag + '>']]), indentBefore(src.xml, rec.start), src.eol) : '<' + tag + '/>';
    if (text === src.xml.slice(rec.start, rec.close)) return null;
    return withBom(model, { start: rec.start, end: rec.close, text: text });
}

/* A row added to an area after row `after` (-1: at the end) with as many
 * empty cells as that row has; a cell added after cell `id`. */
function areaRowAddEdit(model, tplId, after) {
    var owner = templateOwner(model, tplId, 'template');
    if (!owner) return null;
    var src = model.source;
    var area = firstChild(owner.el, 'template');
    var rows = kidsNamed(area, 'item');
    var ref = rows[after >= 0 ? after : rows.length - 1];
    var cells = ref ? Math.max(1, kidsNamed(ref, 'tableCell').length) : 1;
    var p = ref ? prefixOf(tagOf(src, ref)) : 'dcsat:';
    var lines = [[0, '<' + p + 'item xsi:type="dcsat:TableRow">']];
    for (var i = 0; i < cells; i++) lines.push([1, '<' + p + 'tableCell/>']);
    lines.push([0, '</' + p + 'item>']);
    var at = after >= 0 ? after + 1 : rows.length;
    var id = 'arow:' + tplId.slice(4) + ':' + at;
    if (ref) {
        var rr = src.pos.rec(ref);
        var ind = indentBefore(src.xml, rr.start);
        return withBom(model, { start: rr.close, end: rr.close, text: src.eol + ind + fragment(lines, ind, src.eol) }, id);
    }
    return withBom(model, insertChild(src, area, ['item'], 'item', lines), id);
}

function areaCellAddEdit(model, cellId) {
    var src = model && model.source;
    var owner = src && own(src.owners, cellId);
    if (!owner || owner.kind !== 'cell') return null;
    var rec = src.pos.rec(owner.el);
    var ind = indentBefore(src.xml, rec.start);
    return withBom(model, { start: rec.close, end: rec.close, text: src.eol + ind + '<' + prefixOf(rec.tag) + 'tableCell/>' }, movedId(cellId, 1));
}

/* -------------------------------------------------------- user settings

 * Свойства элемента пользовательских настроек: whether the element is in
 * the user settings (it has a userSettingID), how it is edited there and
 * its presentation. A settings item, a list (selection, filter, order,
 * conditional appearance) or an item of the structure. */
var VIEW_MODES = { Auto: 'Авто', Normal: 'Обычный', QuickAccess: 'Быстрый доступ', Inaccessible: 'Недоступный' };
var USER_LISTS = { selection: 1, filter: 1, order: 1, conditionalAppearance: 1 };

function userSettingSpot(model, id) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner) return null;
    if (owner.kind === 'slist') {
        if (!own(USER_LISTS, owner.tag)) return null;
        return { owner: owner, el: owner.el, order: SETTINGS_ORDER.list, list: true };
    }
    if (owner.kind !== 'sitem' && owner.kind !== 'snode') return null;
    if (owner.kind === 'snode' && localName(owner.el) === 'settings') return null;
    var order = orderOf(owner);
    if (!order || order.indexOf('userSettingID') < 0) return null;
    return { owner: owner, el: owner.el, order: order, list: false };
}

function userSettingOf(model, id) {
    var spot = userSettingSpot(model, id);
    if (!spot) return null;
    var el = spot.el;
    return {
        include: !!textOf(firstChild(el, 'userSettingID')), viewMode: textOf(firstChild(el, 'viewMode')) || 'Auto',
        presentation: localizedFrom(firstChild(el, 'userSettingPresentation'))
    };
}

function newUuid() {
    var c = root.crypto;
    if (c && typeof c.randomUUID === 'function') return c.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (ch) {
        var r = Math.random() * 16 | 0;
        return (ch === 'x' ? r : (r & 3 | 8)).toString(16);
    });
}

/* Replaces the children `names` of `el` (the first of them names the place
 * in `order`) with `lines`. */
function replaceChildrenOp(src, el, order, names, lines) {
    var prec = src.pos.rec(el);
    if (!prec) return null;
    if (prec.selfClosing) return lines.length ? insertChild(src, el, order, names[0], lines) : null;
    var ops = [];
    var kids = Array.prototype.slice.call(el.children || []);
    var kept = kids.filter(function (k) { return names.indexOf(localName(k)) < 0; });
    /* Nothing left: the element closes itself again, as it may have been. */
    if (!lines.length && !kept.length && kids.length) {
        return { start: prec.start, end: prec.close, text: src.xml.slice(prec.start, prec.contentStart).replace(/>$/, '/>') };
    }
    kids.forEach(function (k) { if (names.indexOf(localName(k)) >= 0) ops.push(removeOp(src, k)); });
    if (lines.length) {
        var first = (kept[0] || kids[0]) ? src.pos.rec(kept[0] || kids[0]) : null;
        var indent = first ? indentBefore(src.xml, first.start) : indentBefore(src.xml, prec.start) + '\t';
        /* Each line goes where the order puts its element (viewMode before id, userSettingID after it). */
        var groups = [];
        lines.forEach(function (l) {
            var m = /^<(?:[\w.-]+:)?([\w]+)/.exec(l[1]);
            var name = l[0] === 0 && m && names.indexOf(m[1]) >= 0 ? m[1] : null;
            if (name || !groups.length) groups.push({ name: name || names[0], lines: [l] });
            else groups[groups.length - 1].lines.push(l);
        });
        groups.forEach(function (g) {
            var at = order.indexOf(g.name);
            var anchor = null;
            kept.forEach(function (k) {
                var i = order.indexOf(localName(k));
                if (i >= 0 && i <= at) anchor = k;
            });
            var pos = anchor ? src.pos.rec(anchor).close : prec.contentStart;
            ops.push({ start: pos, end: pos, text: src.eol + indent + fragment(g.lines, indent, src.eol) });
        });
        if (!kids.length) ops.push({ start: prec.end, end: prec.end, text: src.eol + indentBefore(src.xml, prec.start) });
    }
    return ops.length ? combine(src, ops) : null;
}

function userSettingEdit(model, id, us) {
    var spot = userSettingSpot(model, id);
    if (!spot) return null;
    var src = model.source;
    var now = userSettingOf(model, id);
    var mode = own(VIEW_MODES, us.viewMode || '') ? us.viewMode : 'Auto';
    var pres = String(us.presentation || '').replace(/\s*\n\s*/g, ' ').trim();
    if (!!us.include === now.include && mode === now.viewMode && pres === now.presentation) return null;
    var el = spot.el;
    /* The settings namespace, whatever the item's own children are in (a parameter value's are dcscor). */
    var sm = /xmlns:([\w.-]+)="http:\/\/v8\.1c\.ru\/8\.1\/data-composition-system\/settings"/.exec(src.xml);
    var p = sm ? sm[1] + ':' : 'dcsset:';
    var lines = [];
    if (mode !== 'Auto') lines.push([0, '<' + p + 'viewMode>' + mode + '</' + p + 'viewMode>']);
    var oldId = el && firstChild(el, 'userSettingID');
    if (us.include) lines.push([0, oldId ? elementText(src, oldId) : '<' + p + 'userSettingID>' + newUuid() + '</' + p + 'userSettingID>']);
    var oldPres = el && firstChild(el, 'userSettingPresentation');
    if (pres) {
        if (oldPres && pres === now.presentation) lines.push([0, elementText(src, oldPres)]);
        else [[0, '<' + p + 'userSettingPresentation xsi:type="v8:LocalStringType">']].concat(ruItemLines(pres, 1), [[0, '</' + p + 'userSettingPresentation>']]).forEach(function (l) { lines.push(l); });
    }
    if (!el) {
        if (!lines.length) return null;
        var o = spot.owner;
        return withBom(model, insertChild(src, o.parent, orderOf({ kind: 'snode', el: o.parent }), o.tag,
            [[0, '<' + p + o.tag + '>']].concat(lines.map(function (l) { return [l[0] + 1, l[1]]; }), [[0, '</' + p + o.tag + '>']])));
    }
    /* A list that held nothing but these goes away with them. */
    var names = ['viewMode', 'userSettingID', 'userSettingPresentation'];
    if (spot.list && !lines.length && Array.prototype.every.call(el.children || [], function (k) { return names.indexOf(localName(k)) >= 0; })) {
        return withBom(model, removeChildOp(src, spot.owner.parent, el));
    }
    return withBom(model, replaceChildrenOp(src, el, spot.order, names, lines));
}

/* --------------------------------------------------------- user fields

 * A user field of the settings: an expression (of the detail records and of
 * the totals) or a choice (cases: a condition, a value, its presentation).
 * A case whose condition is more than one comparison keeps it as it is. */
function flatCondition(src, filter) {
    var items = kidsNamed(filter, 'item');
    if (items.length > 1) return null;
    var c = items[0];
    if (!c) return { field: '', comparisonType: 'Equal', value: '' };
    if (xsiType(c) !== 'FilterItemComparison' || textOf(firstChild(c, 'use')) === 'false') return null;
    var rights = kidsNamed(c, 'right');
    if (rights.length > 1) return null;
    var r = rights[0];
    var rt = r ? xsiType(r) : '';
    if (r && rt !== 'string' && rt !== 'decimal' && rt !== 'boolean' && rt !== 'dateTime' && rt !== 'Parameter' && rt !== 'DesignTimeValue') return null;
    return {
        field: textOf(firstChild(c, 'left')), comparisonType: textOf(firstChild(c, 'comparisonType')) || 'Equal',
        value: !r ? '' : rt === 'Parameter' ? '&' + textOf(r) : typedValueText(src, r)
    };
}

function userFieldOf(model, id) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner || owner.kind !== 'sitem' || owner.list !== 'userFields') return null;
    var el = owner.el;
    var type = xsiType(el);
    var out = {
        kind: type === 'UserFieldCase' ? 'case' : 'expression', dataPath: textOf(firstChild(el, 'dataPath')),
        title: localizedFrom(firstChild(el, 'lwsTitle')), keep: { titleXml: elementText(src, firstChild(el, 'lwsTitle')) }
    };
    out.keep.title = out.title;
    if (out.kind === 'expression') {
        out.detail = exactText(src, firstChild(el, 'detailExpression'));
        out.total = exactText(src, firstChild(el, 'totalExpression'));
        out.keep.detail = out.detail;
        out.keep.total = out.total;
        out.keep.detailPresXml = elementText(src, firstChild(el, 'detailExpressionPresentation'));
        out.keep.detailXml = elementText(src, firstChild(el, 'detailExpression'));
        out.keep.totalXml = elementText(src, firstChild(el, 'totalExpression'));
        out.keep.totalPresXml = elementText(src, firstChild(el, 'totalExpressionPresentation'));
    } else {
        out.cases = kidsNamed(firstChild(el, 'cases'), 'item').map(function (c) {
            var f = firstChild(c, 'filter');
            var cond = flatCondition(src, f);
            var row = cond || { field: '', comparisonType: 'Equal', value: '' };
            row.complex = !cond;
            row.value2 = typedValueText(src, firstChild(c, 'value'));
            row.presentation = localizedFrom(firstChild(c, 'lwsPresentationValue'));
            row.keep = { filterXml: elementText(src, f), valueXml: elementText(src, firstChild(c, 'value')), presentationXml: elementText(src, firstChild(c, 'lwsPresentationValue')),
                cond: JSON.stringify([row.field, row.comparisonType, row.value]), value2: row.value2, presentation: row.presentation };
            return row;
        });
    }
    return out;
}

function userFieldLines(src, p, data) {
    var keep = data.keep || {};
    var path = String(data.dataPath || '').trim();
    if (!/^ПользовательскиеПоля\.[A-Za-zА-Яа-яЁё_][0-9A-Za-zА-Яа-яЁё_]*$|^UserFields\.[A-Za-z_][0-9A-Za-z_]*$/.test(path)) return { error: 'Путь пользовательского поля — ПользовательскиеПоля.Имя' };
    var title = String(data.title || '').replace(/\s*\n\s*/g, ' ').trim();
    if (!title) return { error: 'Укажите заголовок поля' };
    var lines = [[0, '<' + p + 'item xsi:type="dcsset:' + (data.kind === 'case' ? 'UserFieldCase' : 'UserFieldExpression') + '">'],
        [1, '<' + p + 'dataPath>' + encodeXml(path) + '</' + p + 'dataPath>']];
    if (keep.titleXml && title === keep.title) lines.push([1, keep.titleXml]);
    else {
        lines.push([1, '<' + p + 'lwsTitle>']);
        ruItemLines(title, 2).forEach(function (l) { lines.push(l); });
        lines.push([1, '</' + p + 'lwsTitle>']);
    }
    var text = function (tag, v) {
        v = String(v == null ? '' : v).replace(/\r\n/g, '\n');
        lines.push([1, v ? '<' + p + tag + '>' + encodeText(src, null, v) + '</' + p + tag + '>' : '<' + p + tag + '/>']);
    };
    if (data.kind !== 'case') {
        /* The presentation (fields by their titles) stays while its expression
         * does; a new expression is its own presentation. */
        /* An expression left as it was keeps its line breaks, whatever the file's are. */
        if (keep.detailXml && data.detail === keep.detail) lines.push([1, keep.detailXml]); else text('detailExpression', data.detail);
        if (keep.detailPresXml && data.detail === keep.detail) lines.push([1, keep.detailPresXml]); else text('detailExpressionPresentation', data.detail);
        if (keep.totalXml && data.total === keep.total) lines.push([1, keep.totalXml]); else text('totalExpression', data.total);
        if (keep.totalPresXml && data.total === keep.total) lines.push([1, keep.totalPresXml]); else text('totalExpressionPresentation', data.total);
    } else {
        var cases = data.cases || [];
        if (!cases.length) lines.push([1, '<' + p + 'cases/>']);
        else {
            lines.push([1, '<' + p + 'cases>']);
            for (var i = 0; i < cases.length; i++) {
                var c = cases[i];
                var ck = c.keep || {};
                lines.push([2, '<' + p + 'item>']);
                if (ck.filterXml && (c.complex || JSON.stringify([c.field, c.comparisonType, c.value]) === ck.cond)) lines.push([3, ck.filterXml]);
                else if (!String(c.field || '').trim()) lines.push([3, '<' + p + 'filter/>']);
                else {
                    if (!PATH_RE.test(String(c.field).trim())) return { error: 'Поле условия — путь через точку: «' + c.field + '»' };
                    var vt = String(c.value || '').trim();
                    var vx = !vt ? null : vt.charAt(0) === '&' ? '<' + p + 'right xsi:type="dcscor:Parameter">' + encodeXml(vt.slice(1)) + '</' + p + 'right>' : typedValueXml(p, 'right', vt);
                    if (vx && vx.error) return vx;
                    lines.push([3, '<' + p + 'filter>'], [4, '<' + p + 'item xsi:type="dcsset:FilterItemComparison">'],
                        [5, '<' + p + 'left xsi:type="dcscor:Field">' + encodeXml(String(c.field).trim()) + '</' + p + 'left>'],
                        [5, '<' + p + 'comparisonType>' + (own(COMPARISON, c.comparisonType || '') ? c.comparisonType : 'Equal') + '</' + p + 'comparisonType>']);
                    if (vx) lines.push([5, vx]);
                    lines.push([4, '</' + p + 'item>'], [3, '</' + p + 'filter>']);
                }
                if (ck.valueXml && c.value2 === ck.value2) lines.push([3, ck.valueXml]);
                else {
                    var val = typedValueXml(p, 'value', c.value2);
                    if (val && val.error) return val;
                    lines.push([3, val]);
                }
                var pr = String(c.presentation || '').replace(/\s*\n\s*/g, ' ');
                if (ck.presentationXml && pr === ck.presentation) lines.push([3, ck.presentationXml]);
                else if (pr) {
                    lines.push([3, '<' + p + 'lwsPresentationValue>']);
                    ruItemLines(pr, 4).forEach(function (l) { lines.push(l); });
                    lines.push([3, '</' + p + 'lwsPresentationValue>']);
                }
                lines.push([2, '</' + p + 'item>']);
            }
            lines.push([1, '</' + p + 'cases>']);
        }
    }
    lines.push([0, '</' + p + 'item>']);
    return lines;
}

/* A user field written into its place: `id` an item (replaced) or the
 * root's `|userFields` list (a new one, ПользовательскиеПоля.ПолеN). */
function userFieldEdit(model, id, data) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner) return null;
    var p, lines;
    if (owner.kind === 'sitem' && owner.list === 'userFields') {
        p = prefixOf(tagOf(src, owner.el)) || 'dcsset:';
        lines = userFieldLines(src, p, data);
        if (lines.error) return lines;
        var rec = src.pos.rec(owner.el);
        var text = fragment(lines, indentBefore(src.xml, rec.start), src.eol);
        if (text === src.xml.slice(rec.start, rec.close)) return null;
        return withBom(model, { start: rec.start, end: rec.close, text: text }, id);
    }
    if (owner.kind !== 'slist' || owner.tag !== 'userFields') return null;
    var list = owner.el;
    var taken = {};
    kidsNamed(list, 'item').forEach(function (it) { taken[textOf(firstChild(it, 'dataPath'))] = 1; });
    var n = 1;
    while (own(taken, 'ПользовательскиеПоля.Поле' + n)) n++;
    var fresh = {};
    for (var k in data) if (Object.prototype.hasOwnProperty.call(data, k)) fresh[k] = data[k];
    if (!fresh.dataPath) fresh.dataPath = 'ПользовательскиеПоля.Поле' + n;
    if (own(taken, fresh.dataPath)) return { error: 'Поле «' + fresh.dataPath + '» уже есть' };
    p = list ? childPrefix(src, list, 'dcsset:') : prefixOf(tagOf(src, owner.parent)) || 'dcsset:';
    lines = userFieldLines(src, p, fresh);
    if (lines.error) return lines;
    if (list) return withBom(model, insertChild(src, list, SETTINGS_ORDER.list, 'item', lines), id + ':' + kidsNamed(list, 'item').length);
    return withBom(model, insertChild(src, owner.parent, orderOf({ kind: 'snode', el: owner.parent }), 'userFields',
        [[0, '<' + p + 'userFields>']].concat(lines.map(function (l) { return [l[0] + 1, l[1]]; }), [[0, '</' + p + 'userFields>']])), id + ':0');
}

/* ---------------------------------------------- conditional appearance

 * An item of the conditional appearance: the fields it decorates, the
 * condition (a flat list of comparisons; one with groups keeps its filter
 * as it is), the appearance, the presentation and where it applies. */
var USE_IN = [
    ['useInGroup', 'В группировке'], ['useInHierarchicalGroup', 'В иерархической группировке'], ['useInOverall', 'В общем итоге'],
    ['useInFieldsHeader', 'В заголовке полей'], ['useInHeader', 'В заголовке'], ['useInParameters', 'В параметрах'],
    ['useInFilter', 'В отборе'], ['useInResourceFieldsHeader', 'В заголовке полей ресурсов'], ['useInOverallHeader', 'В заголовке общего итога'],
    ['useInOverallResourceFieldsHeader', 'В заголовке полей ресурсов общего итога']
];

function appearanceItemOf(model, id) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner || owner.kind !== 'sitem' || owner.list !== 'appearance') return null;
    var el = owner.el;
    var filter = firstChild(el, 'filter');
    var conds = kidsNamed(filter, 'item');
    var flat = conds.every(function (c) {
        if (xsiType(c) !== 'FilterItemComparison') return false;
        var r = firstChild(c, 'right');
        var rt = r ? xsiType(r) : '';
        return !r || rt === 'string' || rt === 'decimal' || rt === 'boolean' || rt === 'dateTime' || rt === 'Parameter';
    });
    var out = {
        use: textOf(firstChild(el, 'use')) !== 'false',
        fields: kidsNamed(firstChild(el, 'selection'), 'item').map(function (it) { return { field: textOf(firstChild(it, 'field')) }; }),
        flat: flat,
        conditions: flat ? conds.map(function (c) {
            var r = firstChild(c, 'right');
            var rt = r ? xsiType(r) : '';
            return {
                use: textOf(firstChild(c, 'use')) !== 'false', field: textOf(firstChild(c, 'left')),
                comparisonType: textOf(firstChild(c, 'comparisonType')) || 'Equal',
                value: !r ? '' : rt === 'Parameter' ? '&' + textOf(r) : rt === 'string' ? exactText(src, r) : valueText(r, null)
            };
        }) : [],
        condition: flat ? '' : kidsNamed(filter, 'item').length + ' усл.',
        appearance: parameterRows(model, id, 'appearance'),
        presentation: localizedFrom(firstChild(el, 'presentation')),
        areas: {}
    };
    USE_IN.forEach(function (u) { out.areas[u[0]] = textOf(firstChild(el, u[0])) !== 'DontUse'; });
    out.keep = {
        fields: JSON.stringify(out.fields), conditions: JSON.stringify(out.conditions), presentation: out.presentation,
        selectionXml: elementText(src, firstChild(el, 'selection')), filterXml: elementText(src, firstChild(el, 'filter')),
        presentationXml: elementText(src, firstChild(el, 'presentation')),
        tail: ['viewMode', 'userSettingID', 'userSettingPresentation'].map(function (t) { return elementText(src, firstChild(el, t)); }).filter(Boolean),
        areas: USE_IN.map(function (u) { return elementText(src, firstChild(el, u[0])); })
    };
    return out;
}

/* The lines of a conditional appearance item for `data` (appearanceItemOf's
 * shape); `spot` is where its appearance list goes, for the namespaces. */
function appearanceItemLines(src, holder, p, data, depth) {
    var keep = data.keep || {};
    var lines = [[0, '<' + p + 'item>']];
    if (!data.use) lines.push([1, '<' + p + 'use>false</' + p + 'use>']);
    var fields = (data.fields || []).filter(function (f) { return String(f.field || '').trim(); });
    if (keep.selectionXml && JSON.stringify(data.fields || []) === keep.fields) lines.push([1, keep.selectionXml]);
    else if (!fields.length) lines.push([1, '<' + p + 'selection/>']);
    else {
        lines.push([1, '<' + p + 'selection>']);
        for (var i = 0; i < fields.length; i++) {
            var f = String(fields[i].field).trim();
            if (!PATH_RE.test(f)) return { error: 'Оформляемое поле — путь через точку: «' + f + '»' };
            lines.push([2, '<' + p + 'item>'], [3, '<' + p + 'field>' + encodeXml(f) + '</' + p + 'field>'], [2, '</' + p + 'item>']);
        }
        lines.push([1, '</' + p + 'selection>']);
    }
    var conds = (data.conditions || []).filter(function (c) { return String(c.field || '').trim(); });
    if (keep.filterXml && (!data.flat || JSON.stringify(data.conditions || []) === keep.conditions)) lines.push([1, keep.filterXml]);
    else if (!conds.length) lines.push([1, '<' + p + 'filter/>']);
    else {
        lines.push([1, '<' + p + 'filter>']);
        for (var k = 0; k < conds.length; k++) {
            var c = conds[k];
            if (!PATH_RE.test(String(c.field).trim())) return { error: 'Поле условия — путь через точку: «' + c.field + '»' };
            var item = settingsItemLines('filter', { field: c.field, comparisonType: c.comparisonType, value: c.value }, p);
            if (item.error) return item;
            if (c.use === false) item.splice(1, 0, [1, '<' + p + 'use>false</' + p + 'use>']);
            item.forEach(function (l) { lines.push([l[0] + 2, l[1]]); });
        }
        lines.push([1, '</' + p + 'filter>']);
    }
    var rows = (data.appearance || []).filter(function (r) { return String(r.parameter || '').trim(); });
    if (!rows.length) lines.push([1, '<' + p + 'appearance/>']);
    else {
        lines.push([1, '<' + p + 'appearance>']);
        var seen = {};
        for (var j = 0; j < rows.length; j++) {
            var r = rows[j];
            if (own(seen, r.parameter)) return { error: 'Параметр «' + r.parameter + '» указан дважды' };
            seen[r.parameter] = 1;
            var kind = own(PARAMETER_KINDS.appearance, r.parameter) || { t: 'raw' };
            var il = keptParameterItem(r, 'dcscor:') || parameterItemLines(src, holder, 'dcscor:', true, r, kind, depth + 2);
            if (il.error) return il;
            il.forEach(function (l) { lines.push([l[0] + 2, l[1]]); });
        }
        lines.push([1, '</' + p + 'appearance>']);
    }
    var pres = String(data.presentation || '').replace(/\s*\n\s*/g, ' ');
    if (keep.presentationXml && pres === keep.presentation) lines.push([1, keep.presentationXml]);
    else if (pres) ruTitleLines(p + 'presentation', pres).forEach(function (l) { lines.push([l[0] + 1, l[1]]); });
    (keep.tail || []).forEach(function (x) { lines.push([1, x]); });
    USE_IN.forEach(function (u, n) {
        var on = !data.areas || data.areas[u[0]] !== false;
        var was = keep.areas && keep.areas[n];
        if (was && (/>DontUse</.test(was) ? !on : on)) lines.push([1, was]);
        else if (!on) lines.push([1, '<' + p + u[0] + '>DontUse</' + p + u[0] + '>']);
    });
    lines.push([0, '</' + p + 'item>']);
    return lines;
}

function appearanceItemEdit(model, id, data) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner) return null;
    var p, lines, op, newId;
    if (owner.kind === 'sitem' && owner.list === 'appearance') {
        p = prefixOf(tagOf(src, owner.el)) || 'dcsset:';
        lines = appearanceItemLines(src, owner.el, p, data, elementDepth(src, owner.el));
        if (lines.error) return lines;
        var rec = src.pos.rec(owner.el);
        var text = fragment(lines, indentBefore(src.xml, rec.start), src.eol);
        if (text === src.xml.slice(rec.start, rec.close)) return null;
        op = { start: rec.start, end: rec.close, text: text };
        newId = id;
    } else if (owner.kind === 'slist' && owner.tag === 'conditionalAppearance') {
        var list = owner.el;
        p = list ? childPrefix(src, list, 'dcsset:') : prefixOf(tagOf(src, owner.parent)) || 'dcsset:';
        var depth = elementDepth(src, list || owner.parent) + 1;
        lines = appearanceItemLines(src, list || owner.parent, p, data, depth);
        if (lines.error) return lines;
        if (list) {
            op = insertChild(src, list, SETTINGS_ORDER.list, 'item', lines);
            newId = id + ':' + kidsNamed(list, 'item').length;
        } else {
            op = insertChild(src, owner.parent, orderOf({ kind: 'snode', el: owner.parent }), 'conditionalAppearance',
                [[0, '<' + p + 'conditionalAppearance>']].concat(lines.map(function (l) { return [l[0] + 1, l[1]]; }), [[0, '</' + p + 'conditionalAppearance>']]));
            newId = id + ':0';
        }
    } else return null;
    return withBom(model, op, newId);
}

/* The depth of an element in the document, the root being 1: the platform
 * names the namespace of a reference type after the depth of its <v8:Type>
 * (d4p1 in a parameter, d5p1 in a data set field). */
function elementDepth(src, el) {
    var d = 0;
    while (el) { d++; el = parentOf(src, el); }
    return d;
}

/* The records whose value type the window edits; a parameter's value goes
 * with its type, as the old one may not fit. */
var TYPED = { param: 1, field: 1, calc: 1 };

function typeEdit(model, id, text) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner || !own(TYPED, owner.kind)) return null;
    if (owner.kind === 'field' && xsiType(owner.el) !== 'DataSetFieldField') return null;
    var current = typePresentation(firstChild(owner.el, 'valueType'));
    if (String(text || '').trim() === current) return null;
    var t = typeLines(text, elementDepth(src, owner.el) + 2);
    if (t.error) return t;
    var ops = [];
    var vt = firstChild(owner.el, 'valueType');
    var value = owner.kind === 'param' ? firstChild(owner.el, 'value') : null;
    if (vt) {
        var rec = src.pos.rec(vt);
        var indent = indentBefore(src.xml, rec.start);
        ops.push(t.lines ? { start: rec.start, end: rec.close, text: fragment(t.lines, indent, src.eol) } : removeOp(src, vt));
    } else if (t.lines) ops.push(insertOp(src, owner.el, CHILD_ORDER[owner.kind], 'valueType', t.lines));
    if (value) {
        var vr = src.pos.rec(value);
        ops.push({ start: vr.start, end: vr.close, text: '<value xsi:nil="true"/>' });
    }
    return withBom(model, combine(src, ops));
}

/* ---------------------------------------------------------------- adding */

var DEFAULT_SOURCE = 'ИсточникДанных1';

function ruTitleLines(tag, text) {
    return [[0, '<' + tag + ' xsi:type="v8:LocalStringType">']].concat(ruItemLines(text, 1), [[0, '</' + tag + '>']]);
}

/* The new settings item of list `kind` for `values`. */
function settingsItemLines(kind, values, p) {
    var field = String(values.field || '').trim();
    var enc = encodeXml;
    if (kind === 'selection') {
        return [[0, '<' + p + 'item xsi:type="dcsset:SelectedItemField">'], [1, '<' + p + 'field>' + enc(field) + '</' + p + 'field>'],
            [0, '</' + p + 'item>']];
    }
    if (kind === 'order') {
        var dir = values.orderType === 'Desc' ? 'Desc' : 'Asc';
        return [[0, '<' + p + 'item xsi:type="dcsset:OrderItemField">'], [1, '<' + p + 'field>' + enc(field) + '</' + p + 'field>'],
            [1, '<' + p + 'orderType>' + dir + '</' + p + 'orderType>'], [0, '</' + p + 'item>']];
    }
    if (kind === 'groupFields') return groupItemLines(field, p);
    if (kind === 'filter') {
        var cmp = own(COMPARISON, values.comparisonType || '') ? values.comparisonType : 'Equal';
        var lines = [[0, '<' + p + 'item xsi:type="dcsset:FilterItemComparison">'],
            [1, '<' + p + 'left xsi:type="dcscor:Field">' + enc(field) + '</' + p + 'left>'],
            [1, '<' + p + 'comparisonType>' + cmp + '</' + p + 'comparisonType>']];
        var right = filterValueXml(p, values.value, '');
        if (right && right.error) return right;
        if (right) lines.push([1, right]);
        lines.push([0, '</' + p + 'item>']);
        return lines;
    }
    return null;
}

function groupItemLines(field, p) {
    return [[0, '<' + p + 'item xsi:type="dcsset:GroupItemField">'], [1, '<' + p + 'field>' + encodeXml(field) + '</' + p + 'field>'],
        [1, '<' + p + 'groupType>Items</' + p + 'groupType>'], [1, '<' + p + 'periodAdditionType>None</' + p + 'periodAdditionType>'],
        [1, '<' + p + 'periodAdditionBegin xsi:type="xs:dateTime">0001-01-01T00:00:00</' + p + 'periodAdditionBegin>'],
        [1, '<' + p + 'periodAdditionEnd xsi:type="xs:dateTime">0001-01-01T00:00:00</' + p + 'periodAdditionEnd>'],
        [0, '</' + p + 'item>']];
}

/* A grouping of the structure: by `field`, or the detail records without one. */
function structureGroupLines(field, p) {
    var lines = [[0, '<' + p + 'item xsi:type="dcsset:StructureItemGroup">']];
    if (field) {
        lines.push([1, '<' + p + 'groupItems>']);
        groupItemLines(field, p).forEach(function (l) { lines.push([l[0] + 2, l[1]]); });
        lines.push([1, '</' + p + 'groupItems>']);
    }
    lines.push([1, '<' + p + 'order>'], [2, '<' + p + 'item xsi:type="dcsset:OrderItemAuto"/>'], [1, '</' + p + 'order>'],
        [1, '<' + p + 'selection>'], [2, '<' + p + 'item xsi:type="dcsset:SelectedItemAuto"/>'], [1, '</' + p + 'selection>'],
        [0, '</' + p + 'item>']);
    return lines;
}

/* A value typed for a filter: «Да»/«Нет», a number, a date, «&Параметр»,
 * otherwise a string; `type` keeps the type a value already has. */
function filterValueXml(p, text, type, name) {
    var t = String(text == null ? '' : text);
    /* Spaces are a string value of their own; only an empty text is no value. */
    if (!t || (!t.trim() && type !== 'string')) return null;
    var tag = p + (name || 'right');
    var kind = type || '';
    var trimmed = t.trim();
    if (!kind) {
        if (/^&[A-Za-zА-Яа-яЁё_][0-9A-Za-zА-Яа-яЁё_.]*$/.test(trimmed)) kind = 'Parameter';
        else if (own(YES, trimmed.toLowerCase()) && trimmed !== '1' || /^(нет|ложь)$/i.test(trimmed)) kind = 'boolean';
        else if (/^[+-]?\d[\d\s ]*(?:[.,]\d+)?$/.test(trimmed)) kind = 'decimal';
        else if (/^\d{1,2}\.\d{1,2}\.\d{4}(?:\s+\d{1,2}:\d\d(?::\d\d)?)?$/.test(trimmed)) kind = 'dateTime';
        else kind = 'string';
    }
    if (kind === 'Parameter') return '<' + tag + ' xsi:type="dcscor:Parameter">' + encodeXml(trimmed.replace(/^&/, '')) + '</' + tag + '>';
    if (kind === 'string') return '<' + tag + ' xsi:type="xs:string">' + encodeXml(t) + '</' + tag + '>';
    var w = valueWord({ kind: kind, dateOnly: false }, t);
    if (w.error) return w;
    return '<' + tag + ' xsi:type="xs:' + kind + '">' + w.word + '</' + tag + '>';
}

/* The source edit that adds a record of `what` to `target` with `values`:
 *   param   { name, type }                 a parameter of the schema;
 *   link    { source, dest, sourceExpression, destinationExpression };
 *   set     { kind: query|object|union, name } a data set (into a union when
 *           `target` is one);
 *   variant { name, presentation }         an empty settings variant;
 *   nested  { name, title }                an empty nested schema;
 *   selection / order / groupFields / filter { field, ... } an item of the
 *           settings list `target` (a list id, `<node>|selection`);
 *   selectionFolder { title, placement } / filterGroup { groupType } into a
 *           list `target` or a folder (a group) of it;
 *   template { kind: area | group | groupHeader | field, name, target, templateType, area }
 *           an area, or a binding of an area (a new one when `area` is empty);
 *   group   { field, kind: group | table | chart | nested, object, axis }
 *           an item of the structure under node `target`: a grouping (the
 *           detail records without a field), a table, a chart, a nested
 *           object (`object` — the nested schema); under a table or a chart
 *           a grouping of its `axis` (row, column, point, series).
 * { start, end, text, id } or { error }. */
function addRecordEdit(model, what, target, values) {
    var src = model && model.source;
    if (!src) return null;
    values = values || {};
    var schema = own(src.owners, schemaKey(model.prefix));
    var pre = model.prefix || '';
    var name = String(values.name || '').trim();
    var op, id;
    if (what === 'param') {
        if (!name) return { error: 'Укажите имя параметра' };
        if (!PATH_RE.test(name) || name.indexOf('.') >= 0) return { error: 'Имя — буквы, цифры и «_», не с цифры' };
        if (model.parameters.some(function (p) { return p.name === name; })) return { error: 'Параметр «' + name + '» уже есть' };
        var lines = [[0, '<parameter>'], [1, '<name>' + name + '</name>']];
        if (String(values.type || '').trim()) {
            var t = typeLines(values.type, 4);
            if (t.error) return t;
            t.lines.forEach(function (l) { lines.push([l[0] + 1, l[1]]); });
        }
        lines.push([1, '<value xsi:nil="true"/>'], [1, '<useRestriction>false</useRestriction>'], [0, '</parameter>']);
        op = insertOp(src, schema.el, CHILD_ORDER.schema, 'parameter', lines);
        id = 'param:' + pre + name;
    } else if (what === 'link') {
        var names = allSets(model.sets, 0, []).map(function (x) { return x.set.name; });
        var from = String(values.source || '').trim(), to = String(values.dest || '').trim();
        if (names.indexOf(from) < 0 || names.indexOf(to) < 0) return { error: 'Укажите наборы источника и приемника' };
        var se = String(values.sourceExpression || '').trim(), de = String(values.destinationExpression || '').trim();
        if (!se || !de) return { error: 'Укажите выражения источника и приемника' };
        op = insertOp(src, schema.el, CHILD_ORDER.schema, 'dataSetLink', [[0, '<dataSetLink>'],
            [1, '<sourceDataSet>' + encodeXml(from) + '</sourceDataSet>'], [1, '<destinationDataSet>' + encodeXml(to) + '</destinationDataSet>'],
            [1, '<sourceExpression>' + encodeXml(se) + '</sourceExpression>'],
            [1, '<destinationExpression>' + encodeXml(de) + '</destinationExpression>'], [0, '</dataSetLink>']]);
        id = 'link:' + pre + model.links.length;
    } else if (what === 'set') {
        var kind = { query: 'DataSetQuery', object: 'DataSetObject', union: 'DataSetUnion' }[values.kind || 'query'];
        if (!kind) return null;
        var taken = {};
        allSets(model.sets, 0, []).forEach(function (x) { taken[x.set.name] = 1; });
        if (!name) name = freeName('НаборДанных', taken);
        if (!PATH_RE.test(name) || name.indexOf('.') >= 0) return { error: 'Имя — буквы, цифры и «_», не с цифры' };
        if (own(taken, name)) return { error: 'Набор «' + name + '» уже есть' };
        var into = target ? own(src.owners, target) : null;
        if (target && (!into || into.kind !== 'set' || xsiType(into.el) !== 'DataSetUnion')) return { error: 'Вложенный набор добавляется в объединение' };
        var ops = [];
        var source = model.sources.length ? model.sources[0].name : '';
        if (!source && kind !== 'DataSetUnion') {
            source = DEFAULT_SOURCE;
            ops.push(insertOp(src, schema.el, CHILD_ORDER.schema, 'dataSource', [[0, '<dataSource>'], [1, '<name>' + source + '</name>'],
                [1, '<dataSourceType>Local</dataSourceType>'], [0, '</dataSource>']]));
        }
        var tag = into ? 'item' : 'dataSet';
        var body = [[0, '<' + tag + ' xsi:type="' + kind + '">'], [1, '<name>' + name + '</name>']];
        if (kind !== 'DataSetUnion') body.push([1, '<dataSource>' + encodeXml(source) + '</dataSource>']);
        if (kind === 'DataSetQuery') body.push([1, '<query></query>']);
        if (kind === 'DataSetObject') body.push([1, '<objectName>' + name + '</objectName>']);
        body.push([0, '</' + tag + '>']);
        ops.push(into ? insertChild(src, into.el, CHILD_ORDER.set, 'item', body) : insertOp(src, schema.el, CHILD_ORDER.schema, 'dataSet', body));
        /* A data source and a set land next to each other: one insert after the other. */
        if (ops.length === 2 && ops[0] && ops[1] && ops[0].start === ops[1].start) ops = [{ start: ops[0].start, end: ops[0].end, text: ops[0].text + ops[1].text }];
        op = combine(src, ops);
        id = 'set:' + (into ? target.slice(4) + '/' : pre) + name;
    } else if (what === 'variant') {
        var vtaken = {};
        model.variants.forEach(function (v) { vtaken[v.name] = 1; });
        if (!name) name = freeName('Вариант', vtaken);
        if (own(vtaken, name)) return { error: 'Вариант «' + name + '» уже есть' };
        var shown = String(values.presentation || '').trim() || name;
        /* The settings element declares the style namespaces its values may use, as every variant of the export does. */
        var first = model.variants.length ? own(src.owners, model.variants[0].id) : null;
        var settingsEl = first && firstChild(first.el, 'settings');
        var sr = settingsEl && src.pos.rec(settingsEl);
        var openTag = sr ? src.xml.slice(sr.start, sr.contentStart).replace(/\s*\/?>$/, '') : '<dcsset:settings xmlns:style="http://v8.1c.ru/8.1/data/ui/style" xmlns:sys="http://v8.1c.ru/8.1/data/ui/fonts/system" xmlns:web="http://v8.1c.ru/8.1/data/ui/colors/web" xmlns:win="http://v8.1c.ru/8.1/data/ui/colors/windows"';
        op = insertOp(src, schema.el, CHILD_ORDER.schema, 'settingsVariant', [[0, '<settingsVariant>'],
            [1, '<dcsset:name>' + encodeXml(name) + '</dcsset:name>']].concat(
            ruTitleLines('dcsset:presentation', shown).map(function (l) { return [l[0] + 1, l[1]]; }),
            [[1, openTag + '/>'], [0, '</settingsVariant>']]));
        id = 'variant:' + pre + model.variants.length;
    } else if (what === 'nested') {
        var ntaken = {};
        model.nested.forEach(function (n) { ntaken[n.name] = 1; });
        if (!name) name = freeName('ВложеннаяСхема', ntaken);
        if (!PATH_RE.test(name) || name.indexOf('.') >= 0) return { error: 'Имя — буквы, цифры и «_», не с цифры' };
        if (own(ntaken, name)) return { error: 'Вложенная схема «' + name + '» уже есть' };
        var nlines = [[0, '<nestedSchema>'], [1, '<name>' + name + '</name>']];
        var ntitle = String(values.title || '').trim();
        if (ntitle && !automaticTitle({ auto: name }, ntitle)) titleLines(ntitle).forEach(function (l) { nlines.push([l[0] + 1, l[1]]); });
        nlines.push([1, '<schema/>'], [0, '</nestedSchema>']);
        op = insertOp(src, schema.el, CHILD_ORDER.schema, 'nestedSchema', nlines);
        id = 'nested:' + pre + name;
    } else if (what === 'selectionFolder' || what === 'filterGroup') {
        var into2 = own(src.owners, target);
        var kind2 = what === 'selectionFolder' ? 'selection' : 'filter';
        if (!into2 || !(into2.kind === 'slist' && into2.tag === kind2 || into2.kind === 'sitem' && into2.list === kind2
            && xsiType(into2.el) === (kind2 === 'selection' ? 'SelectedItemFolder' : 'FilterItemGroup'))) return null;
        var box2 = into2.el;
        var pf = box2 ? childPrefix(src, box2, 'dcsset:') : prefixOf(tagOf(src, into2.parent)) || 'dcsset:';
        var lines2;
        if (what === 'selectionFolder') {
            var ftitle = String(values.title || '').trim() || 'Группа';
            lines2 = [[0, '<' + pf + 'item xsi:type="dcsset:SelectedItemFolder">'], [1, '<' + pf + 'lwsTitle>']].concat(ruItemLines(ftitle, 2),
                [[1, '</' + pf + 'lwsTitle>'], [1, '<' + pf + 'placement>' + (own(PLACEMENTS, values.placement || '') ? values.placement : 'Auto') + '</' + pf + 'placement>'],
                [0, '</' + pf + 'item>']]);
        } else {
            lines2 = [[0, '<' + pf + 'item xsi:type="dcsset:FilterItemGroup">'],
                [1, '<' + pf + 'groupType>' + (own(FILTER_GROUPS, values.groupType || '') ? values.groupType : 'AndGroup') + '</' + pf + 'groupType>'],
                [0, '</' + pf + 'item>']];
        }
        if (box2) {
            op = insertChild(src, box2, into2.kind === 'slist' ? SETTINGS_ORDER.list : orderOf(into2), 'item', lines2);
            id = target + (into2.kind === 'slist' ? ':' : '.') + kidsNamed(box2, 'item').length;
        } else {
            var lp2 = prefixOf(tagOf(src, into2.parent)) || 'dcsset:';
            op = insertChild(src, into2.parent, orderOf({ kind: 'snode', el: into2.parent }), into2.tag,
                [[0, '<' + lp2 + into2.tag + '>']].concat(lines2.map(function (l) { return [l[0] + 1, l[1]]; }), [[0, '</' + lp2 + into2.tag + '>']]));
            id = target + ':0';
        }
    } else if (what === 'selection' || what === 'order' || what === 'groupFields' || what === 'filter') {
        var list = own(src.owners, target);
        if (!list || (list.kind !== 'slist' && !(list.kind === 'sitem' && (list.list === 'selection' || list.list === 'filter')))) return null;
        if (!String(values.field || '').trim()) return { error: 'Выберите поле' };
        if (!PATH_RE.test(String(values.field).trim())) return { error: 'Поле — путь через точку' };
        var container = list.kind === 'slist' ? list.el : list.el;
        var p = container ? childPrefix(src, container, 'dcsset:') : prefixOf(tagOf(src, list.parent)) || 'dcsset:';
        if (container && list.kind === 'slist' && kidsNamed(container, 'item').length) p = prefixOf(tagOf(src, kidsNamed(container, 'item')[0]));
        var itemLines = settingsItemLines(what, values, p);
        if (!itemLines || itemLines.error) return itemLines;
        var count;
        if (container) {
            count = kidsNamed(container, 'item').length;
            op = insertChild(src, container, list.kind === 'slist' ? SETTINGS_ORDER.list : orderOf(list), 'item', itemLines);
            id = target + (list.kind === 'slist' ? ':' : '.') + count;
        } else {
            var nodeOwner = { kind: 'snode', el: list.parent };
            var lp = prefixOf(tagOf(src, list.parent)) || 'dcsset:';
            if (localName(list.parent) === 'settings' && !lp) lp = 'dcsset:';
            var wrapped = [[0, '<' + lp + list.tag + '>']].concat(itemLines.map(function (l) { return [l[0] + 1, l[1]]; }), [[0, '</' + lp + list.tag + '>']]);
            op = insertChild(src, list.parent, orderOf(nodeOwner), list.tag, wrapped);
            id = target + ':0';
        }
    } else if (what === 'group') {
        var node = own(src.owners, target);
        if (!node || node.kind !== 'snode') return null;
        var nodeType = localName(node.el) === 'settings' ? 'settings' : xsiType(node.el) || 'StructureItemGroup';
        var field = String(values.field || '').trim();
        if (field && !PATH_RE.test(field)) return { error: 'Поле — путь через точку' };
        var gp = childPrefix(src, node.el, 'dcsset:');
        var axes = { StructureItemTable: ['row', 'column'], StructureItemChart: ['point', 'series'] }[nodeType];
        if (axes) {
            /* A grouping of a table's rows or columns, of a chart's points or series. */
            var axis = axes.indexOf(values.axis) >= 0 ? values.axis : '';
            if (!axis) return { error: nodeType === 'StructureItemTable' ? 'Выберите строки или колонки таблицы' : 'Выберите точки или серии диаграммы' };
            var body = structureGroupLines(field, gp);
            body[0] = [0, '<' + gp + axis + '>'];
            body[body.length - 1] = [0, '</' + gp + axis + '>'];
            op = insertChild(src, node.el, orderOf(node), axis, body);
            id = target + '.' + axis + '.' + kidsNamed(node.el, axis).length;
        } else {
            if (nodeType !== 'settings' && nodeType !== 'StructureItemGroup') return { error: 'Элемент структуры добавляется в отчет или в группировку' };
            var sk = values.kind || 'group';
            var lines3;
            if (sk === 'table') lines3 = [[0, '<' + gp + 'item xsi:type="dcsset:StructureItemTable"/>']];
            else if (sk === 'chart') lines3 = [[0, '<' + gp + 'item xsi:type="dcsset:StructureItemChart"/>']];
            else if (sk === 'nested') {
                var obj = String(values.object || '').trim();
                if (!obj) return { error: 'Выберите вложенную схему' };
                lines3 = [[0, '<' + gp + 'item xsi:type="dcsset:StructureItemNestedObject">'], [1, '<' + gp + 'objectID>' + encodeXml(obj) + '</' + gp + 'objectID>'],
                    [1, '<' + gp + 'settings/>'], [0, '</' + gp + 'item>']];
            } else lines3 = structureGroupLines(field, gp);
            op = insertChild(src, node.el, orderOf(node), 'item', lines3);
            id = target + '.' + kidsNamed(node.el, 'item').length;
        }
    } else if (what === 'template') {
        return addTemplateEdit(model, values);
    } else return addEdit(model, what, target, values);
    if (!op) return null;
    if (op.error) return op;
    return withBom(model, op, id);
}

/* ------------------------------------------------------- settings values */

/* Properties of settings records the window edits: the use flag of any item
 * or grouping, a filter's comparison and value, an order's direction, a
 * grouping field's kind, a parameter value of a primitive type, a variant's
 * name and presentation. */
var GROUP_KINDS = { Items: 1, Hierarchy: 1, HierarchyOnly: 1 };

function settingsValue(model, id, prop) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    if (!owner || !owner.el) return null;
    var el = owner.el;
    var type = xsiType(el);
    if (owner.kind === 'variant') {
        if (prop === 'name') return exactText(src, firstChild(el, 'name'));
        if (prop === 'presentation') {
            var pr = firstChild(el, 'presentation');
            if (pr && xsiType(pr) === 'string') return exactText(src, pr);
            var it = ruItem(pr);
            return it ? exactText(src, firstChild(it, 'content')) : '';
        }
        return null;
    }
    if (owner.kind !== 'sitem' && owner.kind !== 'snode') return null;
    if (prop === 'use') {
        if (owner.kind === 'snode' && localName(el) === 'settings') return null;
        /* A nested object and a user field have no use flag in any export. */
        if (type === 'StructureItemNestedObject' || type === 'UserFieldExpression' || type === 'UserFieldCase') return null;
        return textOf(firstChild(el, 'use')) !== 'false';
    }
    if (owner.kind !== 'sitem') return null;
    if (prop === 'title' && (type === 'SelectedItemField' || type === 'SelectedItemFolder')) return localizedFrom(firstChild(el, 'lwsTitle'));
    if (prop === 'placement' && type === 'SelectedItemFolder') return textOf(firstChild(el, 'placement')) || 'Auto';
    if (prop === 'periodAdditionType' && type === 'GroupItemField') return textOf(firstChild(el, 'periodAdditionType')) || 'None';
    if ((prop === 'periodAdditionBegin' || prop === 'periodAdditionEnd') && type === 'GroupItemField') {
        var pa = firstChild(el, prop);
        if (!pa) return '';
        return xsiType(pa) === 'dateTime' ? (textOf(pa) === '0001-01-01T00:00:00' ? '' : dateText(textOf(pa))) : textOf(pa);
    }
    if (prop === 'orderType' && type === 'OrderItemField') return textOf(firstChild(el, 'orderType')) || 'Asc';
    if (prop === 'comparisonType' && type === 'FilterItemComparison') return textOf(firstChild(el, 'comparisonType'));
    if (prop === 'groupType' && type === 'GroupItemField') return textOf(firstChild(el, 'groupType')) || 'Items';
    if (prop === 'filterGroup' && type === 'FilterItemGroup') return textOf(firstChild(el, 'groupType'));
    if (prop === 'right' && type === 'FilterItemComparison') {
        var r = firstChild(el, 'right');
        if (!r) return '';
        var rt = xsiType(r);
        if (rt === 'Parameter') return '&' + textOf(r);
        if (rt === 'string') return exactText(src, r);
        if (rt === 'decimal' || rt === 'boolean' || rt === 'dateTime') return valueText(r, null);
        return null;
    }
    if (prop === 'value' && type === 'SettingsParameterValue') {
        var v = firstChild(el, 'value');
        if (!v || isNil(v)) return null;
        var vt = xsiType(v);
        if (vt === 'string') return exactText(src, v);
        if (vt === 'decimal' || vt === 'dateTime') return valueText(v, null);
        if (vt === 'boolean') return textOf(v) === 'true';
        if (vt === 'LocalStringType') { var ri = ruItem(v); return ri ? exactText(src, firstChild(ri, 'content')) : null; }
        return null;
    }
    return null;
}

/* The choices of a property that has a few: [{ value, title }]. */
function propertyChoices(model, id, prop) {
    if ((prop === 'sourceDataSet' || prop === 'destinationDataSet') && propertyValue(model, id, prop) !== null) {
        return linkSets(model, id).map(function (n) { return { value: n, title: n }; });
    }
    var map = prop === 'comparisonType' ? COMPARISON : prop === 'orderType' ? { Asc: 'По возрастанию', Desc: 'По убыванию' }
        : prop === 'placement' ? PLACEMENTS : prop === 'periodAdditionType' ? PERIOD_ADDITION
        : prop === 'groupType' ? GROUP_TYPES : prop === 'filterGroup' ? FILTER_GROUPS : prop === 'use' && /^param:/.test(id) ? PARAMETER_USE : null;
    if (!map || settingsValue(model, id, prop) === null && propertyValue(model, id, prop) === null) return null;
    return Object.keys(map).map(function (k) { return { value: k, title: map[k] }; });
}

/* Writes the Russian text of a localized child `tag` of a settings record:
 * the element made when missing, the Russian item taken away when emptied
 * (the whole element when it held nothing else). */
function localStringOp(src, owner, tag, value) {
    var text = String(value == null ? '' : value).replace(/\s*\n\s*/g, ' ');
    var el = owner.el;
    var t = firstChild(el, tag);
    var item = ruItem(t);
    var content = item && firstChild(item, 'content');
    if (content) {
        if (exactText(src, content) === text) return null;
        if (text) return textOp(src, content, text);
        return namedChildren(t, 'item').length > 1 ? removeOp(src, item) : removeChildOp(src, el, t);
    }
    if (!text) return null;
    var p = ownerPrefix(src, owner);
    if (!t) return insertChild(src, el, orderOf(owner), tag, [[0, '<' + p + tag + '>']].concat(ruItemLines(text, 1), [[0, '</' + p + tag + '>']]));
    var kids = t.children || [];
    if (kids.length) {
        var first = src.pos.rec(kids[0]);
        var ind = indentBefore(src.xml, first.start);
        return { start: first.start, end: first.start, text: fragment(ruItemLines(text, 0), ind, src.eol) + src.eol + ind };
    }
    var tr = src.pos.rec(t);
    var tind = indentBefore(src.xml, tr.start);
    return { start: tr.start, end: tr.close, text: fragment([[0, '<' + tr.tag + '>']].concat(ruItemLines(text, 1), [[0, '</' + tr.tag + '>']]), tind, src.eol) };
}

/* Writes a word into child `name` of a settings record, the element made when missing. */
function settingsScalarOp(src, owner, name, word, def) {
    var el = owner.el;
    var c = firstChild(el, name);
    if (def !== undefined && word === def) return c ? removeChildOp(src, el, c) : null;
    if (c) return textOf(c) === word ? null : textOp(src, c, word);
    var p = ownerPrefix(src, owner);
    return insertChild(src, el, orderOf(owner), name, [[0, '<' + p + name + '>' + word + '</' + p + name + '>']]);
}

function settingsEdit(model, id, prop, value) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    var current = settingsValue(model, id, prop);
    if (!owner || current === null) return null;
    if (current === value) return null;
    var el = owner.el;
    var op = null;
    if (prop === 'use') op = settingsScalarOp(src, owner, 'use', value ? 'true' : 'false', 'true');
    else if (prop === 'orderType') {
        if (value !== 'Asc' && value !== 'Desc') return { error: 'Недопустимое значение' };
        op = settingsScalarOp(src, owner, 'orderType', value);
    } else if (prop === 'comparisonType') {
        if (!own(COMPARISON, value)) return { error: 'Недопустимое значение' };
        op = settingsScalarOp(src, owner, 'comparisonType', value);
    } else if (prop === 'groupType') {
        if (!own(GROUP_KINDS, value)) return { error: 'Недопустимое значение' };
        op = settingsScalarOp(src, owner, 'groupType', value);
    } else if (prop === 'filterGroup') {
        if (!own(FILTER_GROUPS, value)) return { error: 'Недопустимое значение' };
        op = settingsScalarOp(src, owner, 'groupType', value);
    } else if (prop === 'placement') {
        if (!own(PLACEMENTS, value)) return { error: 'Недопустимое значение' };
        op = settingsScalarOp(src, owner, 'placement', value);
    } else if (prop === 'periodAdditionType') {
        if (!own(PERIOD_ADDITION, value)) return { error: 'Недопустимое значение' };
        op = settingsScalarOp(src, owner, 'periodAdditionType', value);
    } else if (prop === 'periodAdditionBegin' || prop === 'periodAdditionEnd') {
        /* A date, or a field: ПараметрыДанных.НачалоПериода. */
        var t = String(value == null ? '' : value).trim();
        var pp = ownerPrefix(src, owner);
        var xml;
        if (!t) xml = '<' + pp + prop + ' xsi:type="xs:dateTime">0001-01-01T00:00:00</' + pp + prop + '>';
        else if (/^\d/.test(t)) {
            var dw = valueWord({ kind: 'dateTime', dateOnly: false }, t);
            if (dw.error) return dw;
            xml = '<' + pp + prop + ' xsi:type="xs:dateTime">' + dw.word + '</' + pp + prop + '>';
        } else if (PATH_RE.test(t.replace(/^&/, 'ПараметрыДанных.'))) xml = '<' + pp + prop + ' xsi:type="dcscor:Field">' + encodeXml(t.replace(/^&/, 'ПараметрыДанных.')) + '</' + pp + prop + '>';
        else return { error: 'Дата ДД.ММ.ГГГГ или поле (ПараметрыДанных.НачалоПериода)' };
        var pe = firstChild(el, prop);
        if (pe) { var per = src.pos.rec(pe); op = src.xml.slice(per.start, per.close) === xml ? null : { start: per.start, end: per.close, text: xml }; }
        else op = insertChild(src, el, orderOf(owner), prop, [[0, xml]]);
    } else if (prop === 'title') {
        op = localStringOp(src, owner, 'lwsTitle', value);
    } else if (prop === 'right') {
        var r = firstChild(el, 'right');
        var p = r ? prefixOf(tagOf(src, r)) : ownerPrefix(src, owner);
        var keep = r ? xsiType(r) : '';
        var xml = filterValueXml(p, value, keep === 'string' || keep === 'decimal' || keep === 'boolean' || keep === 'dateTime' || keep === 'Parameter'
            ? (String(value).trim().charAt(0) === '&' ? 'Parameter' : keep === 'Parameter' ? '' : keep) : '');
        if (xml && xml.error) return xml;
        if (!xml) op = r ? removeOp(src, r) : null;
        else if (r) { var rr = src.pos.rec(r); op = { start: rr.start, end: rr.close, text: xml }; }
        else op = insertChild(src, el, orderOf(owner), 'right', [[0, xml]]);
    } else if (prop === 'value') {
        var v = firstChild(el, 'value');
        var vt = xsiType(v);
        if (vt === 'LocalStringType') {
            var ri = ruItem(v);
            var content = ri && firstChild(ri, 'content');
            op = content ? textOp(src, content, String(value)) : null;
        } else if (vt === 'boolean') op = textOp(src, v, value ? 'true' : 'false');
        else {
            var w = valueWord({ kind: vt, dateOnly: false }, value);
            if (w.error) return w;
            op = textOp(src, v, w.word);
        }
    } else if (prop === 'name' && owner.kind === 'variant') {
        var n = String(value || '').trim();
        if (!n) return { error: 'Укажите имя варианта' };
        if (kidsNamed(parentOf(src, el), 'settingsVariant').some(function (x) { return x !== el && textOf(firstChild(x, 'name')) === n; })) return { error: 'Вариант «' + n + '» уже есть' };
        op = textOp(src, firstChild(el, 'name'), n);
    } else if (prop === 'presentation' && owner.kind === 'variant') {
        var pres = firstChild(el, 'presentation');
        if (pres && xsiType(pres) === 'string') return withBom(model, textOp(src, pres, String(value == null ? '' : value)));
        var item = ruItem(pres);
        var cont = item && firstChild(item, 'content');
        var text = String(value == null ? '' : value).replace(/\s*\n\s*/g, ' ');
        if (!text && item) op = namedChildren(pres, 'item').length > 1 ? removeOp(src, item) : null;
        else if (cont) op = textOp(src, cont, text);
        else if (!pres) op = insertChild(src, el, SETTINGS_ORDER.variant, 'presentation', ruTitleLines(ownerPrefix(src, owner) + 'presentation', text));
        else if ((pres.children || []).length) {
            /* Other languages only: the Russian one goes first among them. */
            var first = src.pos.rec(pres.children[0]);
            var ind = indentBefore(src.xml, first.start);
            op = { start: first.start, end: first.start, text: fragment(ruItemLines(text, 0), ind, src.eol) + src.eol + ind };
        } else {
            var prr = src.pos.rec(pres);
            var pind = indentBefore(src.xml, prr.start);
            op = { start: prr.start, end: prr.close, text: fragment(ruTitleLines(prr.tag, text), pind, src.eol) };
        }
    }
    if (!op || op.error) return op;
    return withBom(model, op);
}

/* Any edit of the window by one action:
 *   { op: 'set', id, prop, value }  { op: 'add', what, target, values }
 *   { op: 'remove', id }  { op: 'move', id, dir }  { op: 'copy', id }  { op: 'type', id, text }
 *   { op: 'autofill', id, removeMissing } — the fields of a query set brought to its query (autoFillEdit)
 *   { op: 'objectFields', id, columns: [{ name, title, type }] } — an object set filled from the code's table (objectFieldsEdit)
 *   { op: 'groups', id, groups: [path | 'ОбщийИтог'] }  { op: 'order', id, list: [{ expression, orderType, autoOrder }] }
 *   { op: 'available', id, list: [{ value, presentation, keep }] }  { op: 'role', id, role: { dimension, periodNumber, ... } } */
function schemaEdit(model, action) {
    if (!action) return null;
    switch (action.op) {
        case 'set':
            return settingsValue(model, action.id, action.prop) !== null
                ? settingsEdit(model, action.id, action.prop, action.value)
                : propertyEdit(model, action.id, action.prop, action.value);
        case 'add': return addRecordEdit(model, action.what, action.target, action.values);
        case 'remove': return removeEdit(model, action.id);
        case 'move': return moveEdit(model, action.id, action.dir);
        case 'copy': return copyEdit(model, action.id);
        case 'type': return typeEdit(model, action.id, action.text);
        case 'groups': return groupsEdit(model, action.id, action.groups);
        case 'order': return orderEdit(model, action.id, action.list);
        case 'available': return availableEdit(model, action.id, action.list);
        case 'role': return roleEdit(model, action.id, action.role);
        case 'parameters': return parametersEdit(model, action.id, action.list, action.rows);
        case 'appearanceItem': return appearanceItemEdit(model, action.id, action.data);
        case 'userField': return userFieldEdit(model, action.id, action.data);
        case 'userSetting': return userSettingEdit(model, action.id, action.data);
        case 'paramValue': return paramValueEdit(model, action.id, action.data);
        case 'renameSet': return renameSetEdit(model, action.id, action.name);
        case 'templateParams': return templateParamsEdit(model, action.id, action.rows);
        case 'templateBinding': return templateBindingEdit(model, action.id, action.data);
        case 'cell': return cellEdit(model, action.id, action.data);
        case 'areaRow': return areaRowAddEdit(model, action.id, action.after == null ? -1 : action.after);
        case 'areaCell': return areaCellAddEdit(model, action.id);
        case 'autofill': var fill = autoFillEdit(model, action.id, { removeMissing: action.removeMissing }); return fill && fill.none ? null : fill;
        case 'objectFields': var of = objectFieldsEdit(model, action.id, action.columns); return of && of.none ? null : of;
    }
    return null;
}

function applySchemaEdit(xml, model, action) {
    var edit = schemaEdit(model, action);
    if (!edit || edit.error) return edit;
    return { xml: xml.slice(0, edit.start) + edit.text + xml.slice(edit.end), id: edit.id };
}

// ----------------------------------------------------------------- outline

function allSets(sets, depth, out) {
    for (var i = 0; i < sets.length; i++) {
        out.push({ set: sets[i], depth: depth });
        allSets(sets[i].items, depth + 1, out);
    }
    return out;
}

var PICTURES = {
    group: 'std-pictures/Papka.svg',
    set: 'std-pictures/NABOR.png',
    union: 'std-pictures/KonstruktorZaprosaGruppaVremennykhTablits.png',
    field: 'std-pictures/Rekvizit.png',
    folder: 'std-pictures/Papka.svg',
    dimension: 'std-pictures/Izmerenie.png',
    resource: 'std-pictures/Resurs.png',
    calculated: 'std-pictures/PolzovatelskiePolyaKomponovkiDannykh.png',
    parameter: 'std-pictures/ParametryDannykhKomponovkiDannykh.png',
    link: 'std-pictures/VlozhennayaTablitsa.png',
    template: 'std-pictures/NastroykaSpiska.png',
    nested: 'std-pictures/NovayaVlozhennayaSkhemaKomponovkiDannykh.png',
    variant: 'std-pictures/StandartnayaNastroykaKomponovkiDannykh.png',
    root: 'std-pictures/NastroykiOtcheta.png',
    groupNode: 'std-pictures/Gruppirovka.png',
    table: 'std-pictures/NovayaTablitsaKomponovkiDannykh.png',
    chart: 'std-pictures/NovayaDiagrammaKomponovkiDannykh.png',
    axis: 'std-pictures/PolyaGruppirovkiKomponovkiDannykh.png',
    nestedObject: 'std-pictures/NovayaVlozhennayaSkhemaKomponovkiDannykh.png'
};

function outline(model) {
    var out = [];
    if (!model) return out;
    function push(item) {
        item.type = 'form';
        item.itemKind = 'dcs';
        item.tag = 'Dcs' + item.pic;
        item.title = item.title || item.name;
        out.push(item);
        return item;
    }
    function group(id, title, count, line, tab) {
        return push({ id: id, name: title, pic: 'group', depth: 0, hasChildren: count > 0, line: line || 1, group: true, tab: tab });
    }
    var flat = allSets(model.sets, 1, []);
    group('tab:sets', 'Наборы данных', flat.length, flat.length ? flat[0].set.line : 1, 'sets');
    for (var i = 0; i < flat.length; i++) {
        var set = flat[i].set;
        push({ id: set.id, name: set.name, pic: set.kind === 'DataSetUnion' ? 'union' : 'set', depth: flat[i].depth,
            hasChildren: set.fields.length > 0 || set.items.length > 0, line: set.line, typeName: set.kindTitle, tab: 'sets' });
        /* A union's own members come right after it; its fields follow them
         * in the Designer too, but in the outline they stay with the set. */
        for (var f = 0; f < set.fields.length; f++) {
            var fld = set.fields[f];
            push({ id: fld.id, name: fld.dataPath,
                pic: fld.kind === 'folder' ? 'folder' : fld.role.indexOf('Измерение') >= 0 ? 'dimension' : 'field',
                depth: flat[i].depth + 1, hasChildren: false, line: fld.line, typeName: fld.type, tab: 'sets', setId: set.id,
                field: fld, setName: set.name });
        }
    }
    function simple(tab, title, list, pic, name) {
        if (!list.length) return;
        group('tab:' + tab, title, list.length, list[0].line, tab);
        for (var k = 0; k < list.length; k++) {
            push({ id: list[k].id, name: name(list[k]), pic: pic, depth: 1, hasChildren: false, line: list[k].line, tab: tab,
                record: list[k] });
        }
    }
    simple('links', 'Связи наборов данных', model.links, 'link', function (l) { return l.source + ' → ' + l.dest; });
    simple('calculated', 'Вычисляемые поля', model.calculated, 'calculated', function (c) { return c.dataPath; });
    simple('totals', 'Ресурсы', model.totals, 'resource', function (t) { return t.dataPath; });
    simple('parameters', 'Параметры', model.parameters, 'parameter', function (p) { return p.name; });
    simple('templates', 'Макеты', model.templates, 'template', function (t) { return t.title + (t.name ? ': ' + t.name : ''); });
    simple('nested', 'Вложенные схемы', model.nested, 'nested', function (n) { return n.name; });
    if (model.variants.length) {
        group('tab:settings', 'Варианты настроек', model.variants.length, model.variants[0].line, 'settings');
        for (var v = 0; v < model.variants.length; v++) {
            var variant = model.variants[v];
            push({ id: variant.id, name: variant.name, pic: 'variant', depth: 1, typeName: variant.presentation,
                hasChildren: !!(variant.root && variant.root.children.length), line: variant.line, tab: 'settings' });
            if (variant.root) nodeOutline(variant.root.children, 2);
        }
    }
    function nodeOutline(nodes, depth) {
        for (var n = 0; n < nodes.length; n++) {
            var node = nodes[n];
            push({ id: node.id, name: node.title, pic: node.kind === 'group' ? 'groupNode' : node.kind, depth: depth,
                hasChildren: node.children.length > 0, line: node.line, tab: 'settings' });
            nodeOutline(node.children, depth + 1);
        }
    }
    return out;
}

var RESTRICTION_TITLES = { field: 'Поле', condition: 'Условие', group: 'Группа', order: 'Упорядочивание' };

function restrictionText(r) {
    return ['field', 'condition', 'group', 'order'].filter(function (k) { return r[k]; })
        .map(function (k) { return RESTRICTION_TITLES[k]; }).join(', ');
}

function yes(on) {
    return on ? 'Да' : '';
}

/* The inspector of a calculated field, resource, parameter or link: the
 * columns of its row, the ones set in the schema. */
function recordInspector(entry) {
    var r = entry.record;
    var rows, name, kind;
    if (entry.tab === 'calculated') {
        name = r.title || r.dataPath;
        kind = 'Вычисляемое поле';
        rows = [['Путь к данным', r.dataPath], ['Выражение', r.expression], ['Заголовок', r.title], ['Тип значения', r.type],
            ['Ограничение доступности', restrictionText(r.restrict)], ['Выражение представления', r.presentation],
            ['Выражения упорядочивания', r.order], ['Доступные значения', r.available], ['Оформление', r.appearance],
            ['Параметры редактирования', r.editParameters]];
    } else if (entry.tab === 'totals') {
        name = r.title || r.dataPath;
        kind = 'Ресурс';
        rows = [['Поле', r.dataPath], ['Выражение', r.expression], ['Рассчитывать по', r.groups.join(', ')]];
    } else if (entry.tab === 'parameters') {
        name = r.title || r.name;
        kind = 'Параметр';
        rows = [['Имя', r.name], ['Заголовок', r.title], ['Тип', r.type], ['Значение', r.value], ['Выражение', r.expression],
            ['Доступен список значений', yes(r.valueList)], ['Включать в доступные поля', r.availableAsField ? '' : 'Нет'],
            ['Ограничение доступности', yes(r.restricted)], ['Запрещать незаполненные значения', yes(r.denyIncomplete)],
            ['Использование', r.use], ['Доступные значения', r.available], ['Параметр функциональной опции', r.functionalOption],
            ['Параметры редактирования', r.editParameters]];
    } else if (entry.tab === 'links') {
        name = r.source + ' → ' + r.dest;
        kind = 'Связь наборов данных';
        rows = [['Источник связи', r.source], ['Приемник связи', r.dest], ['Выражение источник', r.sourceExpr],
            ['Выражение приемник', r.destExpr], ['Параметр', r.parameter], ['Список параметров', yes(r.parameterList)],
            ['Условие связи', r.condition], ['Начальное значение связи', r.start], ['Обязательная связь', yes(r.required)]];
    } else return null;
    return {
        name: name, typeName: kind, heading: 'Свойства', groups: [],
        rows: rows.filter(function (x) { return x[1]; }).map(function (x) { return { label: x[0], value: x[1] }; })
    };
}

/* The property inspector of a data set field: the columns of its row in the
 * fields grid, the ones set in the schema. */
function inspector(entry) {
    if (entry && entry.record) return recordInspector(entry);
    var f = entry && entry.field;
    if (!f) return null;
    var folder = f.kind === 'folder';
    var rows = [
        { label: 'Путь', value: f.dataPath },
        { label: 'Поле', value: folder ? '' : f.field },
        { label: 'Заголовок', value: f.title || (folder ? '' : lastName(f.dataPath)) },
        { label: 'Тип значения', value: f.type },
        { label: 'Роль', value: f.role },
        { label: 'Ограничение поля', value: restrictionText(f.restrict) },
        { label: 'Ограничение реквизитов', value: restrictionText(f.attrRestrict) },
        { label: 'Выражение представления', value: f.presentation },
        { label: 'Выражения упорядочивания', value: f.order },
        { label: 'Проверка иерархии: набор данных', value: f.hierarchySet },
        { label: 'Проверка иерархии: параметр', value: f.hierarchyParameter },
        { label: 'Доступные значения', value: f.available },
        { label: 'Оформление', value: f.appearance },
        { label: 'Параметры редактирования', value: f.editParameters }
    ].filter(function (r) { return r.value; });
    return {
        name: f.title || f.dataPath,
        typeName: (folder ? 'Папка' : f.kind === 'nested' ? 'Вложенный набор данных' : 'Поле набора данных') +
            (entry.setName ? ' · ' + entry.setName : ''),
        heading: 'Свойства', rows: rows, groups: []
    };
}

function outlineIcon(it) {
    var asset = it && own(PICTURES, it.pic);
    return asset ? { cls: 'dcs-outline-icon', asset: asset } : { cls: 'icon-form-etc', icon: 'box' };
}

function outlineSortByName(items) {
    var md = root.MetadataPreview;
    return md && md.outlineSortByName ? md.outlineSortByName(items) : items;
}

function outlineHidden(items, index, collapsed) {
    if (!items || !collapsed || index < 0) return false;
    var d = items[index].depth || 0;
    for (var i = index - 1; i >= 0 && d > 0; i--) {
        var pd = items[i].depth || 0;
        if (pd < d) {
            if (items[i].id && collapsed[items[i].id]) return true;
            d = pd;
        }
    }
    return false;
}

function outlineExpandTo(items, id, collapsed) {
    if (!items || !id || !collapsed) return false;
    var idx = -1;
    for (var i = 0; i < items.length; i++) if (items[i].id === id) { idx = i; break; }
    if (idx < 0) return false;
    var d = items[idx].depth || 0;
    var changed = false;
    for (var j = idx - 1; j >= 0 && d > 0; j--) {
        var pd = items[j].depth || 0;
        if (pd < d) {
            if (items[j].id && collapsed[items[j].id]) { delete collapsed[items[j].id]; changed = true; }
            d = pd;
        }
    }
    return changed;
}

/* Sets keep their fields folded at start: a schema can have hundreds. */
function outlineCollapseAll(items, collapsed) {
    for (var k in collapsed) if (Object.prototype.hasOwnProperty.call(collapsed, k)) delete collapsed[k];
    for (var i = 0; items && i < items.length; i++) if (items[i].hasChildren && items[i].id) collapsed[items[i].id] = true;
    return collapsed;
}

function itemKey(it) {
    return it ? String(it.id || '') : '';
}

// ------------------------------------------------------------ view state

function initialViewState() {
    /* removeMissing: the autofill removes the fields its query lost (a flag over the query, off for each schema opened). */
    return { tab: 'sets', set: '', variant: 0, node: '', settingsTab: 'selection', template: '', selected: '', fieldsHeight: 0, scope: '', removeMissing: false };
}

var viewState = initialViewState();

function resetViewState() {
    viewState = initialViewState();
}

// ------------------------------------------------------------------- render

function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
}

function picture(key) {
    var img = el('img', 'dcs-pic');
    img.alt = '';
    img.src = PICTURES[key];
    return img;
}

/* A checkbox of the Designer's grids. `off` greys it out, as the Designer
 * shows a restriction that does not apply to the field. */
function check(on, off) {
    return el('span', 'dcs-check' + (on ? ' dcs-checked' : '') + (off ? ' dcs-check-off' : ''));
}

/* The command bars of the Designer. The window adds, copies and removes
 * nothing, so a bar with no working button is not drawn at all. */
var TOOLS = {
    add: ['std-pictures/DobavitElementSpiska.png', 'Добавить'],
    addMenu: ['std-pictures/DobavitElementSpiska.png', 'Добавить', true],
    copy: ['std-pictures/SkopirovatElementSpiska.png', 'Скопировать'],
    edit: ['std-pictures/IzmenitElementSpiska.png', 'Изменить'],
    folder: ['std-pictures/SozdatGruppu.png', 'Добавить папку'],
    group: ['std-pictures/SozdatGruppu.png', 'Добавить группу условий'],
    nested: ['std-pictures/NovayaVlozhennayaSkhemaKomponovkiDannykh.png', 'Добавить вложенный набор данных'],
    remove: ['std-pictures/UdalitElementSpiska.png', 'Удалить'],
    up: ['std-pictures/PeremestitVverkh.png', 'Переместить вверх'],
    down: ['std-pictures/PeremestitVniz.png', 'Переместить вниз'],
    user: ['std-pictures/Polzovatel.png', 'Свойства элемента пользовательских настроек'],
    rowAdd: ['std-pictures/DobavitElementSpiska.png', 'Добавить строку области'],
    cellAdd: ['std-pictures/SozdatGruppu.png', 'Добавить ячейку после выбранной'],
    cellRemove: ['std-pictures/UdalitElementSpiska.png', 'Удалить ячейку'],
    rowRemove: ['std-pictures/UdalitElementSpiska.png', 'Удалить строку области'],
    left: ['std-pictures/PeremestitVverkh.png', 'Сдвинуть ячейку влево'],
    right: ['std-pictures/PeremestitVniz.png', 'Сдвинуть ячейку вправо']
};

/* `actions` makes the named buttons work: { add: function (button) {...} }.
 * Returns null when no key of the bar has an action. */
function toolbar(keys, cls, actions) {
    var live = keys.filter(function (k) { return k !== '|' && actions && own(actions, k); });
    if (!live.length) return null;
    var bar = el('div', 'dcs-toolbar' + (cls ? ' ' + cls : ''));
    for (var i = 0; i < live.length; i++) {
        var t = TOOLS[live[i]];
        var act = own(actions, live[i]);
        var b = el('span', 'dcs-tool dcs-tool-active');
        b.title = t[1];
        var img = el('img', 'dcs-pic');
        img.alt = '';
        img.src = t[0];
        b.appendChild(img);
        if (act) b.addEventListener('click', (function (fn, button) { return function () { fn(button); }; })(act, b));
        bar.appendChild(b);
    }
    return bar;
}

/* Maps the cells of a table onto its columns, honouring colspan and rowspan:
 * `heads[i]` is the first header cell that covers column `i` alone and
 * `cells[i]` its body cells. A column hidden inside a span on every line has
 * no cell of its own and so gets no grip. */
function columnMap(table, count) {
    var taken = [];
    var heads = [];
    var cells = [];
    for (var i = 0; i < count; i++) { heads.push(null); cells.push([]); }
    var rows = [];
    for (var g = 0; g < table.children.length; g++) {
        var section = table.children[g];
        if (section.tagName !== 'THEAD' && section.tagName !== 'TBODY') continue;
        for (var q = 0; q < section.children.length; q++) rows.push(section.children[q]);
    }
    for (var r = 0; r < rows.length; r++) {
        if (!taken[r]) taken[r] = [];
        var line = rows[r].children;
        var c = 0;
        for (var k = 0; k < line.length; k++) {
            var cell = line[k];
            if (cell.tagName !== 'TH' && cell.tagName !== 'TD') continue;
            while (taken[r][c]) c++;
            var cs = cell.colSpan || 1;
            var rs = cell.rowSpan || 1;
            for (var dr = 0; dr < rs; dr++) {
                if (!taken[r + dr]) taken[r + dr] = [];
                for (var dc = 0; dc < cs; dc++) taken[r + dr][c + dc] = true;
            }
            if (cs === 1 && c < count) {
                if (cell.tagName === 'TH') { if (!heads[c]) heads[c] = cell; }
                else cells[c].push(cell);
            }
            c += cs;
        }
    }
    return { heads: heads, cells: cells };
}

var COLUMN_MIN = 24;

/* Lets the user drag the right edge of a header cell to widen a column, as
 * the Designer's grids do, so a cut value can be read in place and not only
 * in its tooltip; a double click fits the column to its widest value. */
function resizableColumns(table, colgroup) {
    var cols = [];
    for (var n = 0; n < colgroup.children.length; n++) cols.push(colgroup.children[n]);
    var map = columnMap(table, cols.length);

    function width(i) { return parseFloat(cols[i].style.width) || cols[i].offsetWidth || 100; }
    function apply(i, px) {
        cols[i].style.width = Math.max(COLUMN_MIN, Math.round(px)) + 'px';
        var total = 0;
        for (var j = 0; j < cols.length; j++) total += width(j);
        table.style.width = total + 'px';
    }
    /* The cells cut their text, so `scrollWidth` is what the value asks for;
     * the borders of the cell are added back on top of it. */
    function fit(i) {
        var list = map.cells[i].slice();
        if (map.heads[i]) list.push(map.heads[i]);
        var want = COLUMN_MIN;
        for (var j = 0; j < list.length; j++) {
            var cell = list[j];
            var frame = cell.offsetWidth - cell.clientWidth;
            want = Math.max(want, cell.scrollWidth + frame + 5);
        }
        apply(i, want);
    }

    for (var i = 0; i < cols.length; i++) {
        var th = map.heads[i];
        if (!th) continue;
        var grip = el('span', 'dcs-col-grip');
        grip.title = 'Перетащите, чтобы изменить ширину столбца; двойной щелчок — по содержимому';
        th.appendChild(grip);
        bindGrip(grip, i);
    }

    function bindGrip(grip, index) {
        var start = 0;
        var from = 0;
        function move(e) { apply(index, from + (e.clientX - start)); }
        function stop(e) {
            grip.classList.remove('dcs-dragging');
            document.removeEventListener('pointermove', move, true);
            document.removeEventListener('pointerup', stop, true);
            if (grip.releasePointerCapture && e.pointerId != null) {
                try { grip.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
            }
        }
        grip.addEventListener('pointerdown', function (e) {
            if (e.button) return;
            e.preventDefault();
            e.stopPropagation();
            start = e.clientX;
            from = width(index);
            grip.classList.add('dcs-dragging');
            if (grip.setPointerCapture) { try { grip.setPointerCapture(e.pointerId); } catch (err) { /* no capture */ } }
            document.addEventListener('pointermove', move, true);
            document.addEventListener('pointerup', stop, true);
        });
        grip.addEventListener('click', function (e) { e.stopPropagation(); });
        grip.addEventListener('dblclick', function (e) {
            e.preventDefault();
            e.stopPropagation();
            fit(index);
        });
    }
}

/* A grid with the Designer's look. A column is { title, width, get(row) ->
 * string | Node }; `options.lead` adds the narrow column of the use checkbox
 * that leads the settings grids. */
function grid(columns, rows, options) {
    options = options || {};
    if (options.lead) {
        columns = [{ title: '', width: 22, lead: true, get: function (r) {
            return r.root ? '' : options.leadCheck ? options.leadCheck(r) : check(r.use);
        } }].concat(columns);
    }
    var wrap = el('div', 'dcs-grid' + (options.cls ? ' ' + options.cls : ''));
    var table = el('table');
    var colgroup = el('colgroup');
    var head = el('tr', 'dcs-head');
    /* The columns keep their widths and share what is left of the window,
     * as the Designer's grids do; a long title is cut, not the column grown. */
    var total = 0;
    for (var c = 0; c < columns.length; c++) {
        var col = el('col');
        total += columns[c].width || 100;
        col.style.width = (columns[c].width || 100) + 'px';
        colgroup.appendChild(col);
        var th = el('th', '', columns[c].title);
        if (columns[c].title) th.title = columns[c].hint || columns[c].title;
        head.appendChild(th);
    }
    table.style.width = total + 'px';
    table.appendChild(colgroup);
    var thead = el('thead');
    thead.appendChild(head);
    table.appendChild(thead);
    var body = el('tbody');
    var first = options.lead ? 1 : 0;
    for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        var tr = el('tr', 'dcs-row' + (row.use === false ? ' dcs-unused' : '') + (row.root ? ' dcs-root-row' : ''));
        if (row.id) tr.setAttribute('data-id', row.id);
        for (var k = 0; k < columns.length; k++) {
            var td = el('td', columns[k].lead ? 'dcs-lead' : '');
            var v = columns[k].get(row);
            if (k === first && row.depth) td.style.paddingLeft = (4 + row.depth * 16) + 'px';
            if (v && typeof v === 'object' && v.nodeType) td.appendChild(v);
            else {
                td.textContent = v == null ? '' : String(v);
                if (v) td.title = String(v);
            }
            tr.appendChild(td);
        }
        body.appendChild(tr);
    }
    table.appendChild(body);
    wrap.appendChild(table);
    resizableColumns(table, colgroup);
    if (!rows.length && options.empty) wrap.appendChild(el('div', 'dcs-grid-empty', options.empty));
    return wrap;
}

/* A grid whose header and records span several lines, like the fields of a
 * data set: `head` is a list of header lines of { title, cs, rs } cells and
 * `cells(record)` gives the record's lines of { v, cs, rs, cls } cells. Each
 * record is a tbody of its own, so selecting it marks all its lines. */
function stackedGrid(widths, head, records, cells, options) {
    options = options || {};
    var wrap = el('div', 'dcs-grid dcs-stacked' + (options.cls ? ' ' + options.cls : ''));
    var table = el('table');
    var colgroup = el('colgroup');
    var total = 0;
    for (var c = 0; c < widths.length; c++) {
        var col = el('col');
        col.style.width = widths[c] + 'px';
        total += widths[c];
        colgroup.appendChild(col);
    }
    table.style.width = total + 'px';
    table.appendChild(colgroup);
    var thead = el('thead');
    for (var h = 0; h < head.length; h++) {
        var tr = el('tr', 'dcs-head');
        for (var k = 0; k < head[h].length; k++) {
            var cell = head[h][k];
            var th = el('th', '', cell.title || '');
            if (cell.cs) th.colSpan = cell.cs;
            if (cell.rs) th.rowSpan = cell.rs;
            if (cell.title) th.title = cell.hint || cell.title;
            /* Sticky cells keep their own line of the header in place. */
            th.style.top = (h * 21) + 'px';
            tr.appendChild(th);
        }
        thead.appendChild(tr);
    }
    table.appendChild(thead);
    for (var r = 0; r < records.length; r++) {
        var body = el('tbody', 'dcs-record' + (records[r].use === false ? ' dcs-unused' : ''));
        if (records[r].id) body.setAttribute('data-id', records[r].id);
        var lines = cells(records[r]);
        for (var l = 0; l < lines.length; l++) {
            var line = el('tr', 'dcs-row');
            for (var j = 0; j < lines[l].length; j++) {
                var d = lines[l][j];
                var td = el('td', d.cls || '');
                if (d.cs) td.colSpan = d.cs;
                if (d.rs) td.rowSpan = d.rs;
                var v = d.v;
                if (v && typeof v === 'object' && v.nodeType) td.appendChild(v);
                else {
                    td.textContent = v == null ? '' : String(v);
                    if (v) td.title = String(v);
                }
                line.appendChild(td);
            }
            body.appendChild(line);
        }
        table.appendChild(body);
    }
    wrap.appendChild(table);
    resizableColumns(table, colgroup);
    if (!records.length && options.empty) wrap.appendChild(el('div', 'dcs-grid-empty', options.empty));
    return wrap;
}

function restrictCells(r, off) {
    return ['field', 'condition', 'group', 'order'].map(function (k) {
        return { v: check(off || r[k], off), cls: 'dcs-center' };
    });
}

/* The tree mark of a row: a dash for a leaf, a circle with a sign for a node
 * that has children. */
function treeMark(kind) {
    return el('span', 'dcs-mark dcs-mark-' + kind);
}

function withIcon(key, text) {
    var span = el('span', 'dcs-cell-icon');
    if (key) span.appendChild(picture(key));
    span.appendChild(el('span', '', text));
    return span;
}

function lastName(path) {
    path = String(path || '');
    return path.slice(path.lastIndexOf('.') + 1);
}

/* The fields a settings page offers: every field of the data sets and the
 * calculated fields, an attribute under its owner when the owner is there. */
function availableFields(model, records) {
    var byPath = {};
    var order = [];
    function add(path, folder, title, type) {
        if (!path || own(byPath, path)) return;
        byPath[path] = { path: path, folder: folder, title: title || lastName(path), type: type || '', children: [] };
        order.push(byPath[path]);
    }
    if (records) records.forEach(function (f) { add(f.dataPath, f.kind === 'folder', f.title, f.type); });
    else {
        allSets(model.sets, 0, []).forEach(function (x) {
            x.set.fields.forEach(function (f) { add(f.dataPath, f.kind === 'folder', f.title, f.type); });
        });
        model.calculated.forEach(function (c) { add(c.dataPath, false, c.title, c.type); });
    }
    var roots = [];
    order.forEach(function (n) {
        var dot = n.path.lastIndexOf('.');
        var parent = dot > 0 ? own(byPath, n.path.slice(0, dot)) : '';
        if (parent) parent.children.push(n);
        else roots.push(n);
    });
    return roots;
}

/* Which properties hold an expression of the expression language, and in
 * what context the platform computes it (DcsExpr). */
var EXPRESSION_CONTEXTS = {
    total: { expression: 'resource' },
    calc: { expression: 'calculated', presentationExpression: 'presentation', orderExpression: 'order' },
    field: { presentationExpression: 'presentation', orderExpression: 'order' },
    param: { expression: 'parameter' },
    link: { sourceExpression: 'link', destinationExpression: 'link', startExpression: 'link', linkConditionExpression: 'link' }
};

var EXPRESSION_TITLES = {
    resource: 'Выражение ресурса', calculated: 'Выражение вычисляемого поля', presentation: 'Выражение представления',
    parameter: 'Выражение параметра', link: 'Выражение связи', order: 'Выражение упорядочивания'
};

/* What the expression editor needs to know about the expression of record
 * `id`, property `prop`: { context, fields, parameters, title }, null for a
 * property that holds no expression. A link's source expression sees the
 * fields of its source set, its destination expression those of the
 * destination; a parameter's expression sees the other parameters only. */
function expressionEnv(model, id, prop) {
    var src = model && model.source;
    var owner = src && own(src.owners, id);
    var context = owner ? own(EXPRESSION_CONTEXTS[owner.kind] || {}, prop) : '';
    if (!context) return null;
    var fields;
    var name = '';
    if (owner.kind === 'link') {
        var link = model.links.filter(function (l) { return l.id === id; })[0];
        var setName = link ? (prop === 'destinationExpression' ? link.dest : link.source) : '';
        var set = allSets(model.sets, 0, []).filter(function (x) { return x.set.name === setName; })[0];
        fields = set ? availableFields(model, set.set.fields) : availableFields(model);
        name = link ? link.source + ' → ' + link.dest : '';
    } else if (owner.kind === 'param') {
        fields = [];
        name = owner.auto;
    } else {
        fields = availableFields(model);
        name = owner.auto || textOf(firstChild(owner.el, 'dataPath'));
    }
    var parameters = model.parameters.filter(function (p) { return p.id !== id; }).map(function (p) {
        return { name: p.name, title: p.title, type: p.type };
    });
    return {
        context: context, fields: fields, parameters: parameters,
        title: (EXPRESSION_TITLES[context] || 'Выражение') + (name ? ' «' + name + '»' : '')
    };
}

/* The env of an expression of the settings (a user field's detail or total
 * expression): every field of the schema, the parameters. */
function settingsEnv(model, context, title) {
    return {
        context: context, fields: availableFields(model), title: title,
        parameters: model.parameters.map(function (p) { return { name: p.name, title: p.title, type: p.type }; })
    };
}

/* Tokens of the 1C query language, just enough to colour a read-only query
 * where no code editor is available. */
var QUERY_WORDS = ('ВЫБРАТЬ РАЗРЕШЕННЫЕ РАЗЛИЧНЫЕ ПЕРВЫЕ КАК ИЗ ГДЕ И ИЛИ НЕ ЕСТЬ NULL ЛЕВОЕ ПРАВОЕ ПОЛНОЕ ВНУТРЕННЕЕ ' +
    'СОЕДИНЕНИЕ ПО СГРУППИРОВАТЬ УПОРЯДОЧИТЬ ИМЕЮЩИЕ ОБЪЕДИНИТЬ ВСЕ ПОМЕСТИТЬ УНИЧТОЖИТЬ ИНДЕКСИРОВАТЬ ВЫБОР ' +
    'КОГДА ТОГДА ИНАЧЕ КОНЕЦ МЕЖДУ В ИЕРАРХИИ ПОДОБНО УБЫВ ВОЗР ИТОГИ ОБЩИЕ ДЛЯ ИЗМЕНЕНИЯ ССЫЛКА ИСТИНА ЛОЖЬ ' +
    'НЕОПРЕДЕЛЕНО АВТОУПОРЯДОЧИВАНИЕ ПЕРИОДАМИ ХАРАКТЕРИСТИКИ ' +
    'SELECT ALLOWED DISTINCT TOP AS FROM WHERE AND OR NOT IS LEFT RIGHT FULL INNER JOIN ON GROUP BY ORDER ' +
    'HAVING UNION ALL INTO DROP INDEX CASE WHEN THEN ELSE END BETWEEN IN HIERARCHY LIKE DESC ASC TOTALS OVERALL ' +
    'FOR UPDATE REFS TRUE FALSE UNDEFINED').split(' ');
var QUERY_WORD_SET = {};
for (var qw = 0; qw < QUERY_WORDS.length; qw++) QUERY_WORD_SET[QUERY_WORDS[qw]] = true;

function highlightQuery(text) {
    var pre = el('pre', 'dcs-query-text');
    var re = /(\/\/[^\n]*)|("(?:[^"]|"")*"?)|(&[\wА-Яа-яЁё]+)|(\{[^}\n]*\}?)|(\d+(?:\.\d+)?)|([\wА-Яа-яЁё]+)|([\s\S])/g;
    var m;
    var plain = '';
    function flush() {
        if (plain) pre.appendChild(document.createTextNode(plain));
        plain = '';
    }
    function tok(cls, s) {
        flush();
        pre.appendChild(el('span', cls, s));
    }
    while ((m = re.exec(text))) {
        if (m[1]) tok('dcs-q-comment', m[1]);
        else if (m[2]) tok('dcs-q-string', m[2]);
        else if (m[3]) tok('dcs-q-param', m[3]);
        else if (m[4]) tok('dcs-q-brace', m[4]);
        else if (m[5]) tok('dcs-q-number', m[5]);
        else if (m[6] && own(QUERY_WORD_SET, m[6].toUpperCase())) tok('dcs-q-keyword', m[6]);
        else plain += m[0];
    }
    flush();
    return pre;
}

function render(model, container, options) {
    options = options || {};
    /* A semantic diff can annotate the ordinary Designer-like window without
     * forking its renderer. Removed rows use `beforeId` when the left model is
     * shown; current rows use `entityId`. */
    var diffKinds = {};
    var diffCounts = {};
    (options.diffEntries || []).forEach(function (entry) {
        var ids = [entry.entityId, entry.beforeId];
        for (var di = 0; di < ids.length; di++) if (ids[di]) diffKinds[ids[di]] = entry.kind || 'changed';
        if (entry.tab) diffCounts[entry.tab] = (diffCounts[entry.tab] || 0) + 1;
    });
    if (container._dcsDispose) { container._dcsDispose(); container._dcsDispose = null; }
    /* A window drawn over this one retires it before the old editor's blur. */
    if (container._dcsRetire) container._dcsRetire();
    var alive = true;
    container._dcsRetire = function () { alive = false; };
    container.innerHTML = '';
    container.className = 'dcs-root';
    if (!model) {
        container.appendChild(el('div', 'dcs-empty', 'Нет схемы компоновки данных'));
        return;
    }
    /* An open nested schema is drawn as a window of its own over the same
     * source: `rootModel` is the whole schema, `model` the one shown. */
    var rootModel = model;
    if (viewState.scope) {
        var scoped = scopeModel(model, viewState.scope);
        if (scoped) model = scoped;
        else viewState.scope = '';
    }
    var scope = model.prefix || '';
    var disposers = [];
    container._dcsDispose = function () {
        for (var i = 0; i < disposers.length; i++) { try { disposers[i](); } catch (e) { /* ignore */ } }
        disposers = [];
    };
    var win = el('div', 'dcs-window');
    var caption = el('div', 'dcs-caption');
    var m = /[\\\/]Templates[\\\/]([^\\\/]+)[\\\/]Ext[\\\/]Template\.xml$/i.exec(options.filePath || '');
    var rootTitle = options.windowTitle || (m ? m[1] : 'Схема компоновки данных');
    if (!scope) caption.textContent = rootTitle;
    else {
        /* The path to the open nested schema; each step opens its schema. */
        var parts = scope.replace(/\/$/, '').split('/');
        var crumb = function (text, prefix) {
            var c = el('span', 'dcs-crumb', text);
            c.title = 'Открыть схему';
            c.addEventListener('click', function () { openScope(prefix); });
            return c;
        };
        caption.appendChild(crumb(rootTitle, ''));
        parts.forEach(function (name, i) {
            caption.appendChild(el('span', 'dcs-crumb-sep', ' › '));
            if (i === parts.length - 1) caption.appendChild(el('span', 'dcs-crumb-current', 'Вложенная схема «' + name + '»'));
            else caption.appendChild(crumb(name, parts.slice(0, i + 1).join('/') + '/'));
        });
    }
    win.appendChild(caption);

    /* Opens the nested schema `prefix` ('' — the schema itself) in this window. */
    function openScope(prefix) {
        if (!alive) return;
        viewState.scope = prefix;
        viewState.set = '';
        viewState.template = '';
        viewState.variant = 0;
        viewState.node = '';
        viewState.selected = '';
        render(rootModel, container, options);
    }
    var strip = el('div', 'dcs-tabs');
    var page = el('div', 'dcs-page');
    win.appendChild(strip);
    win.appendChild(page);
    container.appendChild(win);

    var tabButtons = {};
    var tabs = filledTabs(model, !!options.onSchemaEdit);
    if (!tabs.some(function (t) { return t.id === viewState.tab; })) viewState.tab = tabs[0].id;
    tabs.forEach(function (tab) {
        var b = el('div', 'dcs-tab', tab.title);
        b.setAttribute('data-tab', tab.id);
        if (diffCounts[tab.id]) b.appendChild(el('span', 'dcs-diff-count', String(diffCounts[tab.id])));
        b.addEventListener('click', function () { showTab(tab.id); });
        strip.appendChild(b);
        tabButtons[tab.id] = b;
    });

    var rowsById = {};

    /* The host is told the line too: a settings item has no outline row of its own. */
    function notify(id) {
        if (!options.onSelect || !id) return;
        var src = model.source;
        var owner = src && own(src.owners, id);
        var line = owner && owner.el ? src.pos.line(owner.el) : 0;
        options.onSelect(line ? { id: id, line: line } : { id: id });
    }

    function markSelected(id) {
        viewState.selected = id || '';
        var old = page.querySelectorAll('.dcs-selected');
        for (var i = 0; i < old.length; i++) old[i].classList.remove('dcs-selected');
        var row = id && (rowsById[id] || (page.querySelector && page.querySelector('[data-id="' + cssEscape(id) + '"]')));
        if (row) {
            row.classList.add('dcs-selected');
            if (row.scrollIntoView) { try { row.scrollIntoView({ block: 'nearest' }); } catch (e) { row.scrollIntoView(); } }
        }
        return row || null;
    }

    function collectRows(scope) {
        var rows = scope.querySelectorAll('[data-id]');
        for (var i = 0; i < rows.length; i++) {
            var rowId = rows[i].getAttribute('data-id');
            rowsById[rowId] = rows[i];
            if (diffKinds[rowId]) rows[i].classList.add('dcs-diff-' + diffKinds[rowId]);
        }
        /* The page outlives its redraws: one listener serves them all. */
        if (scope._dcsRowClicks) return;
        scope._dcsRowClicks = true;
        scope.addEventListener('click', function (e) {
            var row = e.target.closest && e.target.closest('[data-id]');
            if (!row || !scope.contains(row)) return;
            var id = row.getAttribute('data-id');
            markSelected(id);
            notify(id);
        });
    }

    /* Set while a page is drawn: an editor losing focus because its page goes
     * away must not write into the source in the middle of it. */
    var drawing = false;

    /* viewState общий для всех окон СКД, а у сравнения их два: какая вкладка
     * открыта в этом окне, помним отдельно. */
    var shownTab = null;
    function showTab(id) {
        container._dcsDispose();
        if (!tabButtons[id]) id = tabs[0].id;
        viewState.tab = id;
        shownTab = id;
        for (var k in tabButtons) {
            if (Object.prototype.hasOwnProperty.call(tabButtons, k)) tabButtons[k].classList.toggle('dcs-tab-active', k === id);
        }
        drawing = true;
        try {
            page.innerHTML = '';
            rowsById = {};
            var draw = PAGES[id];
            if (draw) draw();
        } finally {
            drawing = false;
        }
    }

    function label(text) {
        return el('div', 'dcs-label', text);
    }

    function row(cls) {
        var r = el('div', 'dcs-line' + (cls ? ' ' + cls : ''));
        for (var i = 1; i < arguments.length; i++) if (arguments[i]) r.appendChild(arguments[i]);
        return r;
    }

    function checkLabel(on, text, id, prop) {
        var span = el('span', 'dcs-check-label');
        span.appendChild(el('span', '', text));
        span.appendChild(id ? editCheck(id, prop, on) : check(on));
        return span;
    }

    // ------------------------------------------------------------ editing

    /* Properties a host lets the user change (options.onPropertyEdit): a text
     * cell opens an editor in place on double click, a checkbox flips on click.
     * The host writes each change into the source as one undoable edit and
     * hands the new source back; the window then redraws from it. */
    var editable = !!options.onPropertyEdit;

    /* The value a cell edits: a settings property, a parameter's type or a
     * property of the schema's own records. */
    function valueOf(id, prop) {
        if (prop === 'orderExpressions') { var ol = orderList(model, id); return ol ? orderText(own(model.source.owners, id).el) : null; }
        if (prop === 'availableValues') { var al = availableList(model, id); return al ? availableText(own(model.source.owners, id).el) : null; }
        if (prop === 'role') return roleOf(model, id) ? roleText(firstChild(own(model.source.owners, id).el, 'role')) : null;
        if (prop === 'appearance' || prop === 'inputParameters') {
            return parameterRows(model, id, prop) ? parameterNames(firstChild(own(model.source.owners, id).el, prop)) : null;
        }
        if (prop === 'paramValue') {
            var pv = paramValueOf(model, id);
            return pv ? paramValueText(pv) : null;
        }
        if (prop === 'groups') {
            var gs = totalGroups(model, id);
            return gs ? gs.join(', ') : null;
        }
        if (prop === 'type') {
            var owner = model.source && own(model.source.owners, id);
            if (!owner || !own(TYPED, owner.kind)) return null;
            if (owner.kind === 'field' && xsiType(owner.el) !== 'DataSetFieldField') return null;
            var vt = firstChild(owner.el, 'valueType');
            if (vt && (firstChild(vt, 'TypeSet') || firstChild(vt, 'TypeId'))) return null;
            return typePresentation(vt);
        }
        var v = settingsValue(model, id, prop);
        return v !== null ? v : propertyValue(model, id, prop);
    }

    function canEdit(id, prop) {
        return editable && valueOf(id, prop) !== null;
    }

    function editText(id, prop, shown, cls) {
        var text = shown == null ? '' : String(shown);
        var span = el('span', 'dcs-cell-text' + (cls ? ' ' + cls : ''), text);
        if (canEdit(id, prop)) {
            span.classList.add('dcs-editable');
            span.setAttribute('data-edit', id);
            span.setAttribute('data-prop', prop);
            span.title = (text ? text + '\n\n' : '') + 'Двойной щелчок — изменить';
        } else if (text) span.title = text;
        return span;
    }

    function editCheck(id, prop, on, off) {
        var c = check(on, off);
        if (!off && canEdit(id, prop)) {
            c.classList.add('dcs-editable');
            c.setAttribute('data-edit', id);
            c.setAttribute('data-prop', prop);
            c.title = 'Щелчок — изменить';
        }
        return c;
    }

    function editRestrict(id, base, r, off) {
        return ['field', 'condition', 'group', 'order'].map(function (k) {
            return { v: editCheck(id, base + '.' + k, !off && r[k], off), cls: 'dcs-center' };
        });
    }

    function commit(id, prop, value) {
        if (!alive) return null;
        if (prop === 'type') return act({ op: 'type', id: id, text: value });
        var res = options.onPropertyEdit(id, prop, value);
        if (res && res.source != null) reload(res.source);
        return res || null;
    }

    /* A change of the schema's structure through the host (options.onSchemaEdit):
     * one undoable edit, the window redrawn and the new record selected. An
     * error the host hands back is shown in the window's status line. */
    function act(action) {
        if (!alive || !options.onSchemaEdit) return null;
        var res = options.onSchemaEdit(function (fresh) { return schemaEdit(scopeModel(fresh, scope) || fresh, action); });
        if (!res) return null;
        if (res.error) {
            if (action.op !== 'add' && action.op !== 'type') flash(res.error);
            return res;
        }
        if (res.source != null) reload(res.source);
        var id = res.id || (action.op === 'remove' ? '' : action.id);
        if (action.op === 'remove') viewState.selected = '';
        if (id) {
            viewState.selected = id;
            markSelected(id);
            notify(id);
        }
        return res;
    }

    var status = el('div', 'dcs-status');
    var statusTimer = null;
    function flash(text, ms) {
        status.textContent = text;
        status.classList.add('dcs-status-on');
        if (statusTimer) clearTimeout(statusTimer);
        statusTimer = setTimeout(function () { status.classList.remove('dcs-status-on'); }, ms || 4000);
    }
    win.appendChild(status);

    /* The selected record when it is one of `prefix`'s (a list id, a tab). */
    function selectedIn(test) {
        var id = viewState.selected;
        return id && test(id) && own(model.source.owners, id) ? id : '';
    }

    /* Remove, up and down act on the selection; `test` tells whose it is. */
    function listActions(test, extra) {
        var actions = {
            remove: function () { var id = selectedIn(test); if (id) act({ op: 'remove', id: id }); else flash('Выберите строку'); },
            up: function () { var id = selectedIn(test); if (id) act({ op: 'move', id: id, dir: -1 }); },
            down: function () { var id = selectedIn(test); if (id) act({ op: 'move', id: id, dir: 1 }); },
            copy: function () { var id = selectedIn(test); if (id) act({ op: 'copy', id: id }); else flash('Выберите строку'); }
        };
        for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) actions[k] = extra[k];
        return adding ? actions : null;
    }

    /* Redraws the open page from the edited source, where it was scrolled. */
    function reload(source) {
        var parsed = parse(source);
        if (!parsed.model) return;
        var boxes = page.querySelectorAll('.dcs-grid, .dcs-tree');
        var scrolls = [];
        for (var i = 0; i < boxes.length; i++) scrolls.push([boxes[i].scrollTop, boxes[i].scrollLeft]);
        rootModel = parsed.model;
        /* A renamed or removed nested schema leaves for the one above it. */
        var shown = scopeModel(parsed.model, scope);
        if (!shown) { openScope(''); return; }
        model = shown;
        flat = allSets(model.sets, 0, []);
        fieldTree = availableFields(model);
        resourcePaths = {};
        model.totals.forEach(function (t) { if (t.dataPath) resourcePaths[t.dataPath] = true; });
        showTab(viewState.tab);
        boxes = page.querySelectorAll('.dcs-grid, .dcs-tree');
        for (var k = 0; k < boxes.length && k < scrolls.length; k++) {
            boxes[k].scrollTop = scrolls[k][0];
            boxes[k].scrollLeft = scrolls[k][1];
        }
        var row = viewState.selected && rowsById[viewState.selected];
        if (row) row.classList.add('dcs-selected');
    }

    function openEditor(span) {
        var id = span.getAttribute('data-edit');
        var prop = span.getAttribute('data-prop');
        var current = valueOf(id, prop);
        if (typeof current === 'boolean') { commit(id, prop, !current); return; }
        if (typeof current !== 'string') return;
        /* A choice of two flips at once, like a checkbox. */
        if (prop === 'use') { commit(id, prop, current === 'Always' ? 'Auto' : 'Always'); return; }
        var sv = prop === 'value' ? paramRecord(id) : null;
        if (sv && sv.kind === 'boolean') { commit(id, prop, current === 'Да' ? 'Нет' : 'Да'); return; }
        var cell = span.parentNode;
        if (prop === 'groups') { openGroups(span, id); return; }
        if (prop === 'paramValue') { openParamValue(id); return; }
        if (prop === 'orderExpressions') { openOrder(id); return; }
        if (prop === 'availableValues') { openAvailable(id); return; }
        if (prop === 'role') { openRole(id); return; }
        if (prop === 'appearance' || prop === 'inputParameters') { openParameters(id, prop); return; }
        var choices = propertyChoices(model, id, prop);
        if (choices) { openChoice(span, cell, id, prop, current, choices); return; }
        if (options.expressionEditor && openExpression(span, cell, id, prop, current)) return;
        var box = el('textarea', 'dcs-cell-editor');
        box.value = current;
        box.spellcheck = false;
        box.rows = Math.min(10, Math.max(1, current.split('\n').length));
        var message = el('div', 'dcs-cell-message');
        span.style.display = 'none';
        cell.classList.add('dcs-editing');
        cell.appendChild(box);
        cell.appendChild(message);
        box.focus();
        box.select();
        var done = false;
        function close() {
            done = true;
            if (box.parentNode) box.parentNode.removeChild(box);
            if (message.parentNode) message.parentNode.removeChild(message);
            span.style.display = '';
            cell.classList.remove('dcs-editing');
        }
        function save(leaving) {
            if (done) return;
            if (drawing || !alive || box.value === current) { close(); return; }
            done = true;
            var res = commit(id, prop, box.value);
            if (res && res.error) {
                done = false;
                if (leaving) { close(); return; }
                box.classList.add('dcs-cell-error');
                message.textContent = res.error;
                box.focus();
                return;
            }
            close();
        }
        box.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
            else if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); save(false); }
        });
        box.addEventListener('input', function () {
            box.rows = Math.min(10, Math.max(1, box.value.split('\n').length));
            box.classList.remove('dcs-cell-error');
            message.textContent = '';
        });
        box.addEventListener('blur', function () { save(true); });
        box.addEventListener('click', function (e) { e.stopPropagation(); });
        box.addEventListener('dblclick', function (e) { e.stopPropagation(); });
    }

    /* An expression: the host's expression editor in place (options.expressionEditor
     * gets the cell and { text, env, title, onCommit, onClose } and hands back a
     * handle, or null when it cannot edit, and the plain editor opens). */
    function openExpression(span, cell, id, prop, current) {
        var env = expressionEnv(model, id, prop);
        if (!env) return false;
        span.style.display = 'none';
        cell.classList.add('dcs-editing');
        var handle = options.expressionEditor(cell, {
            text: current, env: env, title: env.title,
            onCommit: function (text) { return drawing || !alive ? null : commit(id, prop, text); },
            onClose: function () {
                span.style.display = '';
                cell.classList.remove('dcs-editing');
            }
        });
        if (handle) return true;
        span.style.display = '';
        cell.classList.remove('dcs-editing');
        return false;
    }

    /* A list of checkboxes under `anchor`: items [{ value, title, on }];
     * done(values) gets the checked values in the list's order and returns
     * { error } to keep the list open. */
    function checkList(anchor, title, items, done) {
        var form = addForm(anchor, title, [], function () {
            var values = [];
            var boxes = form.querySelectorAll('.dcs-checklist-item');
            for (var i = 0; i < boxes.length; i++) if (boxes[i].classList.contains('dcs-checked')) values.push(boxes[i].getAttribute('data-value'));
            return done(values);
        }, 'ОК');
        var list = el('div', 'dcs-checklist');
        items.forEach(function (it) {
            var line = el('div', 'dcs-checklist-line');
            var box = check(it.on);
            box.classList.add('dcs-checklist-item');
            box.setAttribute('data-value', it.value);
            line.appendChild(box);
            line.appendChild(el('span', '', it.title));
            if (it.hint) line.title = it.hint;
            line.addEventListener('click', function () { box.classList.toggle('dcs-checked'); });
            list.appendChild(line);
        });
        form.insertBefore(list, form.querySelector('.dcs-add-message'));
        return form;
    }

    /* A dialog over the window, as the Designer opens one for a property of
     * several parts: `body` is its content, ok() returns { error } to keep it
     * open. Esc and «Отмена» close it, Ctrl+Enter is «ОК». */
    function modal(title, body, ok, cls) {
        var sub = /dcs-modal-sub/.test(cls || '');
        var old = win.querySelector('.dcs-modal-overlay');
        if (old && !sub) old.parentNode.removeChild(old);
        var overlay = el('div', 'dcs-modal-overlay');
        var box = el('div', 'dcs-modal' + (cls ? ' ' + cls : ''));
        var head = el('div', 'dcs-modal-title');
        head.appendChild(el('span', '', title));
        var x = el('span', 'dcs-modal-close', '×');
        head.appendChild(x);
        var content = el('div', 'dcs-modal-body');
        content.appendChild(body);
        var message = el('div', 'dcs-cell-message dcs-add-message');
        var buttons = el('div', 'dcs-add-buttons');
        var okButton = el('span', 'dcs-button', 'ОК');
        var cancel = el('span', 'dcs-button', 'Отмена');
        buttons.appendChild(okButton);
        buttons.appendChild(cancel);
        box.appendChild(head);
        box.appendChild(content);
        box.appendChild(message);
        box.appendChild(buttons);
        overlay.appendChild(box);
        function close() {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }
        function send() {
            if (!alive) { close(); return; }
            var res = ok();
            if (res && res.error) { message.textContent = res.error; return; }
            close();
        }
        box.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); e.stopPropagation(); close(); }
            else if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); send(); }
        });
        box.addEventListener('input', function () { message.textContent = ''; });
        box.addEventListener('click', function (e) { e.stopPropagation(); });
        box.addEventListener('dblclick', function (e) { e.stopPropagation(); });
        okButton.addEventListener('click', send);
        cancel.addEventListener('click', close);
        x.addEventListener('click', close);
        win.appendChild(overlay);
        box.tabIndex = -1;
        var first = box.querySelector('input, select, textarea');
        (first || box).focus();
        return { close: close, box: box, message: message };
    }

    /* Rows a dialog edits: columns [{ key, title, width, kind: text | choice
     * | check | expression, choices: [{ value, title }], env, placeholder }],
     * rows [{ key: value }], blank() a new row. rows() reads what is typed.
     * An expression cell opens the host's expression editor on double click. */
    function rowsEditor(columns, rows, blank) {
        var wrap = el('div', 'dcs-rows');
        var data = rows.map(function (r) { var c = {}; for (var k in r) if (Object.prototype.hasOwnProperty.call(r, k)) c[k] = r[k]; return c; });
        var selected = data.length ? 0 : -1;
        var table = el('table', 'dcs-rows-table');
        var bar = toolbar(['add', 'remove', 'up', 'down'], '', {
            add: function () { data.push(blank()); selected = data.length - 1; draw(); },
            remove: function () { if (selected < 0) return; data.splice(selected, 1); selected = Math.min(selected, data.length - 1); draw(); },
            up: function () { if (selected > 0) { var t = data[selected]; data[selected] = data[selected - 1]; data[selected - 1] = t; selected--; draw(); } },
            down: function () { if (selected >= 0 && selected < data.length - 1) { var t = data[selected]; data[selected] = data[selected + 1]; data[selected + 1] = t; selected++; draw(); } }
        });
        if (bar) wrap.appendChild(bar);
        var box = el('div', 'dcs-rows-box');
        box.appendChild(table);
        wrap.appendChild(box);
        function cellOf(r, i, c) {
            var td = el('td', 'dcs-rows-cell');
            if (c.width) td.style.width = c.width + 'px';
            var input;
            var kind = typeof c.kind === 'function' ? c.kind(r) : c.kind;
            if (kind === 'button') {
                input = el('span', 'dcs-link dcs-rows-button', c.text(r));
                input.addEventListener('click', function () { c.press(r, function () { draw(); }); });
            } else if (kind === 'readonly') {
                input = el('span', 'dcs-rows-readonly', r[c.key] == null ? '' : String(r[c.key]));
                input.title = 'Значение этого вида меняется в конфигураторе';
            } else if (kind === 'check') {
                input = check(!!r[c.key]);
                input.addEventListener('click', function () { r[c.key] = !r[c.key]; input.classList.toggle('dcs-checked', !!r[c.key]); });
                td.classList.add('dcs-center');
            } else if (kind === 'choice') {
                input = el('select', 'dcs-rows-input');
                (typeof c.choices === 'function' ? c.choices(r) : c.choices).forEach(function (ch) {
                    var o = el('option', '', ch.title);
                    o.value = ch.value;
                    if (ch.value === r[c.key]) o.selected = true;
                    input.appendChild(o);
                });
                input.addEventListener('change', function () { r[c.key] = input.value; if (c.onChange) c.onChange(r); if (c.redraw) draw(); });
            } else {
                input = el('input', 'dcs-rows-input');
                input.type = 'text';
                input.spellcheck = false;
                input.value = r[c.key] == null ? '' : String(r[c.key]);
                var ph = typeof c.placeholder === 'function' ? c.placeholder(r) : c.placeholder;
                if (ph) input.placeholder = ph;
                input.addEventListener('input', function () { r[c.key] = input.value; });
                if (kind === 'expression' && options.expressionEditor && c.env) {
                    input.title = 'Двойной щелчок — редактор выражения';
                    input.addEventListener('dblclick', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        input.style.display = 'none';
                        var handle = options.expressionEditor(td, {
                            text: input.value, env: c.env, title: c.title,
                            onCommit: function (text) { r[c.key] = text; input.value = text; return null; },
                            onClose: function () { input.style.display = ''; }
                        });
                        if (!handle) input.style.display = '';
                    });
                }
            }
            td.appendChild(input);
            td.addEventListener('mousedown', function () {
                if (selected === i) return;
                selected = i;
                var trs = table.querySelectorAll('tr.dcs-rows-row');
                for (var k = 0; k < trs.length; k++) trs[k].classList.toggle('dcs-selected', k === i);
            });
            return td;
        }
        function draw() {
            table.innerHTML = '';
            var head = el('tr', 'dcs-head');
            columns.forEach(function (c) {
                var th = el('th', '', c.title);
                if (c.width) th.style.width = c.width + 'px';
                head.appendChild(th);
            });
            table.appendChild(head);
            data.forEach(function (r, i) {
                var tr = el('tr', 'dcs-rows-row' + (i === selected ? ' dcs-selected' : ''));
                columns.forEach(function (c) { tr.appendChild(cellOf(r, i, c)); });
                table.appendChild(tr);
            });
            if (!data.length) {
                var empty = el('tr');
                var td = el('td', 'dcs-grid-empty', 'Пусто — «Добавить» на панели');
                td.colSpan = columns.length;
                empty.appendChild(td);
                table.appendChild(empty);
            }
        }
        draw();
        return { element: wrap, rows: function () { return data; } };
    }

    function recordName(id) {
        var owner = own(model.source.owners, id);
        return owner ? owner.auto || textOf(firstChild(owner.el, 'dataPath')) || textOf(firstChild(owner.el, 'name')) : '';
    }

    /* Выражения упорядочивания of a field: the expressions the field is
     * ordered by instead of its value. */
    function openOrder(id) {
        var env = expressionEnv(model, id, 'orderExpression');
        var editor = rowsEditor([
            { key: 'expression', title: 'Выражение', kind: 'expression', env: env, placeholder: 'Двойной щелчок — редактор выражения' },
            { key: 'orderType', title: 'Тип упорядочивания', width: 150, kind: 'choice', choices: [{ value: 'Asc', title: 'Возрастание' }, { value: 'Desc', title: 'Убывание' }] },
            { key: 'autoOrder', title: 'Автоупорядочивание', width: 130, kind: 'check' }
        ], orderList(model, id) || [], function () { return { expression: '', orderType: 'Asc', autoOrder: false }; });
        modal('Выражения упорядочивания «' + recordName(id) + '»', editor.element, function () {
            return act({ op: 'order', id: id, list: editor.rows() }) || null;
        }, 'dcs-modal-wide');
    }

    /* Доступные значения: the values a user picks from, with presentations. */
    function openAvailable(id) {
        var editor = rowsEditor([
            { key: 'value', title: 'Значение', placeholder: 'текст, число, Да/Нет, ДД.ММ.ГГГГ' },
            { key: 'presentation', title: 'Представление' }
        ], availableList(model, id) || [], function () { return { value: '', presentation: '' }; });
        modal('Доступные значения «' + recordName(id) + '»', editor.element, function () {
            return act({ op: 'available', id: id, list: editor.rows() }) || null;
        }, 'dcs-modal-wide');
    }

    /* Оформление and Параметры редактирования: the parameters with their
     * values; a list of choice parameters or of their links opens its own
     * rows. */
    function openParameters(id, listTag) {
        var editor = parametersRows(PARAMETER_KINDS[PARAMETER_LISTS[listTag]], parameterRows(model, id, listTag) || []);
        var titles = { appearance: 'Оформление', inputParameters: 'Параметры редактирования', outputParameters: 'Другие настройки' };
        var whose = recordName(id);
        modal(titles[listTag] + (whose ? ' «' + whose + '»' : ''), editor.element, function () {
            return act({ op: 'parameters', id: id, list: listTag, rows: editor.rows() }) || null;
        }, 'dcs-modal-wide');
    }

    /* The choice parameters of a field (Отбор.Владелец = value), or their
     * links to other fields (Отбор.Владелец ← Организация). */
    function openChoiceList(row, kind, done) {
        var links = kind === 'choiceLinks';
        var editor = rowsEditor([
            { key: 'name', title: 'Параметр выбора', width: 230, placeholder: 'Отбор.Владелец' },
            { key: 'value', title: links ? 'Поле' : 'Значение', placeholder: links ? 'поле отчета' : 'Истина, 10, "строка", Перечисление.Вид.Значение; через «;» — несколько' }
        ].concat(links ? [{ key: 'mode', title: 'Режим изменения', width: 140, kind: 'choice', choices: [{ value: 'Clear', title: 'Очищать' }, { value: 'DontChange', title: 'Не изменять' }] }] : []),
        row.list || [], function () { return links ? { name: '', value: '', mode: 'Clear' } : { name: '', value: '' }; });
        modal(links ? 'Связи параметров выбора' : 'Параметры выбора', editor.element, function () {
            row.list = editor.rows().filter(function (x) { return String(x.name || '').trim(); });
            done();
            return null;
        }, 'dcs-modal-wide dcs-modal-sub');
    }

    /* A section of a dialog: a caption over its content. */
    function section(title, content) {
        var box = el('div', 'dcs-modal-section');
        box.appendChild(el('div', 'dcs-modal-caption', title));
        box.appendChild(content);
        return box;
    }

    /* A rows editor of appearance parameters (the conditional appearance
     * item's own). */
    function parametersRows(catalog, rows) {
        var names = Object.keys(catalog);
        rows.forEach(function (r) { if (names.indexOf(r.parameter) < 0) names.push(r.parameter); });
        var kindOf = function (r) { return own(catalog, r.parameter) || { t: 'raw' }; };
        var blankValue = function (k) { return k.t === 'boolean' ? true : k.t === 'enum' ? k.words[0] : ''; };
        var editor = rowsEditor([
            { key: 'use', title: '', width: 26, kind: 'check' },
            { key: 'parameter', title: 'Параметр', width: 230, kind: 'choice', redraw: true, choices: function () {
                return names.map(function (n) { return { value: n, title: terms.identWords(n) || n }; });
            }, onChange: function (r) {
                var k = kindOf(r);
                r.kind = k.t;
                r.value = blankValue(k);
                r.list = k.t === 'choiceParameters' || k.t === 'choiceLinks' ? [] : null;
                r.keep = null;
            } },
            { key: 'value', title: 'Значение', kind: function (r) {
                var k = kindOf(r);
                if (k.t === 'boolean') return 'check';
                if (k.t === 'enum') return 'choice';
                if (k.t === 'choiceParameters' || k.t === 'choiceLinks') return 'button';
                if (k.t === 'raw') return 'readonly';
                return 'text';
            }, choices: function (r) {
                var k = kindOf(r);
                var words = k.words.slice();
                if (r.value && words.indexOf(r.value) < 0) words.push(r.value);
                return words.map(function (w) { return { value: w, title: enumTitle(w) }; });
            }, placeholder: function (r) {
                var k = kindOf(r);
                return k.t === 'color' ? 'web:Red, style:Имя, #RRGGBB' : k.t === 'typeLink' ? 'поле' : k.t === 'decimal' ? 'число' : '';
            }, text: function (r) { return listSummary(kindOf(r).t, r.list) || 'Задать…'; },
            press: function (r, done) { openChoiceList(r, kindOf(r).t, done); } }
        ], rows, function () {
            var free = names.filter(function (n) { return !editor.rows().some(function (r) { return r.parameter === n; }); })[0] || names[0];
            var k = own(catalog, free) || { t: 'raw' };
            return { use: true, parameter: free, kind: k.t, value: blankValue(k), list: k.t === 'choiceParameters' || k.t === 'choiceLinks' ? [] : null, keep: null };
        });
        return editor;
    }

    /* An item of the conditional appearance, new (`id` the list) or present. */
    function openAppearanceItem(id) {
        var owner = own(model.source.owners, id);
        var data = owner && owner.kind === 'sitem' ? appearanceItemOf(model, id)
            : { use: true, fields: [], flat: true, conditions: [], appearance: [], presentation: '', areas: {}, keep: null };
        if (!data) return;
        var body = el('div', 'dcs-ca');
        var paths = fieldPaths().map(function (pth) { return { value: pth, title: pth }; });
        var fields = rowsEditor([{ key: 'field', title: 'Поле', placeholder: 'путь поля' }], data.fields, function () { return { field: '' }; });
        var cmp = Object.keys(COMPARISON).map(function (k) { return { value: k, title: COMPARISON[k] }; });
        var conds = data.flat ? rowsEditor([
            { key: 'use', title: '', width: 26, kind: 'check' },
            { key: 'field', title: 'Поле', width: 220, placeholder: 'путь поля' },
            { key: 'comparisonType', title: 'Вид сравнения', width: 170, kind: 'choice', choices: cmp },
            { key: 'value', title: 'Значение', placeholder: 'текст, число, Да/Нет, ДД.ММ.ГГГГ или &Параметр' }
        ], data.conditions, function () { return { use: true, field: '', comparisonType: 'Equal', value: '' }; }) : null;
        var looks = parametersRows(PARAMETER_KINDS.appearance, data.appearance || []);
        var top = el('div', 'dcs-ca-top');
        top.appendChild(section('Оформление', looks.element));
        top.appendChild(section('Условие', conds ? conds.element : el('div', 'dcs-hint', 'Условие с группами меняется в конфигураторе: ' + (data.condition || 'задано'))));
        body.appendChild(top);
        var bottom = el('div', 'dcs-ca-top');
        bottom.appendChild(section('Оформляемые поля', fields.element));
        var extra = el('div', 'dcs-form-grid');
        extra.appendChild(el('span', 'dcs-add-label', 'Представление'));
        var pres = el('input', 'dcs-add-input');
        pres.type = 'text';
        pres.value = data.presentation || '';
        pres.placeholder = 'по оформлению';
        extra.appendChild(pres);
        var areas = el('div', 'dcs-ca-areas');
        USE_IN.forEach(function (u) {
            var on = data.areas[u[0]] !== false;
            var line = el('div', 'dcs-checklist-line');
            var c = check(on);
            line.appendChild(c);
            line.appendChild(el('span', '', u[1]));
            line.addEventListener('click', function () { data.areas[u[0]] = !(data.areas[u[0]] !== false); c.classList.toggle('dcs-checked', data.areas[u[0]] !== false); });
            areas.appendChild(line);
        });
        var right = el('div');
        right.appendChild(extra);
        right.appendChild(section('Область использования', areas));
        bottom.appendChild(right);
        body.appendChild(bottom);
        if (paths.length) {
            var dl = el('datalist');
            dl.id = 'dcs-hints-' + (++hintLists);
            paths.forEach(function (x) { var o = el('option'); o.value = x.value; dl.appendChild(o); });
            body.appendChild(dl);
            body.addEventListener('focusin', function (e) {
                var t = e.target;
                if (t && t.tagName === 'INPUT' && /путь поля/.test(t.placeholder || '')) t.setAttribute('list', dl.id);
            });
        }
        modal(owner && owner.kind === 'sitem' ? 'Условное оформление' : 'Новое условное оформление', body, function () {
            data.fields = fields.rows();
            if (conds) data.conditions = conds.rows();
            data.appearance = looks.rows();
            data.presentation = pres.value;
            return act({ op: 'appearanceItem', id: id, data: data }) || null;
        }, 'dcs-modal-wide dcs-modal-xwide');
    }

    /* An expression typed in a dialog; a double click (or «…») opens the
     * host's expression editor in its place. */
    function expressionInput(value, env, placeholder) {
        var wrap = el('div', 'dcs-expr-field');
        var input = el('textarea', 'dcs-add-input');
        input.rows = 2;
        input.spellcheck = false;
        input.value = value || '';
        if (placeholder) input.placeholder = placeholder;
        wrap.appendChild(input);
        if (options.expressionEditor) {
            input.title = 'Двойной щелчок — редактор выражения';
            input.addEventListener('dblclick', function (e) {
                e.preventDefault();
                e.stopPropagation();
                input.style.display = 'none';
                var handle = options.expressionEditor(wrap, {
                    text: input.value, env: env, title: env.title,
                    onCommit: function (text) { input.value = text; return null; },
                    onClose: function () { input.style.display = ''; }
                });
                if (!handle) input.style.display = '';
            });
        }
        return { element: wrap, value: function () { return input.value; } };
    }

    /* A user field: an expression or a choice of values by conditions. */
    function openUserField(id, kind) {
        var owner = own(model.source.owners, id);
        var data = owner && owner.kind === 'sitem' ? userFieldOf(model, id)
            : { kind: kind, dataPath: '', title: kind === 'case' ? 'Поле выбора' : 'Поле', detail: '', total: '', cases: [], keep: null };
        if (!data) return;
        var body = el('div', 'dcs-ca');
        var form = el('div', 'dcs-form-grid');
        form.appendChild(el('span', 'dcs-add-label', 'Заголовок'));
        var title = el('input', 'dcs-add-input');
        title.type = 'text';
        title.value = data.title || '';
        form.appendChild(title);
        body.appendChild(form);
        var detail, total, cases;
        if (data.kind === 'case') {
            var cmp = Object.keys(COMPARISON).map(function (k) { return { value: k, title: COMPARISON[k] }; });
            cases = rowsEditor([
                { key: 'field', title: 'Поле условия', width: 180, kind: function (r) { return r.complex ? 'readonly' : 'text'; }, placeholder: 'путь поля' },
                { key: 'comparisonType', title: 'Сравнение', width: 140, kind: function (r) { return r.complex ? 'readonly' : 'choice'; }, choices: cmp },
                { key: 'value', title: 'Значение условия', width: 160, kind: function (r) { return r.complex ? 'readonly' : 'text'; } },
                { key: 'value2', title: 'Значение поля', width: 140, placeholder: 'Истина, 10, "текст"' },
                { key: 'presentation', title: 'Представление' }
            ], data.cases || [], function () { return { field: '', comparisonType: 'Equal', value: '', value2: '', presentation: '' }; });
            body.appendChild(section('Варианты', cases.element));
        } else {
            detail = expressionInput(data.detail, settingsEnv(model, 'userFieldDetail', 'Выражение детальных записей'), 'Двойной щелчок — редактор выражения');
            total = expressionInput(data.total, settingsEnv(model, 'userFieldTotal', 'Выражение итоговых записей'), 'Сумма(...); пусто — по детальным записям');
            body.appendChild(section('Выражение детальных записей', detail.element));
            body.appendChild(section('Выражение итоговых записей', total.element));
        }
        modal(owner && owner.kind === 'sitem' ? 'Пользовательское поле «' + (data.title || data.dataPath) + '»'
            : data.kind === 'case' ? 'Новое поле — выбор' : 'Новое поле — выражение', body, function () {
            data.title = title.value;
            if (cases) data.cases = cases.rows();
            if (detail) { data.detail = detail.value(); data.total = total.value(); }
            return act({ op: 'userField', id: id, data: data }) || null;
        }, 'dcs-modal-wide');
    }

    function paramValueText(pv) {
        if (pv.kind === 'period') return pv.variant === 'Custom' ? (pv.start || pv.end ? pv.start + ' – ' + pv.end : 'Произвольный период') : STANDARD_PERIODS[pv.variant] || pv.variant;
        if (pv.kind === 'beginDate') return pv.variant === 'Custom' ? pv.date || 'Произвольная дата' : BEGINNING_DATES[pv.variant] || pv.variant;
        return pv.values.map(function (x) { return x.value === null ? '…' : x.value; }).join('; ');
    }

    /* The value of a parameter: a standard period, a beginning date, values. */
    function openParamValue(id) {
        var pv = paramValueOf(model, id);
        if (!pv) return;
        var body, read;
        if (pv.kind === 'period' || pv.kind === 'beginDate') {
            var map = pv.kind === 'period' ? STANDARD_PERIODS : BEGINNING_DATES;
            body = el('div', 'dcs-form-grid');
            body.appendChild(el('span', 'dcs-add-label', 'Вариант'));
            var select = el('select', 'dcs-add-input');
            Object.keys(map).forEach(function (k) {
                var o = el('option', '', map[k]);
                o.value = k;
                if (k === pv.variant) o.selected = true;
                select.appendChild(o);
            });
            body.appendChild(select);
            var input = function (label, value) {
                body.appendChild(el('span', 'dcs-add-label', label));
                var x = el('input', 'dcs-add-input');
                x.type = 'text';
                x.value = value || '';
                x.placeholder = 'ДД.ММ.ГГГГ';
                body.appendChild(x);
                return x;
            };
            var a = pv.kind === 'period' ? input('Начало', pv.start) : input('Дата', pv.date);
            var b = pv.kind === 'period' ? input('Окончание', pv.end) : null;
            var sync = function () { a.disabled = select.value !== 'Custom'; if (b) b.disabled = a.disabled; };
            select.addEventListener('change', sync);
            sync();
            read = function () {
                return pv.kind === 'period' ? { kind: 'period', variant: select.value, start: a.value, end: b.value } : { kind: 'beginDate', variant: select.value, date: a.value };
            };
        } else {
            var editor = rowsEditor([{ key: 'value', title: 'Значение', kind: function (r) { return r.value === null ? 'readonly' : 'text'; },
                placeholder: 'Истина, 10, ДД.ММ.ГГГГ, "строка" или Справочник.Валюты.ПустаяСсылка' }],
                pv.values.map(function (x) { return { value: x.value === null ? 'значение сложного типа' : x.value, xml: x.xml, complex: x.value === null }; }),
                function () { return { value: '', xml: '' }; });
            body = el('div');
            if (!pv.list) body.appendChild(el('div', 'dcs-hint', 'Одно значение: у параметра не разрешен список'));
            body.appendChild(editor.element);
            read = function () {
                return { kind: 'values', values: editor.rows().map(function (r) { return { value: r.complex ? null : r.value, xml: r.xml }; }) };
            };
        }
        modal('Значение «' + recordName(id) + '»', body, function () {
            return act({ op: 'paramValue', id: id, data: read() }) || null;
        });
    }

    /* Свойства элемента пользовательских настроек of `id`. */
    function openUserSetting(id) {
        var us = userSettingOf(model, id);
        if (!us) { flash('У этого элемента нет пользовательских настроек'); return; }
        var form = el('div', 'dcs-form-grid');
        var c = check(us.include);
        var label = el('span', 'dcs-check-label');
        label.appendChild(c);
        label.appendChild(el('span', '', 'Включать в пользовательские настройки'));
        label.addEventListener('click', function () { us.include = !us.include; c.classList.toggle('dcs-checked', us.include); });
        form.appendChild(label);
        form.appendChild(el('span'));
        form.appendChild(el('span', 'dcs-add-label', 'Режим редактирования'));
        var select = el('select', 'dcs-add-input');
        Object.keys(VIEW_MODES).forEach(function (k) {
            var o = el('option', '', VIEW_MODES[k]);
            o.value = k;
            if (k === us.viewMode) o.selected = true;
            select.appendChild(o);
        });
        form.appendChild(select);
        form.appendChild(el('span', 'dcs-add-label', 'Представление'));
        var pres = el('input', 'dcs-add-input');
        pres.type = 'text';
        pres.value = us.presentation;
        form.appendChild(pres);
        modal('Свойства элемента пользовательских настроек', form, function () {
            return act({ op: 'userSetting', id: id, data: { include: us.include, viewMode: select.value, presentation: pres.value } }) || null;
        });
    }

    /* Роль: what the field is to the report — a period, a dimension, an
     * account, a balance — and its parts. */
    function openRole(id) {
        var r = roleOf(model, id) || {};
        var form = el('div', 'dcs-form-grid');
        var inputs = {};
        function flag(key, title) {
            var c = check(!!r[key]);
            var label = el('span', 'dcs-check-label');
            label.appendChild(c);
            label.appendChild(el('span', '', title));
            label.addEventListener('click', function () { r[key] = !r[key]; c.classList.toggle('dcs-checked', !!r[key]); });
            form.appendChild(label);
            form.appendChild(el('span'));
        }
        function text(key, title, hint) {
            form.appendChild(el('span', 'dcs-add-label', title));
            var input = el('input', 'dcs-add-input');
            input.type = 'text';
            input.value = r[key] == null ? '' : String(r[key]);
            if (hint) input.placeholder = hint;
            input.addEventListener('input', function () { r[key] = input.value; });
            form.appendChild(input);
            inputs[key] = input;
        }
        function choice(key, title, list) {
            form.appendChild(el('span', 'dcs-add-label', title));
            var select = el('select', 'dcs-add-input');
            list.forEach(function (c) {
                var o = el('option', '', c[1]);
                o.value = c[0];
                if (c[0] === (r[key] || list[0][0])) o.selected = true;
                select.appendChild(o);
            });
            select.addEventListener('change', function () { r[key] = select.value; });
            form.appendChild(select);
        }
        text('periodNumber', 'Номер периода', 'пусто — не период');
        choice('periodType', 'Тип периода', [['Main', 'Основной'], ['Additional', 'Дополнительный']]);
        flag('dimension', 'Измерение');
        text('parentDimension', 'Родительское измерение', 'поле');
        flag('account', 'Счет');
        text('accountTypeExpression', 'Выражение вида счета', 'Счет.Вид');
        flag('balance', 'Остаток');
        text('balanceGroupName', 'Имя группы остатка');
        choice('balanceType', 'Тип остатка', [['None', 'Нет'], ['OpeningBalance', 'Начальный остаток'], ['ClosingBalance', 'Конечный остаток']]);
        text('accountField', 'Поле счета', 'Счет');
        choice('accountingBalanceType', 'Вид бухгалтерского остатка', [['', 'Нет'], ['Debit', 'Дебет'], ['Credit', 'Кредит']]);
        flag('ignoreNullValues', 'Игнорировать значения NULL');
        flag('required', 'Обязательное');
        modal('Роль поля «' + recordName(id) + '»', form, function () {
            return act({ op: 'role', id: id, role: r }) || null;
        });
    }

    /* Рассчитывать по...: the groupings of the report fields and the overall
     * total; nothing checked — the resource is calculated by every grouping. */
    function openGroups(span, id) {
        var now = totalGroups(model, id) || [];
        var overall = now.indexOf('Overall') >= 0 ? 'Overall' : 'ОбщийИтог';
        var items = fieldPaths().filter(function (pth) { return !own(resourcePaths, pth); }).map(function (pth) {
            return { value: pth, title: fieldTitle(pth), hint: pth, on: now.indexOf(pth) >= 0 };
        });
        now.forEach(function (g) {
            if (g !== overall && !items.some(function (it) { return it.value === g; })) items.push({ value: g, title: g, on: true });
        });
        items.push({ value: overall, title: 'Общий итог', on: now.indexOf(overall) >= 0 });
        checkList(span, 'Рассчитывать по', items, function (values) {
            return act({ op: 'groups', id: id, groups: values });
        });
    }

    /* A property with a few values (a comparison, a direction): a list in place. */
    function openChoice(span, cell, id, prop, current, choices) {
        var select = el('select', 'dcs-cell-choice');
        choices.forEach(function (c) {
            var o = el('option', '', c.title);
            o.value = c.value;
            if (c.value === current) o.selected = true;
            select.appendChild(o);
        });
        span.style.display = 'none';
        cell.classList.add('dcs-editing');
        cell.appendChild(select);
        var done = false;
        function close() {
            if (done) return;
            done = true;
            if (select.parentNode) select.parentNode.removeChild(select);
            span.style.display = '';
            cell.classList.remove('dcs-editing');
        }
        select.addEventListener('change', function () {
            var v = select.value;
            close();
            if (v !== current && !drawing && alive) commit(id, prop, v);
        });
        select.addEventListener('blur', close);
        select.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); close(); } });
        select.addEventListener('click', function (e) { e.stopPropagation(); });
        select.focus();
    }

    // ------------------------------------------------------------ adding

    /* The command bars work where the host edits the schema (options.onSchemaEdit). */
    var adding = !!options.onSchemaEdit;
    var hintLists = 0;

    /* Adds a record through the host and selects it. */
    function commitAdd(what, target, values) {
        return act({ op: 'add', what: what, target: target, values: values });
    }

    /* A small form under `anchor`: its fields are { key, label, value,
     * placeholder, hints, multiline, choices: [{ value, title }] };
     * submit(values) returns { error } to keep the form open. Enter adds
     * (Ctrl+Enter in a multi-line field), Esc closes. */
    function addForm(anchor, title, fields, submit, okTitle) {
        var old = win.querySelector('.dcs-add-form');
        if (old) old.parentNode.removeChild(old);
        var form = el('div', 'dcs-add-form');
        form.appendChild(el('div', 'dcs-add-title', title));
        var inputs = {};
        fields.forEach(function (f) {
            var line = el('label', 'dcs-add-line');
            line.appendChild(el('span', 'dcs-add-label', f.label));
            if (f.choices) {
                var select = el('select', 'dcs-add-input');
                f.choices.forEach(function (c) {
                    var o = el('option', '', c.title);
                    o.value = c.value;
                    if (c.value === f.value) o.selected = true;
                    select.appendChild(o);
                });
                line.appendChild(select);
                form.appendChild(line);
                inputs[f.key] = select;
                return;
            }
            var input = el(f.multiline ? 'textarea' : 'input', 'dcs-add-input');
            if (!f.multiline) input.type = 'text';
            else input.rows = 3;
            input.spellcheck = false;
            input.value = f.value || '';
            if (f.placeholder) input.placeholder = f.placeholder;
            if (f.hints && f.hints.length) {
                var list = el('datalist');
                list.id = 'dcs-hints-' + (++hintLists);
                f.hints.forEach(function (h) { var o = el('option'); o.value = h; list.appendChild(o); });
                line.appendChild(list);
                input.setAttribute('list', list.id);
            }
            line.appendChild(input);
            form.appendChild(line);
            inputs[f.key] = input;
        });
        var message = el('div', 'dcs-cell-message dcs-add-message');
        var buttons = el('div', 'dcs-add-buttons');
        var ok = el('span', 'dcs-button', okTitle || 'Добавить');
        var cancel = el('span', 'dcs-button', 'Отмена');
        buttons.appendChild(ok);
        buttons.appendChild(cancel);
        form.appendChild(message);
        form.appendChild(buttons);
        function close() {
            if (form.parentNode) form.parentNode.removeChild(form);
            document.removeEventListener('mousedown', outside, true);
        }
        function send() {
            var values = {};
            for (var k in inputs) if (Object.prototype.hasOwnProperty.call(inputs, k)) values[k] = inputs[k].value;
            var res = submit(values);
            if (res && res.error) { message.textContent = res.error; return; }
            close();
        }
        function outside(e) { if (!form.contains(e.target) && e.target !== anchor && !anchor.contains(e.target)) close(); }
        form.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
            else if (e.key === 'Enter' && (e.target.tagName !== 'TEXTAREA' || e.ctrlKey)) { e.preventDefault(); send(); }
        });
        form.addEventListener('input', function () { message.textContent = ''; });
        ok.addEventListener('click', send);
        cancel.addEventListener('click', close);
        document.addEventListener('mousedown', outside, true);
        var a = anchor.getBoundingClientRect();
        var w = win.getBoundingClientRect();
        form.style.top = (a.bottom - w.top + 2) + 'px';
        win.appendChild(form);
        /* Under the button, but inside the window when the window is narrow. */
        var visible = container.getBoundingClientRect();
        var right = Math.min(w.right, visible.right) - w.left;
        form.style.left = Math.max(Math.max(0, visible.left - w.left), Math.min(a.left - w.left, right - form.offsetWidth - 4)) + 'px';
        var first = fields.length ? inputs[fields[0].key] : null;
        if (first) {
            first.focus();
            if (first.select && first.tagName !== 'SELECT') first.select();
        } else {
            form.tabIndex = -1;
            form.focus();
        }
        return form;
    }

    /* The title a field is shown with: its own, else made of its name. */
    function fieldTitle(path) {
        var hit = null;
        (function walk(nodes) {
            nodes.forEach(function (n) { if (!hit && n.path === path) hit = n; else if (!hit) walk(n.children); });
        })(fieldTree);
        return hit ? hit.title : path;
    }

    /* The paths of the fields a settings list or a resource may take. */
    function fieldPaths() {
        var paths = [];
        (function walk(nodes) {
            nodes.forEach(function (n) { if (!n.folder) paths.push(n.path); walk(n.children); });
        })(fieldTree);
        return paths;
    }

    function addParameter(button) {
        addForm(button, 'Новый параметр', [
            { key: 'name', label: 'Имя' },
            { key: 'type', label: 'Тип', placeholder: 'Строка(50), Число(15, 2), Дата, Булево, СправочникСсылка.Имя',
                hints: ['Строка', 'Число(15, 2)', 'Дата', 'Булево', 'СтандартныйПериод'] }
        ], function (v) { return commitAdd('param', null, v); });
    }

    function addLink(button) {
        var sets = flat.map(function (x) { return { value: x.set.name, title: x.set.name }; });
        if (sets.length < 2) { flash('Связь соединяет два набора данных'); return; }
        addForm(button, 'Новая связь наборов данных', [
            { key: 'source', label: 'Источник', choices: sets, value: sets[0].value },
            { key: 'dest', label: 'Приемник', choices: sets, value: sets[1].value },
            { key: 'sourceExpression', label: 'Выражение источник' },
            { key: 'destinationExpression', label: 'Выражение приемник' }
        ], function (v) { return commitAdd('link', null, v); });
    }

    function addSet(button) {
        var current = viewState.set && own(model.source.owners, viewState.set);
        var union = current && xsiType(current.el) === 'DataSetUnion' ? viewState.set : '';
        var choices = [{ value: 'query', title: 'Набор данных - запрос' }, { value: 'object', title: 'Набор данных - объект' },
            { value: 'union', title: 'Набор данных - объединение' }];
        addForm(button, union ? 'Новый набор в объединении' : 'Новый набор данных', [
            { key: 'kind', label: 'Вид', choices: choices, value: 'query' },
            { key: 'name', label: 'Имя', placeholder: 'НаборДанных1' }
        ], function (v) {
            var res = commitAdd('set', union || null, v);
            if (res && res.id) { viewState.set = res.id; showTab('sets'); markSelected(res.id); }
            return res;
        });
    }

    function addVariant(button) {
        addForm(button, 'Новый вариант настроек', [
            { key: 'name', label: 'Имя', placeholder: 'Вариант1' },
            { key: 'presentation', label: 'Представление' }
        ], function (v) {
            var res = commitAdd('variant', null, v);
            if (res && res.id) {
                viewState.variant = model.variants.length - 1;
                viewState.node = '';
                showTab('settings');
                markSelected(res.id);
            }
            return res;
        });
    }

    /* A new item of a settings list: the field, and what the list needs besides. */
    function addSettingsItem(button, kind, listId, field) {
        var what = kind === 'groupFields' ? 'groupFields' : kind;
        if (field && kind !== 'filter') return commitAdd(what, listId, { field: field });
        var fields = [{ key: 'field', label: 'Поле', hints: fieldPaths(), value: field || '' }];
        if (kind === 'order') fields.push({ key: 'orderType', label: 'Направление', value: 'Asc',
            choices: [{ value: 'Asc', title: 'По возрастанию' }, { value: 'Desc', title: 'По убыванию' }] });
        if (kind === 'filter') {
            fields.push({ key: 'comparisonType', label: 'Вид сравнения', value: 'Equal', choices: Object.keys(COMPARISON).map(function (k) {
                return { value: k, title: COMPARISON[k] };
            }) });
            fields.push({ key: 'value', label: 'Значение', placeholder: 'текст, число, Да/Нет, ДД.ММ.ГГГГ или &Параметр' });
        }
        var titles = { selection: 'Новое выбранное поле', order: 'Новое поле сортировки', groupFields: 'Новое поле группировки', filter: 'Новый отбор' };
        return addForm(button, titles[kind], fields, function (v) { return commitAdd(what, listId, v); });
    }

    /* A new item of the structure: a grouping, a table, a chart or a nested object. */
    function addStructureItem(button, nodeId) {
        var nested = model.nested.map(function (n) { return { value: n.name, title: n.title || n.name }; });
        var fields = [{ key: 'kind', label: 'Вид', value: 'group', choices: [{ value: 'group', title: 'Группировка' }, { value: 'table', title: 'Таблица' },
            { value: 'chart', title: 'Диаграмма' }].concat(nested.length ? [{ value: 'nested', title: 'Вложенный объект' }] : []) },
            { key: 'field', label: 'Поле группировки', hints: fieldPaths(), placeholder: 'пусто — детальные записи' }];
        if (nested.length) fields.push({ key: 'object', label: 'Вложенная схема', value: nested[0].value, choices: nested });
        addForm(button, 'Новый элемент структуры', fields, function (v) {
            var res = commitAdd('group', nodeId, v);
            if (res && res.id) { viewState.node = res.id; showTab('settings'); markSelected(res.id); }
            return res;
        });
    }

    /* A grouping of a table's rows or columns, a chart's points or series. */
    function addAxisGrouping(button, nodeId, axis) {
        var owner = own(model.source.owners, nodeId);
        var chart = owner && xsiType(owner.el) === 'StructureItemChart';
        var choices = chart ? [{ value: 'point', title: 'Точки' }, { value: 'series', title: 'Серии' }] : [{ value: 'row', title: 'Строки' }, { value: 'column', title: 'Колонки' }];
        addForm(button, chart ? 'Новая группировка диаграммы' : 'Новая группировка таблицы', [
            { key: 'axis', label: 'Куда', value: axis || choices[0].value, choices: choices },
            { key: 'field', label: 'Поле', hints: fieldPaths(), placeholder: 'пусто — детальные записи' }
        ], function (v) {
            var res = commitAdd('group', nodeId, v);
            if (res && res.id) { viewState.node = res.id; showTab('settings'); markSelected(res.id); }
            return res;
        });
    }

    function addGrouping(button, nodeId) {
        addForm(button, 'Новая группировка', [
            { key: 'field', label: 'Поле', hints: fieldPaths(), placeholder: 'пусто — детальные записи' }
        ], function (v) {
            var res = commitAdd('group', nodeId, v);
            if (res && res.id) { viewState.node = res.id; showTab('settings'); markSelected(res.id); }
            return res;
        });
    }

    function addSetField(set, button, kind) {
        var have = {};
        set.fields.forEach(function (f) { have[f.field] = true; have[f.dataPath] = true; });
        var hints = set.query && kind !== 'folder' ? queryColumns(set.query.text).filter(function (c) { return !have[c]; }) : [];
        var fields = [{ key: 'dataPath', label: kind === 'folder' ? 'Имя папки' : 'Путь к данным', hints: hints,
            placeholder: hints.length ? 'колонка запроса или своё имя' : kind === 'folder' ? 'Реквизиты' : '' }];
        if (kind !== 'folder') fields.push({ key: 'field', label: 'Поле', placeholder: 'как путь к данным' });
        fields.push({ key: 'title', label: 'Заголовок', placeholder: 'по имени' });
        var titles = { field: 'Новое поле набора «', folder: 'Новая папка набора «', nested: 'Новый вложенный набор «' };
        addForm(button, titles[kind] + set.name + '»', fields, function (v) {
            v.kind = kind;
            return commitAdd('field', set.id, v);
        });
    }

    function addCalculated(button) {
        addForm(button, 'Новое вычисляемое поле', [
            { key: 'dataPath', label: 'Путь к данным' },
            { key: 'expression', label: 'Выражение', multiline: true, placeholder: 'Ctrl+Enter — добавить' }
        ], function (v) { return commitAdd('calc', null, v); });
    }

    function addTotal(button, path) {
        if (path) return commitAdd('total', null, { dataPath: path });
        var paths = [];
        (function walk(nodes) {
            nodes.forEach(function (n) { if (!n.folder) paths.push(n.path); walk(n.children); });
        })(fieldTree);
        return addForm(button, 'Новый ресурс', [
            { key: 'dataPath', label: 'Поле', hints: paths },
            { key: 'expression', label: 'Выражение', placeholder: 'Сумма(Поле)' }
        ], function (v) { return commitAdd('total', null, v); });
    }

    function paramRecord(id) {
        for (var i = 0; i < model.parameters.length; i++) if (model.parameters[i].id === id) return model.parameters[i].simpleValue;
        return null;
    }

    if (editable) {
        page.addEventListener('click', function (e) {
            var c = e.target.closest && e.target.closest('.dcs-check.dcs-editable');
            if (!c) return;
            e.stopPropagation();
            var id = c.getAttribute('data-edit');
            var prop = c.getAttribute('data-prop');
            var on = valueOf(id, prop);
            if (typeof on === 'boolean') commit(id, prop, !on);
        });
        page.addEventListener('dblclick', function (e) {
            var span = e.target.closest && e.target.closest('.dcs-cell-text.dcs-editable');
            /* An empty value has no text to hit: the cell around it opens it too. */
            if (!span) {
                var td = e.target.closest && e.target.closest('td');
                var inner = td && td.querySelectorAll('.dcs-cell-text.dcs-editable');
                if (inner && inner.length === 1) span = inner[0];
            }
            if (!span) return;
            e.preventDefault();
            openEditor(span);
        });
    }

    /* "Доступные поля" of the resources and settings pages. */
    var fieldTree = availableFields(model);

    /* Ресурсы схемы: конфигуратор рисует их зелёной иконкой, остальные поля —
     * синей, а группу — папкой. */
    var resourcePaths = {};
    model.totals.forEach(function (t) { if (t.dataPath) resourcePaths[t.dataPath] = true; });

    function fieldPicture(path, folder) {
        if (folder) return picture('folder');
        if (!path) return null;
        return picture(own(resourcePaths, path) ? 'resource' : 'field');
    }

    /* `pick(path)` takes a field double-clicked in the panel. */
    function fieldsPanel(extra, pick) {
        var box = el('div', 'dcs-grid dcs-available');
        if (pick) {
            box.title = 'Двойной щелчок — добавить поле';
            box.addEventListener('dblclick', function (e) {
                var tr = e.target.closest && e.target.closest('[data-path]');
                if (tr) pick(tr.getAttribute('data-path'));
            });
        }
        var table = el('table');
        var head = el('tr', 'dcs-head');
        head.appendChild(el('th', '', 'Доступные поля'));
        var thead = el('thead');
        thead.appendChild(head);
        table.appendChild(thead);
        var body = el('tbody');
        function add(n, depth) {
            var tr = el('tr', 'dcs-row');
            if (!n.folder) tr.setAttribute('data-path', n.path);
            var td = el('td');
            td.style.paddingLeft = (6 + depth * 16) + 'px';
            var span = el('span', 'dcs-cell-icon');
            span.appendChild(treeMark(n.collapsed ? 'plus' : n.children.length ? 'minus' : 'leaf'));
            var pic = fieldPicture(n.path, n.folder);
            if (pic) span.appendChild(pic);
            span.appendChild(el('span', '', n.title));
            span.title = n.path;
            td.appendChild(span);
            tr.appendChild(td);
            body.appendChild(tr);
            if (!n.collapsed) for (var i = 0; i < n.children.length; i++) add(n.children[i], depth + 1);
        }
        fieldTree.concat(extra || []).forEach(function (n) { add(n, 0); });
        table.appendChild(body);
        box.appendChild(table);
        return box;
    }

    var SYSTEM_FIELDS = { path: 'СистемныеПоля', title: 'СистемныеПоля', folder: true, collapsed: true, children: [] };
    var DATA_PARAMETERS = { path: 'ПараметрыДанных', title: 'ПараметрыДанных', folder: true, collapsed: true, children: [] };

    // ------------------------------------------------------------- sets

    var flat = allSets(model.sets, 0, []);
    /* The open query's editor when it can be written: the designer button acts on it. */
    var queryTools = null;

    function drawSets() {
        var split = el('div', 'dcs-split dcs-sets');
        var left = el('div', 'dcs-column dcs-sets-left');
        var setBar = toolbar(['addMenu', 'copy', 'remove', 'up', 'down', 'edit'], '', listActions(function (id) { return id.indexOf('set:') === 0; }, {
            addMenu: addSet,
            edit: function (b) {
                var id = selectedIn(function (x) { return x.indexOf('set:') === 0; });
                var cur = id && own(model.source.owners, id);
                if (!cur) { flash('Выберите набор данных'); return; }
                addForm(b, 'Имя набора данных', [{ key: 'name', label: 'Имя', value: textOf(firstChild(cur.el, 'name')) }], function (v) {
                    var res = act({ op: 'renameSet', id: id, name: v.name });
                    if (res && res.id) { viewState.set = res.id; showTab('sets'); markSelected(res.id); }
                    return res;
                }, 'ОК');
            }
        }));
        if (setBar) left.appendChild(setBar);
        var tree = el('div', 'dcs-tree');
        tree.appendChild(treeRow('tab:sets', 0, 'group', 'Наборы данных', false, '', 'minus'));
        for (var i = 0; i < flat.length; i++) {
            var s = flat[i].set;
            tree.appendChild(treeRow(s.id, flat[i].depth + 1, s.kind === 'DataSetUnion' ? 'union' : 'set', s.name, true, s.kindTitle,
                s.items.length ? 'minus' : ''));
        }
        left.appendChild(tree);
        split.appendChild(left);
        var right = el('div', 'dcs-column dcs-set-body');
        split.appendChild(right);
        page.appendChild(split);
        var current = null;
        for (var j = 0; j < flat.length; j++) if (flat[j].set.id === viewState.set) current = flat[j].set;
        if (!current && flat.length) current = flat[0].set;
        if (current) {
            viewState.set = current.id;
            var sel = tree.querySelector('[data-set="' + cssEscape(current.id) + '"]');
            if (sel) sel.classList.add('dcs-current');
            drawSet(current, right);
        } else {
            right.appendChild(el('div', 'dcs-grid-empty', 'Нет наборов данных'));
        }
        tree.addEventListener('click', function (e) {
            var r = e.target.closest && e.target.closest('[data-set]');
            if (!r) return;
            var id = r.getAttribute('data-set');
            viewState.set = id;
            showTab('sets');
            markSelected(id);
            notify(id);
        });
        collectRows(page);
    }

    function treeRow(id, depth, pic, text, isSet, hint, mark) {
        var r = el('div', 'dcs-tree-row');
        r.style.paddingLeft = (4 + depth * 20) + 'px';
        r.setAttribute('data-id', id);
        if (isSet) r.setAttribute('data-set', id);
        r.appendChild(mark ? treeMark(mark) : el('span', 'dcs-mark'));
        r.appendChild(picture(pic));
        r.appendChild(el('span', 'dcs-tree-name', text));
        if (hint) r.title = hint;
        return r;
    }

    /* The fields of a data set in the Designer's two-line layout. */
    function fieldsGrid(set) {
        var head = [
            [{ title: '', rs: 4 }, { title: 'Поле', rs: 4 }, { title: 'Путь', cs: 2 }, { title: 'Ограничение поля', cs: 4 },
                { title: 'Роль', rs: 4 }, { title: 'Выражение представления' }, { title: 'Проверка иерархии:' },
                { title: 'Тип значения' }, { title: 'Оформление' }],
            [{ title: '', rs: 3 }, { title: 'Заголовок', rs: 3 }, { title: 'Поле' }, { title: 'Условие' }, { title: 'Группа' },
                { title: 'Упорядочивание' }, { title: 'Выражения упорядочивания', rs: 3 }, { title: 'Набор данных' },
                { title: 'Доступные значения', rs: 3 }, { title: 'Параметры редактирования', rs: 3 }],
            [{ title: 'Ограничение реквизитов', cs: 4 }, { title: 'Параметр', rs: 2 }],
            [{ title: 'Поле' }, { title: 'Условие' }, { title: 'Группа' }, { title: 'Упорядочивание' }]
        ];
        return stackedGrid([22, 111, 26, 195, 40, 40, 40, 40, 111, 111, 221, 111, 111], head, set.fields, function (f) {
            /* A primitive field has no attributes to restrict. */
            var noAttributes = f.kind === 'folder' || !/[.]/.test(f.type) && !/Ссылка|ref/i.test(f.type);
            var nameCell = el('span', 'dcs-cell-icon' + (f.kind === 'folder' ? ' dcs-folder' : ''));
            if (f.kind === 'folder') nameCell.appendChild(picture('folder'));
            if (f.kind === 'nested') nameCell.appendChild(picture('nested'));
            nameCell.appendChild(f.kind === 'folder' ? el('span', '', f.dataPath) : editText(f.id, 'field', f.field || f.dataPath));
            /* A folder or a nested set has no use restrictions of its own. */
            var plainField = f.kind === 'field';
            return [
                [{ v: treeMark(f.kind === 'folder' ? 'minus' : 'leaf'), rs: 2, cls: 'dcs-center' }, { v: nameCell, rs: 2, cls: 'dcs-f-name' },
                    { v: editText(f.id, 'dataPath', f.dataPath), cs: 2 }].concat(plainField ? editRestrict(f.id, 'restrict', f.restrict, false) : restrictCells(f.restrict, false), [
                    { v: plainField ? editText(f.id, 'role', f.role) : f.role, rs: 2 }, { v: plainField ? editText(f.id, 'presentationExpression', f.presentation) : f.presentation },
                    { v: f.hierarchySet }, { v: plainField ? editText(f.id, 'type', f.type) : f.type },
                    { v: plainField ? editText(f.id, 'appearance', f.appearance) : f.appearance }]),
                [{ v: check(!f.title), cls: 'dcs-center' },
                    { v: editText(f.id, 'title', f.title || lastName(f.dataPath), f.title ? '' : 'dcs-auto') }].concat(
                    plainField ? editRestrict(f.id, 'attrRestrict', f.attrRestrict, noAttributes) : restrictCells(f.attrRestrict, noAttributes), [
                    { v: plainField ? editText(f.id, 'orderExpressions', f.order) : f.order }, { v: f.hierarchyParameter },
                    { v: plainField ? editText(f.id, 'availableValues', f.available) : f.available },
                    { v: plainField ? editText(f.id, 'inputParameters', f.editParameters) : f.editParameters }])
            ];
        }, { cls: 'dcs-fields', empty: set.kind === 'DataSetQuery' && set.autoFill ? 'Поля заполняются автоматически по запросу' : '' });
    }

    function drawSet(set, host) {
        var tools = ['add', 'folder', 'nested', 'copy', 'remove', 'up', 'down'];
        var setTools = toolbar(tools, '', listActions(function (id) { return id.indexOf('field:' + set.id.slice(4) + ':') === 0; }, {
            add: function (b) { addSetField(set, b, 'field'); },
            folder: function (b) { addSetField(set, b, 'folder'); },
            nested: function (b) { addSetField(set, b, 'nested'); }
        }));
        host.appendChild(setTools ? row('', label('Поля:'), el('span', 'dcs-fill'), setTools) : row('', label('Поля:')));
        var fields = fieldsGrid(set);
        host.appendChild(fields);
        if (set.query) {
            if (viewState.fieldsHeight) fields.style.height = viewState.fieldsHeight + 'px';
            host.appendChild(rowSplitter(fields, host));
        }
        if (set.kind === 'DataSetObject') {
            var objName = editText(set.id, 'objectName', set.objectName);
            objName.classList.add('dcs-input');
            var objRow = row('', label('Имя объекта, содержащего данные:'), objName);
            if (editable && options.objectSetColumns && options.onSchemaEdit) {
                var fillButton = el('span', 'dcs-button dcs-object-fill', 'Заполнить по модулю');
                fillButton.title = 'Поля и их типы — по таблице значений, которую модуль объекта передаёт этим набором'
                    + ' в ПроцессорКомпоновкиДанных.Инициализировать (ПриКомпоновкеРезультата)';
                var fillId = set.id;
                fillButton.addEventListener('click', function () { fillObjectSet(fillId); });
                objRow.appendChild(el('span', 'dcs-fill'));
                objRow.appendChild(fillButton);
            }
            host.appendChild(objRow);
        }
        if (set.source && model.sources.length > 1) {
            host.appendChild(row('', label('Источник данных:'), el('span', 'dcs-input', set.source)));
        }
        if (set.query) {
            queryTools = null;
            var queryLine = row('', label('Запрос:'));
            host.appendChild(queryLine);
            host.appendChild(queryBox(set));
            if (queryTools) {
                queryLine.appendChild(el('span', 'dcs-fill'));
                /* Whether the autofill drops the fields the query lost: off unless asked, for this schema. */
                if (options.onSchemaEdit) {
                    var drop = el('span', 'dcs-check-label dcs-remove-missing');
                    var dropBox = check(viewState.removeMissing);
                    dropBox.classList.add('dcs-editable');
                    drop.title = 'Автозаполнение удаляет поля, колонок которых больше нет в запросе';
                    drop.style.cursor = 'pointer';
                    drop.style.marginRight = '16px';
                    drop.appendChild(dropBox);
                    drop.appendChild(el('span', '', 'Удалять поля, которых нет в запросе'));
                    drop.addEventListener('click', function () {
                        viewState.removeMissing = !viewState.removeMissing;
                        dropBox.classList.toggle('dcs-checked', viewState.removeMissing);
                    });
                    queryLine.appendChild(drop);
                }
                var builder = el('span', 'dcs-button dcs-query-builder', 'Конструктор запроса...');
                var tools = queryTools;
                builder.addEventListener('click', function () { tools.openBuilder(); });
                queryLine.appendChild(builder);
            }
            host.appendChild(row('dcs-query-flags', checkLabel(set.autoFill, 'Автозаполнение', set.id, 'autoFillFields'),
                checkLabel(set.useQueryGroup, 'Использовать группировки запроса если возможно', set.id, 'useQueryGroupIfPossible')));
        }
    }

    /* A drag bar under the fields grid: it trades height between the fields and
     * the query below, and the height outlives switching sets and tabs. */
    function rowSplitter(pane, host) {
        var bar = el('div', 'dcs-row-splitter');
        bar.title = 'Перетащите, чтобы изменить высоту';
        bar.addEventListener('pointerdown', function (e) {
            if (e.button !== 0) return;
            e.preventDefault();
            var startY = e.clientY;
            var startH = pane.getBoundingClientRect().height;
            /* The query area stretches into whatever is left; it keeps its 80px minimum. */
            var query = host.querySelector('.dcs-query-area');
            var maxH = startH + (query ? query.getBoundingClientRect().height - 80 : 0);
            bar.setPointerCapture(e.pointerId);
            bar.classList.add('dcs-dragging');
            function move(ev) {
                var h = Math.round(Math.min(Math.max(startH + ev.clientY - startY, 60), Math.max(60, maxH)));
                pane.style.height = h + 'px';
                viewState.fieldsHeight = h;
            }
            function up() {
                bar.classList.remove('dcs-dragging');
                bar.removeEventListener('pointermove', move);
                bar.removeEventListener('pointerup', up);
                bar.removeEventListener('pointercancel', up);
            }
            bar.addEventListener('pointermove', move);
            bar.addEventListener('pointerup', up);
            bar.addEventListener('pointercancel', up);
        });
        return bar;
    }

    /* The query of a set. Where the host edits the schema, the text typed here
     * and the query designer's result go into <query> as the typing pauses;
     * the window keeps its editor and only takes the new source in. */
    function queryBox(set) {
        var area = el('div', 'dcs-query-area');
        var canWrite = editable && propertyValue(model, set.id, 'query') !== null;
        var setId = set.id;
        var editor = options.queryEditor ? options.queryEditor(area, set.query.text, {
            readOnly: !canWrite,
            onChange: canWrite ? function (text) { return commitQuiet(setId, 'query', text); } : null,
            onSettle: canWrite && options.onSchemaEdit ? function () { autoFill(setId); } : null
        }) : null;
        if (editor) {
            disposers.push(function () { if (editor.dispose) editor.dispose(); });
            if (canWrite && editor.openBuilder) queryTools = editor;
        } else area.appendChild(highlightQuery(set.query.text));
        return area;
    }

    /* The Designer's autofill once a query is written (the editor left, the
     * query designer closed): the set's fields follow its columns and new
     * parameters are added, in one undoable edit; only the fields grid is
     * redrawn, so the query editor and whatever was clicked stay. The status
     * line tells what changed and which fields without a column were kept
     * for their settings. Nothing is done while the query does not parse. */
    function autoFill(setId) {
        if (!alive || !root.BslQueryBuilderCore) return;
        var set = findSet(model.sets, setId);
        if (!set || set.kind !== 'DataSetQuery' || !set.autoFill || !set.query) return;
        if (!queryResult(set.query.text)) {
            if (set.query.text.trim()) flash('Запрос не разобран — поля набора не обновлены', 6000);
            return;
        }
        var info = null;
        var res = options.onSchemaEdit(function (fresh) {
            info = autoFillEdit(scopeModel(fresh, scope) || fresh, setId, { removeMissing: viewState.removeMissing });
            return info && !info.none ? info : null;
        });
        if (res && res.source != null) {
            var parsed = parse(res.source);
            var shown = parsed.model && scopeModel(parsed.model, scope);
            if (shown) {
                rootModel = parsed.model;
                model = shown;
                flat = allSets(model.sets, 0, []);
                fieldTree = availableFields(model);
                var fresh = findSet(model.sets, setId);
                var old = page.querySelector('.dcs-fields');
                if (fresh && old && old.parentNode) {
                    var grid = fieldsGrid(fresh);
                    grid.style.height = old.style.height;
                    old.parentNode.replaceChild(grid, old);
                    collectRows(page);
                }
                notify(viewState.selected || setId);
            }
        }
        if (!info) return;
        var told = [];
        if (info.added.length) told.push('добавлены поля: ' + info.added.join(', '));
        if (info.removed.length) told.push('удалены поля: ' + info.removed.join(', '));
        if (info.parameters.length) told.push('добавлены параметры: ' + info.parameters.join(', '));
        if (info.stale.length) told.push('нет в запросе, оставлены из-за настроек: ' + info.stale.join(', '));
        if (info.absent.length) told.push('нет в запросе (не удалены): ' + info.absent.join(', '));
        if (told.length) flash('Автозаполнение: ' + told.join('; '), 10000);
    }

    /* «Заполнить по модулю» of an object set: the host analyses the object's
     * module (options.objectSetColumns() -> { sets: { name: { columns, partial } },
     * method, line, notes } | { error }); the table passed under the set's
     * object name fills its fields in one undoable edit; the status line tells
     * what was added and typed, which columns have no type the analysis knows,
     * which fields the table lacks. */
    function fillObjectSet(setId) {
        var set = findSet(model.sets, setId);
        if (!set || !alive) return;
        flash('Анализ модуля объекта…', 120000);
        var fail = function (text) { if (alive) flash(text, 15000); };
        Promise.resolve().then(function () { return options.objectSetColumns(); }).then(function (res) {
            if (!alive) return;
            if (!res || res.error) { fail('Поля не заполнены: ' + ((res && res.error) || 'модуль объекта не разобран')); return; }
            var notes = (res.notes || []).length ? ' Замечания анализа: ' + res.notes.join('; ') + '.' : '';
            var cur = findSet(model.sets, setId);
            var wanted = String((cur && cur.objectName) || '').toLowerCase();
            var keys = Object.keys(res.sets || {});
            var key = keys.filter(function (k) { return k.toLowerCase() === wanted; })[0];
            if (!key) {
                fail('Модуль не передаёт набор «' + ((cur && cur.objectName) || '') + '»'
                    + (keys.length ? ' (передаёт: ' + keys.join(', ') + ')' : '') + '.' + notes);
                return;
            }
            var table = res.sets[key];
            var info = null;
            var r = options.onSchemaEdit(function (fresh) {
                info = objectFieldsEdit(scopeModel(fresh, scope) || fresh, setId, table.columns);
                return info && !info.none ? info : null;
            });
            if (r && r.error) { fail('Поля не заполнены: ' + r.error); return; }
            if (r && r.source != null) reload(r.source);
            if (!info) return;
            var told = [];
            if (info.added.length) told.push('добавлены поля: ' + info.added.join(', '));
            if (info.typed.length) told.push('указан тип: ' + info.typed.join(', '));
            if (!info.added.length && !info.typed.length) told.push('поля уже соответствуют таблице');
            var untyped = table.columns.filter(function (c) { return !c.type; }).map(function (c) { return c.name; });
            if (untyped.length) told.push('тип не определён: ' + untyped.join(', '));
            if (info.absent.length) told.push('нет в таблице: ' + info.absent.join(', '));
            if (table.partial) told.push('часть колонок модуль добавляет под вычисляемыми именами');
            flash('По модулю (' + res.method + ', строка ' + res.line + '): ' + told.join('; ') + '.' + notes, 20000);
        }, function (err) { fail('Поля не заполнены: ' + ((err && err.message) || err)); });
    }

    /* A change whose editor stays open: the source is taken in without a redraw. */
    function commitQuiet(id, prop, value) {
        if (!alive) return null;
        var res = options.onPropertyEdit(id, prop, value);
        if (res && res.source != null) {
            var parsed = parse(res.source);
            if (parsed.model && scopeModel(parsed.model, scope)) {
                rootModel = parsed.model;
                model = scopeModel(parsed.model, scope);
                flat = allSets(model.sets, 0, []);
                fieldTree = availableFields(model);
            }
        }
        return res || null;
    }

    // ---------------------------------------------------- simple tables

    function drawTable(tools, g, actions) {
        var bar = tools ? toolbar(tools, '', actions) : null;
        if (bar) page.appendChild(bar);
        page.appendChild(g);
        collectRows(page);
    }

    function col(title, width, key) {
        return { title: title, width: width, get: typeof key === 'function' ? key : function (r) { return r[key]; } };
    }

    function checkCol(title, width, key) {
        return { title: title, width: width, get: function (r) { return check(r[key]); } };
    }

    function editCheckCol(title, width, key, prop) {
        return { title: title, width: width, get: function (r) { return editCheck(r.id, prop, r[key]); } };
    }

    function drawLinks() {
        drawTable(['add', 'copy', 'remove', 'up', 'down'], grid([
            col('Источник связи', 171, function (r) { return editText(r.id, 'sourceDataSet', r.source); }),
            col('Приемник связи', 171, function (r) { return editText(r.id, 'destinationDataSet', r.dest); }),
            col('Выражение источник', 171, function (r) { return editText(r.id, 'sourceExpression', r.sourceExpr); }),
            col('Выражение приемник', 171, function (r) { return editText(r.id, 'destinationExpression', r.destExpr); }),
            col('Параметр', 171, function (r) { return editText(r.id, 'parameter', r.parameter); }),
            editCheckCol('Список параметров', 171, 'parameterList', 'parameterListAllowed'),
            col('Условие связи', 171, function (r) { return editText(r.id, 'linkConditionExpression', r.condition); }),
            col('Начальное значение связи', 171, function (r) { return editText(r.id, 'startExpression', r.start); }),
            editCheckCol('Обязательная связь', 34, 'required', 'required')
        ], model.links, { cls: 'dcs-full' }), listActions(function (id) { return id.indexOf('link:') === 0; }, { add: addLink }));
    }

    function drawCalculated() {
        var head = [
            [{ title: 'Путь к данным', rs: 2 }, { title: 'Выражение', rs: 2 }, { title: 'Заголовок', rs: 2 },
                { title: 'Ограничение доступности', cs: 4 }, { title: 'Выражение представления', rs: 2 },
                { title: 'Выражения упорядочивания', rs: 2 }, { title: 'Тип значения', rs: 2 },
                { title: 'Доступные значения', rs: 2 }, { title: 'Оформление' }],
            [{ title: 'Поле' }, { title: 'Условие' }, { title: 'Группа' }, { title: 'Упорядочивание' }, { title: 'Параметры ввода' }]
        ];
        drawTable(['add', 'copy', 'remove', 'up', 'down'], stackedGrid([148, 148, 148, 54, 54, 54, 52, 148, 148, 148, 148, 152], head,
            model.calculated, function (c) {
                return [
                    [{ v: editText(c.id, 'dataPath', c.dataPath), rs: 2 }, { v: editText(c.id, 'expression', c.expression), rs: 2 },
                        { v: editText(c.id, 'title', c.title || lastName(c.dataPath), c.title ? '' : 'dcs-auto'), rs: 2 }]
                        .concat(editRestrict(c.id, 'restrict', c.restrict, false).map(function (x) { x.rs = 2; return x; }), [
                        { v: editText(c.id, 'presentationExpression', c.presentation), rs: 2 }, { v: editText(c.id, 'orderExpressions', c.order), rs: 2 },
                        { v: editText(c.id, 'type', c.type), rs: 2 }, { v: editText(c.id, 'availableValues', c.available), rs: 2 },
                        { v: editText(c.id, 'appearance', c.appearance) }]),
                    [{ v: editText(c.id, 'inputParameters', c.editParameters) }]
                ];
            }, { cls: 'dcs-full' }), listActions(function (id) { return id.indexOf('calc:') === 0; }, { add: addCalculated }));
    }

    function drawTotals() {
        var bar = toolbar(['add', 'copy', 'remove', 'up', 'down'], '', listActions(function (id) { return id.indexOf('total:') === 0; }, { add: function (b) { addTotal(b); } }));
        if (bar) page.appendChild(bar);
        var split = el('div', 'dcs-split dcs-totals');
        var panel = fieldsPanel(null, adding ? function (path) { addTotal(null, path); } : null);
        split.appendChild(panel);
        split.appendChild(grid([
            col('Поле', 325, function (r) { return r.dataPath; }),
            col('Выражение', 309, function (r) { return editText(r.id, 'expression', r.expression); }),
            col('Рассчитывать по...', 320, function (r) { return editText(r.id, 'groups', r.groups.join(', ')); })
        ], model.totals, { cls: 'dcs-full' }));
        page.appendChild(split);
        collectRows(page);
    }

    function drawParameters() {
        drawTable(['add', 'copy', 'remove', 'up', 'down'], grid([
            col('Имя', 125, 'name'),
            col('Заголовок', 125, function (r) { return editText(r.id, 'title', r.title || terms.identWords(r.name) || r.name, r.title ? '' : 'dcs-auto'); }),
            col('Тип', 150, function (r) { return editText(r.id, 'type', r.type); }),
            col('Доступные значения', 125, function (r) { return editText(r.id, 'availableValues', r.available); }), checkCol('Доступен список значений', 31, 'valueList'),
            col('Значение', 150, function (r) { return r.simpleValue ? editText(r.id, 'value', r.value) : editText(r.id, 'paramValue', r.value); }),
            col('Выражение', 130, function (r) { return editText(r.id, 'expression', r.expression); }),
            col('Параметр функциональной опции', 125, 'functionalOption'),
            editCheckCol('Включать в доступные поля', 31, 'availableAsField', 'availableAsField'),
            editCheckCol('Ограничение доступности', 31, 'restricted', 'useRestriction'),
            editCheckCol('Запрещать незаполненные значения', 31, 'denyIncomplete', 'denyIncompleteValues'),
            col('Использование', 113, function (r) { return editText(r.id, 'use', r.use); }),
            col('Параметры редактирования', 235, function (r) { return editText(r.id, 'inputParameters', r.editParameters); })
        ], model.parameters, { cls: 'dcs-full' }), listActions(function (id) { return id.indexOf('param:') === 0; }, { add: addParameter }));
    }

    /* A new area or binding of an area. */
    function addTemplate(button) {
        var areas = model.templates.filter(function (t) { return t.tag === 'template' || t.defId; }).map(function (t) { return t.name; })
            .filter(function (n, i, all) { return n && all.indexOf(n) === i; });
        var hints = Object.keys(groupingNames(model)).concat(fieldPaths());
        addForm(button, 'Новый макет', [
            { key: 'kind', label: 'Вид', value: 'group', choices: [{ value: 'group', title: 'Макет группировки' }, { value: 'groupHeader', title: 'Макет заголовка группировки' },
                { value: 'field', title: 'Макет поля' }, { value: 'area', title: 'Макет (область без привязки)' }] },
            { key: 'target', label: 'Группировка или поле', hints: hints, placeholder: 'имя группировки или путь поля' },
            { key: 'templateType', label: 'Тип', value: 'Header', choices: Object.keys(TEMPLATE_TYPES).map(function (k) { return { value: k, title: TEMPLATE_TYPES[k] }; }) },
            { key: 'area', label: 'Область', value: '', choices: [{ value: '', title: 'Новая область' }].concat(areas.map(function (n) { return { value: n, title: n }; })) }
        ], function (v) {
            var res = commitAdd('template', null, v);
            if (res && res.id) { viewState.template = res.id; showTab('templates'); markSelected(res.id); }
            return res;
        });
    }

    /* A binding: what it is bound to, its type, the area it outputs. */
    function openBinding(id) {
        var b = templateBindingOf(model, id);
        if (!b) { flash('Выберите макет группировки или поля'); return; }
        var areas = model.templates.filter(function (t) { return t.tag === 'template' || t.defId; }).map(function (t) { return t.name; })
            .filter(function (n, i, all) { return n && all.indexOf(n) === i; });
        var form = el('div', 'dcs-form-grid');
        var input = function (labelText, value, hint) {
            form.appendChild(el('span', 'dcs-add-label', labelText));
            var x = el('input', 'dcs-add-input');
            x.type = 'text';
            x.value = value || '';
            if (hint) x.placeholder = hint;
            form.appendChild(x);
            return x;
        };
        var select = function (labelText, value, map) {
            form.appendChild(el('span', 'dcs-add-label', labelText));
            var x = el('select', 'dcs-add-input');
            Object.keys(map).forEach(function (k) { var o = el('option', '', map[k]); o.value = k; if (k === value) o.selected = true; x.appendChild(o); });
            form.appendChild(x);
            return x;
        };
        var target = input(b.kind === 'field' ? 'Поле' : 'Группировка или поле', b.target, b.simple ? '' : 'несколько группировок — меняются в конфигураторе');
        target.disabled = !b.simple;
        var type = b.kind === 'field' ? null : select('Тип', b.templateType, TEMPLATE_TYPES);
        var areaMap = {};
        areas.forEach(function (n) { areaMap[n] = n; });
        var area = select('Область', b.area, areaMap);
        modal(b.kind === 'field' ? 'Макет поля' : b.kind === 'groupHeader' ? 'Макет заголовка группировки' : 'Макет группировки', form, function () {
            return act({ op: 'templateBinding', id: id, data: { kind: b.kind, target: b.simple ? target.value.trim() : b.target, templateType: type ? type.value : '', area: area.value } }) || null;
        });
    }

    /* The parameters of an area: expressions and details. */
    function openTemplateParams(defId) {
        var rows = templateParams(model, defId);
        if (!rows) { flash('Выберите макет'); return; }
        var env = { context: 'template', fields: availableFields(model), title: 'Выражение параметра макета',
            parameters: model.parameters.map(function (x) { return { name: x.name, title: x.title, type: x.type }; }) };
        var editor = rowsEditor([
            { key: 'kind', title: 'Вид', width: 120, kind: 'choice', redraw: true, choices: [{ value: 'expression', title: 'Выражение' }, { value: 'details', title: 'Расшифровка' }],
                onChange: function (r) { if (r.kind === 'details' && !(r.fields || []).length) r.fields = [{ field: r.name, expression: r.name }]; r.keep = null; } },
            { key: 'name', title: 'Имя', width: 170 },
            { key: 'expression', title: 'Выражение / поля расшифровки', kind: function (r) { return r.kind === 'details' ? 'button' : 'expression'; }, env: env,
                text: function (r) { return (r.fields || []).map(function (f) { return f.field + (f.expression && f.expression !== f.field ? ' = ' + f.expression : ''); }).join('; ') || 'Задать…'; },
                press: function (r, done) {
                    var fields = rowsEditor([{ key: 'field', title: 'Поле', width: 200 }, { key: 'expression', title: 'Выражение', kind: 'expression', env: env }],
                        r.fields || [], function () { return { field: '', expression: '' }; });
                    var box = el('div');
                    box.appendChild(fields.element);
                    var f2 = el('div', 'dcs-form-grid');
                    f2.appendChild(el('span', 'dcs-add-label', 'Основное действие'));
                    var act2 = el('select', 'dcs-add-input');
                    Object.keys(MAIN_ACTIONS).forEach(function (k) { var o = el('option', '', MAIN_ACTIONS[k]); o.value = k; if (k === (r.mainAction || '')) o.selected = true; act2.appendChild(o); });
                    f2.appendChild(act2);
                    box.appendChild(f2);
                    modal('Расшифровка «' + r.name + '»', box, function () {
                        r.fields = fields.rows().filter(function (x) { return String(x.field || '').trim(); });
                        r.mainAction = act2.value;
                        done();
                        return null;
                    }, 'dcs-modal-wide dcs-modal-sub');
                } }
        ], rows, function () { return { kind: 'expression', name: '', expression: '', fields: [], mainAction: '' }; });
        modal('Параметры макета', editor.element, function () {
            return act({ op: 'templateParams', id: defId, rows: editor.rows() }) || null;
        }, 'dcs-modal-wide');
    }

    /* A cell of an area: a text, a parameter or nothing, and its appearance. */
    function openCell(id, defId) {
        var c = cellOf(model, id);
        if (!c) return;
        var body = el('div', 'dcs-ca');
        var form = el('div', 'dcs-form-grid');
        form.appendChild(el('span', 'dcs-add-label', 'Содержимое'));
        var kind = el('select', 'dcs-add-input');
        [['text', 'Текст'], ['parameter', 'Параметр'], ['empty', 'Пусто']].concat(c.kind === 'mixed' ? [['mixed', 'Несколько полей (меняются в конфигураторе)']] : []).forEach(function (k) {
            var o = el('option', '', k[1]);
            o.value = k[0];
            if (k[0] === c.kind) o.selected = true;
            kind.appendChild(o);
        });
        form.appendChild(kind);
        form.appendChild(el('span', 'dcs-add-label', 'Значение'));
        var value = el('input', 'dcs-add-input');
        value.type = 'text';
        value.value = c.value;
        var names = (templateParams(model, defId) || []).map(function (x) { return x.name; });
        if (names.length) {
            var dl = el('datalist');
            dl.id = 'dcs-hints-' + (++hintLists);
            names.forEach(function (n) { var o = el('option'); o.value = n; dl.appendChild(o); });
            form.appendChild(dl);
            value.setAttribute('list', dl.id);
        }
        form.appendChild(value);
        kind.disabled = c.kind === 'mixed';
        var sync = function () { value.disabled = kind.value === 'empty' || kind.value === 'mixed'; value.placeholder = kind.value === 'parameter' ? 'имя параметра макета' : ''; };
        kind.addEventListener('change', sync);
        sync();
        body.appendChild(form);
        var looks = parametersRows(PARAMETER_KINDS.appearance, c.appearance || []);
        body.appendChild(section('Оформление', looks.element));
        modal('Ячейка области', body, function () {
            return act({ op: 'cell', id: id, data: { kind: kind.value, value: value.value, appearance: looks.rows(), keep: c.keep } }) || null;
        }, 'dcs-modal-wide');
    }

    function drawTemplates() {
        var split = el('div', 'dcs-split dcs-templates');
        var left = el('div', 'dcs-column dcs-templates-left');
        var current = null;
        for (var i = 0; i < model.templates.length; i++) if (model.templates[i].id === viewState.template) current = model.templates[i];
        if (!current) current = model.templates[0] || null;
        var tplTest = function (id) { return id.indexOf('tpl:') === 0; };
        var listBar = toolbar(['addMenu', 'edit', 'remove'], '', listActions(tplTest, {
            addMenu: addTemplate,
            edit: function () { var id = selectedIn(tplTest) || (current && current.id); if (id) openBinding(id); }
        }));
        if (listBar) left.appendChild(listBar);
        var list = grid([col('Макет', 308, 'title'), col('Область', 150, 'name')],
            model.templates, { cls: 'dcs-template-list' });
        left.appendChild(list);
        var defId = current && current.defId;
        var paramsBar = defId ? toolbar(['edit'], '', adding ? { edit: function () { openTemplateParams(defId); } } : null) : null;
        left.appendChild(paramsBar ? row('', label('Параметры макета:'), el('span', 'dcs-fill'), paramsBar) : label('Параметры макета:'));
        var params = grid([col('Имя параметра', 221, 'name'), col('Выражение', 221, 'expression')],
            current ? current.parameters : [], { cls: 'dcs-template-params' });
        if (adding && defId) params.addEventListener('dblclick', function () { openTemplateParams(defId); });
        left.appendChild(params);
        split.appendChild(left);
        var right = el('div', 'dcs-column dcs-sheet-column');
        var cellTest = function (id) { return id.indexOf('cell:') === 0; };
        var sheetBar = defId ? toolbar(['rowAdd', 'cellAdd', 'left', 'right', 'cellRemove', 'rowRemove'], '', adding ? {
            rowAdd: function () {
                var sel = selectedIn(cellTest);
                var m2 = sel && /^cell:.*:(\d+):\d+$/.exec(sel);
                act({ op: 'areaRow', id: defId, after: m2 ? +m2[1] : -1 });
            },
            cellAdd: function () { var sel = selectedIn(cellTest); if (sel) act({ op: 'areaCell', id: sel }); else flash('Выберите ячейку'); },
            left: function () { var sel = selectedIn(cellTest); if (sel) act({ op: 'move', id: sel, dir: -1 }); },
            right: function () { var sel = selectedIn(cellTest); if (sel) act({ op: 'move', id: sel, dir: 1 }); },
            cellRemove: function () { var sel = selectedIn(cellTest); if (sel) act({ op: 'remove', id: sel }); else flash('Выберите ячейку'); },
            rowRemove: function () {
                var sel = selectedIn(cellTest);
                var m2 = sel && /^cell:(.*):(\d+):\d+$/.exec(sel);
                if (m2) act({ op: 'remove', id: 'arow:' + m2[1] + ':' + m2[2] }); else flash('Выберите ячейку строки');
            }
        } : null) : null;
        if (sheetBar) right.appendChild(sheetBar);
        var sheet = el('div', 'dcs-sheet');
        sheet.appendChild(drawArea(current));
        right.appendChild(sheet);
        split.appendChild(right);
        page.appendChild(split);
        collectRows(page);
        if (adding && defId) {
            sheet.addEventListener('dblclick', function (e) {
                var td = e.target.closest && e.target.closest('[data-id]');
                if (td && cellTest(td.getAttribute('data-id'))) openCell(td.getAttribute('data-id'), defId);
            });
        }
        if (current && rowsById[current.id]) rowsById[current.id].classList.add('dcs-current');
        list.addEventListener('click', function (e) {
            var r = e.target.closest && e.target.closest('[data-id]');
            if (!r) return;
            var id = r.getAttribute('data-id');
            if (id === viewState.template) return;
            viewState.template = id;
            showTab('templates');
            markSelected(id);
        });
    }

    /* The area of the selected template, drawn on its own: rows of cells with
     * the widths the appearance states. The Designer instead lays all areas of
     * the template into one spreadsheet and gives each an address there, which
     * the schema does not store; pictures and style colours are named in the
     * hint of a cell, as the window cannot resolve them. */
    function drawArea(tpl) {
        var box = el('div', 'dcs-area');
        if (!tpl || !tpl.area) {
            box.appendChild(el('div', 'dcs-grid-empty', tpl ? 'Область пуста' : 'Макетов нет'));
            return box;
        }
        var table = el('table', 'dcs-area-table');
        for (var r = 0; r < tpl.area.rows.length; r++) {
            var tr = el('tr');
            var cells = tpl.area.rows[r].cells;
            for (var c = 0; c < cells.length; c++) {
                var cell = cells[c];
                var td = el('td', 'dcs-area-cell'
                    + (cell.rotated ? ' dcs-area-rotated' : '')
                    + (cell.wrap ? ' dcs-area-wrap' : '')
                    + (cell.picture ? ' dcs-area-picture' : ''));
                if (cell.id) td.setAttribute('data-id', cell.id);

                if (cell.valign) td.style.verticalAlign = cell.valign;
                if (cell.halign) td.style.textAlign = cell.halign;
                if (cell.indent) td.style.paddingLeft = (3 + cell.indent * AREA_CHAR_PX) + 'px';
                var text = cell.kind === 'param' ? '<' + cell.text + '>' : cell.text;
                var span = el('span', 'dcs-area-text', text);
                /* The width belongs to the text, not to the cell: the Designer
                 * cuts a value the column cannot hold, and a table cell of
                 * its own width would grow instead. */
                if (cell.width) span.style.width = Math.round(cell.width * AREA_CHAR_PX) + 'px';
                td.appendChild(span);
                if (cell.note) td.title = cell.note;
                tr.appendChild(td);
            }
            if (!cells.length) tr.appendChild(el('td', 'dcs-area-cell'));
            table.appendChild(tr);
        }
        box.appendChild(table);
        return box;
    }

    function addNested(button) {
        addForm(button, 'Новая вложенная схема', [
            { key: 'name', label: 'Имя', placeholder: 'ВложеннаяСхема1' },
            { key: 'title', label: 'Заголовок' }
        ], function (v) { return commitAdd('nested', null, v); });
    }

    /* The nested schema opens in this window, as the Designer opens it in
     * one of its own; the path in the caption leads back. */
    function drawNested() {
        drawTable(['add', 'copy', 'remove', 'up', 'down'], grid([
            col('Имя', 300, function (r) { return editText(r.id, 'name', r.name); }),
            col('Заголовок', 300, function (r) { return editText(r.id, 'title', r.title || terms.identWords(r.name) || r.name, r.title ? '' : 'dcs-auto'); }),
            col('Схема', 380, function (r) {
                var cell = el('span', 'dcs-cell-icon');
                var open = el('span', 'dcs-link', 'Открыть схему');
                open.setAttribute('data-scope', scope + r.name + '/');
                open.title = r.setNames.length ? 'Наборы данных: ' + r.setNames.join(', ') : 'Схема пуста';
                cell.appendChild(open);
                if (r.setNames.length) cell.appendChild(el('span', 'dcs-hint', ' ' + r.setNames.join(', ')));
                return cell;
            }),
            col('Настройки', 200, function (r) { return r.settings ? 'Заданы' : ''; })
        ], model.nested, { cls: 'dcs-full' }), listActions(function (id) { return id.indexOf('nested:') === 0; }, { add: addNested }));
        /* The page outlives its redraws: one listener serves them all. */
        if (page._dcsScopes) return;
        page._dcsScopes = true;
        page.addEventListener('click', function (e) {
            var link = e.target.closest && e.target.closest('[data-scope]');
            if (link && page.contains(link)) { e.stopPropagation(); openScope(link.getAttribute('data-scope')); }
        });
    }

    // --------------------------------------------------------- settings

    /* The Designer's tabs under the structure, in its order. */
    var SETTINGS_TABS = [
        { id: 'groupFields', title: 'Поля группировки', group: true },
        { id: 'selection', title: 'Выбранные поля' },
        { id: 'filter', title: 'Отбор' },
        { id: 'order', title: 'Сортировка' },
        { id: 'appearance', title: 'Условное оформление' },
        { id: 'userFields', title: 'Пользовательские поля', root: true },
        { id: 'dataParameters', title: 'Параметры данных', root: true, parameters: true },
        { id: 'outputParameters', title: 'Другие настройки' }
    ];

    function findNode(node, id) {
        if (!node) return null;
        if (node.id === id) return node;
        for (var i = 0; i < node.children.length; i++) {
            var hit = findNode(node.children[i], id);
            if (hit) return hit;
        }
        return null;
    }

    function drawSettings() {
        var wrap = el('div', 'dcs-split dcs-settings');
        var left = el('div', 'dcs-column dcs-variants');
        var variant = model.variants.length ? model.variants[Math.min(viewState.variant, model.variants.length - 1)] : null;
        var variantBar = toolbar(['add', 'copy', 'remove'], '', listActions(function (id) { return /^variant:\d+$/.test(id); }, { add: addVariant }));
        if (variantBar) left.appendChild(variantBar);
        var variants = grid([col('Имя варианта', 148, function (r) { return editText(r.id, 'name', r.name); }),
            col('Представление', 148, function (r) { return editText(r.id, 'presentation', r.presentation); })],
            model.variants, { cls: 'dcs-variant-list' });
        left.appendChild(variants);
        wrap.appendChild(left);
        variants.addEventListener('click', function (e) {
            var r = e.target.closest && e.target.closest('[data-id]');
            if (!r) return;
            for (var v = 0; v < model.variants.length; v++) {
                if (model.variants[v].id !== r.getAttribute('data-id')) continue;
                viewState.variant = v;
                viewState.node = '';
                showTab('settings');
                markSelected(model.variants[v].id);
                notify(model.variants[v].id);
            }
        });
        var right = el('div', 'dcs-column dcs-settings-right');
        wrap.appendChild(right);
        page.appendChild(wrap);
        var rootNode = variant && variant.root;
        var node = findNode(rootNode, viewState.node) || rootNode;
        viewState.node = node ? node.id : '';

        var nodeTest = function (id) { return !!variant && id.indexOf(variant.id + '/s.') === 0 && id.indexOf('|') < 0; };
        var structureBar = toolbar(['add', 'remove', 'up', 'down', 'user'], '', listActions(nodeTest, {
            user: function () {
                if (node && userSettingSpot(model, node.id)) openUserSetting(node.id);
                else flash('Выберите группировку, таблицу или диаграмму');
            },
            add: function (b) {
                if (!rootNode) return;
                /* An axis row (Строки, Колонки) stands for its table: the grouping goes into it. */
                var axisHit = node && node.kind === 'axis' ? /^(.*)\.(row|column|point|series)$/.exec(node.id) : null;
                if (axisHit) { addAxisGrouping(b, axisHit[1], axisHit[2]); return; }
                if (node && (node.kind === 'table' || node.kind === 'chart')) { addAxisGrouping(b, node.id, ''); return; }
                var at = node && (node.kind === 'root' || node.kind === 'group') && own(model.source.owners, node.id) ? node.id : rootNode.id;
                addStructureItem(b, at);
            }
        }));
        if (structureBar) right.appendChild(structureBar);
        var tree = el('div', 'dcs-tree dcs-structure');
        function addNode(n, depth) {
            var r = el('div', 'dcs-tree-row' + (n === node ? ' dcs-current' : '') + (n.use ? '' : ' dcs-unused'));
            r.style.paddingLeft = (4 + depth * 20) + 'px';
            r.setAttribute('data-id', n.id);
            r.setAttribute('data-node', n.id);
            r.appendChild(treeMark(n.children.length && n.kind !== 'root' ? 'minus' : ''));
            if (n.kind !== 'root' && n.kind !== 'axis') r.appendChild(editCheck(n.id, 'use', n.use));
            r.appendChild(picture(n.kind === 'group' ? 'groupNode' : n.kind));
            r.appendChild(el('span', 'dcs-tree-name' + (n.detail ? ' dcs-detail' : ''), n.detail ? '<' + n.title + '>' : n.title));
            tree.appendChild(r);
            for (var i = 0; i < n.children.length; i++) addNode(n.children[i], depth + 1);
        }
        if (rootNode) addNode(rootNode, 0);
        right.appendChild(tree);
        tree.addEventListener('click', function (e) {
            var r = e.target.closest && e.target.closest('[data-node]');
            if (!r) return;
            viewState.node = r.getAttribute('data-node');
            showTab('settings');
            markSelected(viewState.node);
            notify(viewState.node);
        });
        if (node) {
            var title = node.detail ? '<' + node.title + '>' : node.title;
            right.appendChild(row('dcs-node-line', label('Настройки:'), el('span', 'dcs-chip', title), el('span', 'dcs-node-title', title)));
            right.appendChild(nodeSettings(node, node === rootNode));
        }
        collectRows(left);
        var rows = tree.querySelectorAll('[data-id]');
        for (var r = 0; r < rows.length; r++) rowsById[rows[r].getAttribute('data-id')] = rows[r];
        if (variant && rowsById[variant.id]) rowsById[variant.id].classList.add('dcs-current');
    }

    function nodeSettings(node, isRoot) {
        var box = el('div', 'dcs-node-settings');
        var tabs = el('div', 'dcs-tabs dcs-subtabs');
        var body = el('div', 'dcs-subpage');
        var shown = SETTINGS_TABS.filter(function (t) {
            if (t.root && !isRoot) return false;
            if (t.group && node.kind !== 'group') return false;
            if (t.parameters && !model.parameters.length && !node.dataParameters.length) return false;
            if (node.kind === 'axis') return false;
            /* Group fields stay: an empty list is «Детальные записи», not nothing;
             * where the schema is edited every page is there to be filled. */
            return t.id === 'groupFields' || adding || (node[t.id] || []).length > 0;
        });
        if (!shown.length) {
            body.appendChild(el('div', 'dcs-grid-empty', 'Выберите группировку'));
            box.appendChild(body);
            return box;
        }
        var active = shown.filter(function (t) { return t.id === viewState.settingsTab; })[0] || shown[0];
        shown.forEach(function (t) {
            var b = el('div', 'dcs-tab' + (t === active ? ' dcs-tab-active' : ''), t.title);
            b.addEventListener('click', function () {
                viewState.settingsTab = t.id;
                box.parentNode.replaceChild(nodeSettings(node, isRoot), box);
            });
            tabs.appendChild(b);
        });
        box.appendChild(tabs);
        box.appendChild(body);
        body.appendChild(settingsPage(active.id, node[active.id] || [], node));
        return box;
    }

    /* A settings page: the available fields where the Designer offers them,
     * the grid and the grid's command bar down its right side. */
    function settingsPage(kind, rows, node) {
        var pageBox = el('div', 'dcs-split dcs-settings-page');
        var listId = node.id + '|' + kind;
        var listed = kind === 'selection' || kind === 'filter' || kind === 'order' || kind === 'groupFields';
        var canList = listed && !!own(model.source.owners, listId);
        if (listed) {
            pageBox.appendChild(fieldsPanel(kind === 'selection' ? [SYSTEM_FIELDS]
                : kind === 'filter' && model.parameters.length ? [DATA_PARAMETERS] : [],
                adding && canList ? function (path) {
                    var sel = selectedIn(function (id) { return id.indexOf(listId + ':') === 0; });
                    var o = sel && own(model.source.owners, sel);
                    var t = o && xsiType(o.el);
                    addSettingsItem(null, kind, t === 'SelectedItemFolder' || t === 'FilterItemGroup' ? sel : listId, path);
                } : null));
        }
        var gridBox = el('div', 'dcs-column dcs-settings-list');
        var test = function (id) { return id.indexOf(listId + ':') === 0; };
        /* A new item goes into the selected folder (filter group) of the list, else into the list. */
        var into = function () {
            var sel = selectedIn(test);
            var o = sel && own(model.source.owners, sel);
            var t = o && xsiType(o.el);
            return t === 'SelectedItemFolder' || t === 'FilterItemGroup' ? sel : listId;
        };
        var extra = {};
        if (canList) extra.add = function (b) { addSettingsItem(b, kind, into(), ''); };
        if (canList && kind === 'selection') extra.folder = function (b) {
            addForm(b, 'Новая папка выбранных полей', [{ key: 'title', label: 'Заголовок', value: 'Группа' },
                { key: 'placement', label: 'Расположение', value: 'Auto', choices: Object.keys(PLACEMENTS).map(function (k) { return { value: k, title: PLACEMENTS[k] }; }) }],
                function (v) { return commitAdd('selectionFolder', into(), v); });
        };
        if (canList && kind === 'filter') extra.group = function (b) {
            addForm(b, 'Новая группа условий', [{ key: 'groupType', label: 'Вид', value: 'AndGroup',
                choices: Object.keys(FILTER_GROUPS).map(function (k) { return { value: k, title: FILTER_GROUPS[k] }; }) }],
                function (v) { return commitAdd('filterGroup', into(), v); });
        };
        if (kind === 'outputParameters' && parameterList(model, listId, 'outputParameters')) {
            extra.edit = function () { openParameters(listId, 'outputParameters'); };
        }
        if (kind === 'userFields' && adding) {
            extra.add = function (b) {
                addForm(b, 'Новое пользовательское поле', [{ key: 'kind', label: 'Вид', value: 'expression',
                    choices: [{ value: 'expression', title: 'Выражение' }, { value: 'case', title: 'Выбор' }] }],
                    function (v) { setTimeout(function () { openUserField(listId, v.kind); }, 0); return null; }, 'Далее');
            };
            extra.edit = function () { var sel = selectedIn(test); if (sel) openUserField(sel); else flash('Выберите строку'); };
            extra.copy = function () { flash('Пользовательское поле добавляется заново: путь у каждого свой'); };
        }
        if (kind === 'appearance' && adding) {
            extra.add = function () { openAppearanceItem(listId); };
            extra.edit = function () { var sel = selectedIn(test); if (sel) openAppearanceItem(sel); else flash('Выберите строку'); };
            extra.copy = function () { var sel = selectedIn(test); if (sel) act({ op: 'copy', id: sel }); else flash('Выберите строку'); };
        }
        /* The selected item's user setting properties, else the list's own. */
        if (adding && (userSettingSpot(model, listId) || kind === 'filter' || kind === 'outputParameters' || kind === 'dataParameters')) {
            extra.user = function () {
                var sel = selectedIn(test);
                var target = sel && userSettingSpot(model, sel) ? sel : userSettingSpot(model, listId) ? listId : '';
                if (target) openUserSetting(target); else flash('Выберите элемент');
            };
        }
        var bar = own(model.source.owners, listId) ? toolbar(canList ? ['add', 'folder', 'group', 'remove', 'up', 'down', 'user'] : ['add', 'edit', 'copy', 'remove', 'up', 'down', 'user'], '',
            listActions(test, extra)) : null;
        if (bar) gridBox.appendChild(bar);
        var g = settingsGrid(kind, rows);
        gridBox.appendChild(g);
        pageBox.appendChild(gridBox);
        /* Rows of the list are selected for the command bar. */
        g.addEventListener('click', function (e) {
            var r = e.target.closest && e.target.closest('[data-id]');
            if (!r) return;
            markSelected(r.getAttribute('data-id'));
            notify(r.getAttribute('data-id'));
        });
        /* A conditional appearance item or a user field opens its dialog on double click. */
        if ((kind === 'appearance' || kind === 'userFields') && adding) {
            g.addEventListener('dblclick', function (e) {
                var r = e.target.closest && e.target.closest('[data-id]');
                if (!r || (e.target.closest && e.target.closest('.dcs-check'))) return;
                if (kind === 'appearance') openAppearanceItem(r.getAttribute('data-id'));
                else openUserField(r.getAttribute('data-id'));
            });
        }
        return pageBox;
    }

    /* Selected fields and filter items hang under a root row, as the
     * Designer shows them. */
    function underRoot(title, rows) {
        return [{ root: true, depth: 0, text: title }].concat(rows.map(function (r) {
            var copy = {};
            for (var k in r) if (Object.prototype.hasOwnProperty.call(r, k)) copy[k] = r[k];
            copy.depth = (r.depth || 0) + 1;
            return copy;
        }));
    }

    function settingsGrid(kind, rows) {
        var name = function (title, width) {
            return { title: title, width: width || 240, get: function (r) {
                var span = el('span', 'dcs-setting-name' + (r.folder ? ' dcs-folder' : '') + (r.root ? ' dcs-root-name' : ''));
                var pic = r.root ? picture('root') : fieldPicture(r.path, r.folder);
                if (pic) span.appendChild(pic);
                /* Своё представление поля конфигуратор пишет вместе с самим
                 * полем: «Начальный остаток (КоличествоНачальныйОстаток)». */
                var text = r.title && r.path ? r.title + ' (' + r.path + ')' : r.text;
                /* The title of a selected field or folder is changed in place. */
                span.appendChild(r.id && kind === 'selection' && settingsValue(model, r.id, 'title') !== null
                    ? editText(r.id, 'title', text) : el('span', '', text));
                if (r.path && r.path !== text) span.title = r.path;
                return span;
            } };
        };
        var opts = { lead: true, cls: 'dcs-settings-grid', leadCheck: function (r) { return r.id ? editCheck(r.id, 'use', r.use) : check(r.use); } };
        switch (kind) {
            case 'selection':
                return grid([name('Поле', 420),
                    col('Размещение', 180, function (r) { return r.folder && r.id ? editText(r.id, 'placement', r.placement || '') : r.placement || ''; })],
                    underRoot('Выбранные поля', rows), opts);
            case 'filter':
                return grid([name('Поле', 260), col('Вид сравнения', 150, function (r) {
                        return r.root ? '' : r.folder ? editText(r.id, 'filterGroup', r.text) : editText(r.id, 'comparisonType', r.comparison || '');
                    }),
                    col('Значение', 200, function (r) { return r.root || r.folder ? '' : editText(r.id, 'right', r.value || ''); }),
                    col('Представление', 160, function (r) { return r.presentation || ''; })],
                    underRoot('Отбор', rows), opts);
            case 'order':
                return grid([name('Поле', 340), col('Направление сортировки', 340, function (r) {
                    return r.direction ? editText(r.id, 'orderType', r.direction) : '';
                })], rows, opts);
            case 'appearance':
                return grid([name('Оформление', 206), col('Условие', 206, 'condition'), col('Оформляемые поля', 206, 'fields'),
                    col('Представление', 206, function (r) { return r.presentation || ''; }),
                    col('Область использования', 180, function () { return ''; })], rows, opts);
            case 'groupFields':
                return grid([name('Поле', 260), col('Тип группировки', 130, function (r) { return r.groupType ? editText(r.id, 'groupType', r.groupType) : ''; }),
                    col('Тип дополнения', 120, function (r) { return r.groupType ? editText(r.id, 'periodAdditionType', r.period || '') : ''; }),
                    col('Начало периода', 150, function (r) { return r.groupType ? editText(r.id, 'periodAdditionBegin', settingsValue(model, r.id, 'periodAdditionBegin') || '') : ''; }),
                    col('Конец периода', 150, function (r) { return r.groupType ? editText(r.id, 'periodAdditionEnd', settingsValue(model, r.id, 'periodAdditionEnd') || '') : ''; })], rows, opts);
            case 'userFields':
                return grid([name('Пользовательские поля', 300), col('Путь', 220, 'path'), col('Выражение', 380, function (r) { return r.value || ''; })], rows,
                    { lead: false, cls: 'dcs-settings-grid' });
            default:
                return grid([name('Параметр', 510), col('Значение', 500, function (r) {
                    return r.id && settingsValue(model, r.id, 'value') === null && valueSpot(model, r.id) ? editText(r.id, 'paramValue', r.value || '') : editText(r.id, 'value', r.value || '');
                })], rows, opts);
        }
    }

    var PAGES = {
        sets: drawSets, links: drawLinks, calculated: drawCalculated, totals: drawTotals,
        parameters: drawParameters, templates: drawTemplates, nested: drawNested, settings: drawSettings
    };

    /* Which tab and which row an outline id stands for. */
    function locate(id) {
        id = String(id || '');
        /* A settings item is selected where it is drawn; the window does not move to it. */
        if (id.indexOf('|') >= 0) return null;
        if (id.indexOf('tab:') === 0) return { tab: id.slice(4) };
        if (id.indexOf('set:') === 0) return { tab: 'sets', set: id };
        if (id.indexOf('field:') === 0) {
            for (var i = 0; i < flat.length; i++) {
                for (var f = 0; f < flat[i].set.fields.length; f++)
                    if (flat[i].set.fields[f].id === id) return { tab: 'sets', set: flat[i].set.id };
            }
            return { tab: 'sets' };
        }
        var prefixes = { link: 'links', calc: 'calculated', total: 'totals', param: 'parameters', tpl: 'templates', nested: 'nested', cell: 'templates', arow: 'templates' };
        var head = id.slice(0, id.indexOf(':'));
        if (head === 'tpl') return { tab: 'templates', template: id };
        if (own(prefixes, head)) return { tab: prefixes[head] };
        if (head === 'variant') {
            for (var v = 0; v < model.variants.length; v++) {
                var vid = model.variants[v].id;
                if (id === vid) return { tab: 'settings', variant: v, node: '' };
                if (id.indexOf(vid + '/') === 0) return { tab: 'settings', variant: v, node: id };
            }
        }
        return null;
    }

    container._dcsSelect = function (id) {
        var where = locate(id);
        if (!where) return null;
        var redraw = where.tab !== shownTab;
        if (where.set && where.set !== viewState.set) { viewState.set = where.set; redraw = true; }
        if (where.template && where.template !== viewState.template) { viewState.template = where.template; redraw = true; }
        if (where.variant != null && (where.variant !== viewState.variant || where.node !== viewState.node)) {
            viewState.variant = where.variant;
            viewState.node = where.node;
            redraw = true;
        }
        if (redraw) showTab(where.tab);
        return markSelected(id);
    };
    container._dcsShowTab = function (id) {
        if (id && id !== shownTab) showTab(id);
    };

    showTab(viewState.tab);
    if (viewState.selected) markSelected(viewState.selected);
}

function cssEscape(s) {
    return String(s).replace(/["\\]/g, '\\$&');
}

/* Открыть вкладку без выделения: у сравнения на той стороне, где элемента
 * нет, вкладка должна совпасть с соседней. */
function showTab(container, id) {
    if (container && container._dcsShowTab) container._dcsShowTab(String(id || ''));
}

function highlight(container, id) {
    if (!container || !container._dcsSelect) return null;
    return container._dcsSelect(String(id || ''));
}

root.DcsPreview = {
    detect: detect,
    parse: parse,
    render: render,
    outline: outline,
    inspector: inspector,
    outlineIcon: outlineIcon,
    outlineHidden: outlineHidden,
    outlineExpandTo: outlineExpandTo,
    outlineCollapseAll: outlineCollapseAll,
    outlineSortByName: outlineSortByName,
    highlight: highlight,
    showTab: showTab,
    itemKey: itemKey,
    resetViewState: resetViewState,
    propertyValue: propertyValue,
    propertyEdit: propertyEdit,
    applyProperty: applyProperty,
    addEdit: addEdit,
    applyAdd: applyAdd,
    schemaEdit: schemaEdit,
    applySchemaEdit: applySchemaEdit,
    settingsValue: settingsValue,
    propertyChoices: propertyChoices,
    queryColumns: queryColumns,
    queryResult: queryResult,
    autoFillEdit: autoFillEdit,
    objectFieldsEdit: objectFieldsEdit,
    highlightQuery: highlightQuery,
    expressionEnv: expressionEnv,
    availableFields: availableFields,
    availableList: availableList,
    orderList: orderList,
    roleOf: roleOf,
    totalGroups: totalGroups,
    scopeModel: scopeModel,
    parameterRows: parameterRows,
    appearanceItemOf: appearanceItemOf,
    userFieldOf: userFieldOf,
    userSettingOf: userSettingOf,
    paramValueOf: paramValueOf,
    templateParams: templateParams,
    templateBindingOf: templateBindingOf,
    cellOf: cellOf
};

})(typeof globalThis !== 'undefined' ? globalThis : window);

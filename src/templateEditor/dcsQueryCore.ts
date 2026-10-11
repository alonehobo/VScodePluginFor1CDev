/**
 * The query language parser for the data composition schema page, bundled by
 * scripts/bundle-dcs-query-core.js into resources/preview-core/host/query-core.js
 * as the BslQueryBuilderCore global: the schema window reads a data set's query
 * with it to fill the set's fields the way the Designer's autofill does.
 */
export { parseSdbl } from '../queryBuilder/sdbl/sdblParser';

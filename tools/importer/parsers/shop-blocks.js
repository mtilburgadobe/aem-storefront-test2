/* global WebImporter */
/*
 * Block-table builders shared by the Shopify import (tools/importer/import-shopify.js).
 * Every shop-* block is a thin shell: editorial copy plus the Shopify handle; the
 * Shopify data itself is loaded by the block at runtime.
 */

export function createShopBlock(document, name, cells) {
  return WebImporter.Blocks.createBlock(document, { name, cells });
}

export function createMetadata(document, values) {
  return WebImporter.Blocks.getMetadataBlock(document, values);
}

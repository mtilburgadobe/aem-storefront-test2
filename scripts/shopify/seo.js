/**
 * Sets JSON-LD structured data in the document head (same contract as the boilerplate's
 * `setJsonLd` in scripts/commerce.js, which Shopify pages must not import).
 * @param {Object} data - The JSON-LD data object
 * @param {string} name - The name identifier for the script element
 */
export function setJsonLd(data, name) {
  const existingScript = document.head.querySelector(`script[data-name="${name}"]`);
  if (existingScript) {
    existingScript.textContent = JSON.stringify(data);
    return;
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  script.dataset.name = name;
  document.head.appendChild(script);
}

const IN_STOCK = 'http://schema.org/InStock';
const OUT_OF_STOCK = 'http://schema.org/OutOfStock';

/**
 * Builds the boilerplate's Product JSON-LD (blocks/product-details/product-details.js)
 * from a Shopify Storefront API product.
 * @param {Object} product Storefront product (title, handle, description, seo, vendor,
 *   featuredImage, variants.nodes with sku/price/availableForSale/image)
 * @returns {Object} the JSON-LD object
 */
export function productJsonLd(product) {
  const variants = product.variants?.nodes || [];
  const first = variants[0];
  const url = new URL(`/products/${product.handle}`, window.location).href;
  // Shopify SKUs are optional (none are set in this shop): fall back to the numeric product id
  const sku = first?.sku || undefined;
  const productID = sku || product.id?.split('/').pop();

  const ldJson = {
    '@context': 'http://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.seo?.description || product.description,
    image: product.featuredImage?.url,
    offers: [],
    productID,
    brand: {
      '@type': 'Brand',
      name: product.vendor,
    },
    url,
    sku,
    '@id': url,
  };

  if (variants.length > 1) {
    ldJson.offers.push(...variants.map((variant) => ({
      '@type': 'Offer',
      name: `${product.title} - ${variant.title}`,
      image: variant.image?.url || product.featuredImage?.url,
      price: Number(variant.price?.amount),
      priceCurrency: variant.price?.currencyCode,
      availability: variant.availableForSale ? IN_STOCK : OUT_OF_STOCK,
      sku: variant.sku || undefined,
    })));
  } else {
    ldJson.offers.push({
      '@type': 'Offer',
      price: Number(first?.price?.amount),
      priceCurrency: first?.price?.currencyCode,
      availability: (first?.availableForSale ?? product.availableForSale) ? IN_STOCK : OUT_OF_STOCK,
    });
  }

  return ldJson;
}

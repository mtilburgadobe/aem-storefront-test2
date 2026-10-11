// the theme's built-in hero placeholder illustration (viewBox 1300 x 730)
const PLACEHOLDER = { src: 'placeholder.svg', width: 1300, height: 730 };

function codeBasePath() {
  return window.hlx?.codeBasePath || '';
}

/**
 * loads and decorates the block
 * Authored rows: optional picture · text (paragraph) · link (CTA).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  const link = block.querySelector('a[href]');
  const textCell = [...block.querySelectorAll(':scope > div > div')]
    .find((cell) => !cell.contains(picture) && !cell.contains(link) && cell.textContent.trim());

  const media = document.createElement('div');
  media.className = 'shop-hero__media';
  if (picture) {
    const img = picture.querySelector('img');
    img.className = 'shop-hero__image';
    img.loading = 'eager';
    img.setAttribute('fetchpriority', 'high');
    media.append(picture);
  } else {
    const pic = document.createElement('picture');
    const img = document.createElement('img');
    img.className = 'shop-hero__image';
    img.src = `${codeBasePath()}/blocks/shop-hero/${PLACEHOLDER.src}`;
    img.width = PLACEHOLDER.width;
    img.height = PLACEHOLDER.height;
    img.alt = '';
    img.setAttribute('fetchpriority', 'high');
    pic.append(img);
    media.append(pic);
  }

  const overlay = document.createElement('div');
  overlay.className = 'shop-hero__overlay';

  const content = document.createElement('div');
  content.className = 'shop-hero__content';
  if (textCell) {
    // move the authored paragraph (or the cell's inline text) into the heading slot
    let heading = textCell.querySelector(':scope > p');
    if (!heading) {
      heading = document.createElement('p');
      heading.append(...textCell.childNodes);
    }
    heading.className = 'shop-hero__heading';
    content.append(heading);
  }
  if (link) {
    link.className = 'shop-button shop-hero__button';
    // decorateButtons copies the link text into title; the theme button has none
    if (link.title === link.textContent) link.removeAttribute('title');
    content.append(link);
  }

  block.replaceChildren(media, overlay, content);
}

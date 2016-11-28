export default function findNearestLinkElement(el) {
  if (el.tagName === 'A') {
    return el;
  }

  if (el.parentNode) {
    return findNearestLinkElement(el.parentNode);
  }

  return null;
}

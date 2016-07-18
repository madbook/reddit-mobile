export const isHidden = (el) => {
  if (!el || el.hidden) {
    return true;
  }

  const style = window.getComputedStyle(el);

  if (style.display === 'none' ||
      style.visibility === 'hidden') {
    return true;
  }

  if (!el.parentElement) {
    return false;
  }

  return isHidden(el.parentNode);
};

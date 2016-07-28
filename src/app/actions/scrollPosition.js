export const SAVE_SCROLL_POSITION = 'SAVE_SCROLL_POSITION';
export const save = (url, scrollTop) => ({
  type: SAVE_SCROLL_POSITION,
  url,
  scrollTop,
});

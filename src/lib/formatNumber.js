// TOOD consider a polyfill for toLocaleString
export const formatNumber = number => (
  `${number}`).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'
);

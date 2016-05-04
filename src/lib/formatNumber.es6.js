// TOOD consider a polyfill for toLocaleString
function formatNumber(number) {
  return (`${number}`).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

export default formatNumber;

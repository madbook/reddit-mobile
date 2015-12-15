function randomBySeed(s) {
  return function() {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
}


export default randomBySeed;

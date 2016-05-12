export default (obj, name, prop) => {
  if (prop) {
    obj[name] = prop;
  }
};

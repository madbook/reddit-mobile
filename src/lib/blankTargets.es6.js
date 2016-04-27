function process(text) {
  return text.replace(/<a/g, '<a target="_blank"');
}

export default process;

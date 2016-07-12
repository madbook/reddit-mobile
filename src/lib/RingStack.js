// A simple read-only ring-stack. Useful for keeping track of the N most recent items.

export default class RingStack {
  constructor(size) {
    this.size = size;
    this.stack = new Array(size);
    this.head = 0;
  }

  push(item) {
    this.stack[this.head] = item;
    this.head = (this.head + 1) % this.size;
  }

  values() {
    return this.stack.slice(this.head)
      .concat(this.stack.slice(0, this.head))
      .filter(x => !!x)
      .reverse();
  }
}

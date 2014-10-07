function CommentTree(trigger) {
  this.$trigger = $(trigger);
  this.$comment = this.$trigger.siblings('article');

  this.$trigger.on('click', (function(e) {
    e.preventDefault();
    this.show();
  }).bind(this));
}

CommentTree.prototype.show = function() {
  this.$comment
    .removeClass('hidden')
    .find('article').show();

  this.$trigger.remove();
}

CommentTree.bind = function(triggerSelector) {
  $(triggerSelector).each(function(i, el) {
    new CommentTree(el);
  });
}

module.exports = CommentTree;

function Vote(trigger, direction, thingId, siblings) {
  this.$trigger = $(trigger);
  this.direction = this.$trigger.data('vote');
  this.thingId = this.$trigger.data('thingid');

  this.$siblings = siblings ||
       $('[data-thingid=' + this.thingId + ']').not(this.$trigger);

  this.$trigger.on('click', (function(e) {
    e.preventDefault();
    this.vote();
  }).bind(this));

  this.$trigger.data('vote', this);
}

Vote.prototype.vote = function() {
  this.$siblings
    .removeClass('voted')
    .removeClass('text-upvote')
    .removeClass('text-downvote');

  if (this.$trigger.hasClass('voted')) {
    this.$trigger.removeClass('voted')
        .removeClass('text-upvote')
        .removeClass('text-downvote');
    // remove vote
  } else {
    this.$trigger.addClass('voted');
    this.$trigger.addClass('text-' + this.direction + 'vote');
    // add vote
  }
}

Vote.bind = function(triggerSelector) {
  $(triggerSelector).each(function(i, el) {
    new Vote(el);
  });
}

module.exports = Vote;

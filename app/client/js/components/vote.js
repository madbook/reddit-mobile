var csrf = $('#csrf-token-meta-tag').attr('content');

var scoreModifiers = {
  up: 1,
  down: -1,
  cancel: 0,
};

function Vote(trigger, direction, thingId, siblings, score) {
  this.$trigger = $(trigger);
  this.direction = this.$trigger.data('vote');
  this.thingId = this.$trigger.data('thingid');
  this.$score = score || $('[data-thingid=' + this.thingId + '][data-vote-score]');

  this.$siblings = siblings ||
       $('[data-thingid=' + this.thingId + ']').not(this.$trigger);

  this.$trigger.on('click', (function(e) {
    e.preventDefault();
    this.vote();
  }).bind(this));

  this.$trigger.data('vote', this);
}

Vote.prototype.vote = function() {
  $.post(this.$trigger.attr('href'), { _csrf: csrf } );
  var score = this.$score.data('vote-score');

  var scoreModifier = scoreModifiers[this.direction];

  this.$siblings
    .removeClass('voted')
    .removeClass('text-upvote')
    .removeClass('text-downvote');


  if (this.$trigger.hasClass('voted')) {
    this.$trigger.removeClass('voted')
        .removeClass('text-upvote')
        .removeClass('text-downvote');
  } else {
    this.$trigger
      .addClass('voted')
      .addClass('text-' + this.direction + 'vote');
    score += scoreModifier;
  }


  this.$score
    .text(score);
}

Vote.bind = function(triggerSelector) {
  $(triggerSelector).each(function(i, el) {
    new Vote(el);
  });
}

module.exports = Vote;

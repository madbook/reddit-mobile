function Collapse(trigger, target) {
  this.$trigger = $(trigger);
  this.$target = $(target || this.$trigger.data('target'));

  this.$trigger.on('click', (function(e) {
    e.preventDefault();

    if (this.$target.hasClass('in')) {
      this.$target.removeClass('in');
      this.$target.addClass('out');
    } else {
      this.$target.removeClass('out');
      this.$target.addClass('in');
    }
  }).bind(this));
}

Collapse.bind = function(triggerSelector) {
  $(triggerSelector).each(function(i, el) {
    new Collapse(el);
  });
}

module.exports = Collapse;

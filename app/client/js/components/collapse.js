function Collapse(trigger, target) {
  this.$trigger = $(trigger);
  this.$target = $(target || this.$trigger.data('target'));

  this.$trigger.on('click', (function(e) {
    e.preventDefault();
    this.toggleCollapse();
    this.showEmbed();
  }).bind(this));
}

Collapse.prototype.toggleCollapse = function() {
  if (this.$target.hasClass('in')) {
    this.$target.removeClass('in');
    this.$target.addClass('out');
  } else {
    this.$target.removeClass('out');
    this.$target.addClass('in');
  }
}

Collapse.prototype.showEmbed = function() {
  var self = this;

  this.$target.find('a[data-embed]:not([data-embedded])').each(function(i){
    var $this = $(this);
    $this.data('embedded', true);
    $this.embedly({
      key: 'f0b45a364e6849ff9aebf71fab6a6b68',
      display: function(obj) {
        if (obj.type === 'video' || obj.type === 'rich'){
          var ratio = ((obj.height/obj.width)*100).toPrecision(4) + '%'

          var div = $('<div class="embed-responsive embed-responsive-4by3">').css({
            paddingBottom: ratio
          });

          div.html(obj.html);

          $(this).replaceWith(div);
        } else if (obj.type === 'photo')  {
          $(this).replaceWith('<img src="' + obj.url + '" class="img-responsive" />');
        }
      }
    });
  });
}

Collapse.bind = function(triggerSelector) {
  $(triggerSelector).each(function(i, el) {
    new Collapse(el);
  });
}

module.exports = Collapse;

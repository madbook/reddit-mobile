function Collapse(trigger, target) {
  this.$trigger = $(trigger);
  this.$target = $(target || this.$trigger.data('target'));
  this.$targetParent = this.$target.parent();

  this.embedType = this.$target.find('[data-embed-type]').data('embed-type');

  this.$trigger.on('click', (function(e) {
    e.preventDefault();
    this.toggleCollapse();
    this.showEmbed();
  }).bind(this));

  this.$trigger.data('collapse', this);
}

Collapse.prototype.toggleCollapse = function() {
  if (this.$target.hasClass('in')) {
    this.$target
        .removeClass('in')
        .addClass('out');

    if(!(this.embedType == 'card')) {
      this.$target.detach();
    }
  } else {
    this.$target
        .removeClass('out').addClass('in');

    if(!(this.embedType == 'card')) {
      this.$target.appendTo(this.$targetParent)
    }
  }
}

Collapse.prototype.showEmbed = function() {
  var self = this;

  this.$target.find('a[data-embed-type]:not([data-embedded])').each(function(i){
    var $this = $(this);
    $this.data('embedded', true);

    if (self.embedType == 'normal') {
      $this.embedly({
        key: window.bootstrap.embedlyKey,
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
    } else if (self.embedType == 'card') {
      embedly('card', '#' + $this.attr('id'));

      embedly('on', 'card.rendered', function(iframe){
        $card = $(iframe);
        $card.siblings('[data-embed-loading]').remove();
      });
    }
  });
}

Collapse.bind = function(triggerSelector) {
  $(triggerSelector).each(function(i, el) {
    new Collapse(el);
  });
}

module.exports = Collapse;

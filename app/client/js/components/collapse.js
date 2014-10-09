var $window = $(window);

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

    var currentLocation = $window.scrollTop();
    var lastLocation = this.$target.data('originalScrollTop');
    var speed = ((currentLocation - lastLocation) / 2) + 50;

    $('html,body').animate({
      scrollTop: lastLocation
    }, speed);
  } else {
    this.originalScrollTop = $window.scrollTop();
    this.$target.data('originalScrollTop', $window.scrollTop());

    this.$target
        .removeClass('out').addClass('in');


    if(!(this.embedType == 'card')) {
      this.$target.appendTo(this.$targetParent)
    }
  }
}

Collapse.prototype.showEmbed = function() {
  var self = this;
  var embeds = this.$target.find('a[data-embed-type]:not([data-embedded])');

  embeds.each(function(i){
    var $this = $(this);
    $this.data('embedded', true);

    if (self.embedType == 'normal') {
      $this.embedly({
        key: window.bootstrap.embedlyKey,
        display: function(obj) {
          var $this = $(this);
          var $loading = $this.siblings('[data-embed-loading]');

          if (obj.type === 'video' || obj.type === 'rich') {
            var ratio = ((obj.height/obj.width)*100).toPrecision(4) + '%'

            var div = $('<div class="embed-responsive embed-responsive-4by3">').css({
              paddingBottom: ratio
            });

            div.html(obj.html);

            $this.replaceWith(div);
          } else if (obj.type === 'photo') {
            $this.replaceWith('<img src="' + obj.url + '" class="img-responsive" />');
          } else if (obj.type === 'link') {
            var template = '<div class="panel-padding">' +
              '<h5><a href="' + obj.provider_url + '" class="label label-info">' + obj.provider_name + '</a></h5>' +
              '<h4 class="media-heading"><a href="' + obj.url + '">' + obj.title + '</a></h4>' +
              '<p>' + obj.description + '</p>' +
            '</div>';

            $this.replaceWith($(template));
          }

          $loading.remove();
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

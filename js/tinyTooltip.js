(function($){
  $.fn.tinyTooltip = function(options) {
    var settings = $.extend({
      delay: 0,
      class: '',
      removeOnScroll: true
    }, options);
    return this.each(function() {
      var $el = $(this);
      var title = $el.attr('data-tooltip');
      if (!title) return;
      $el.hover(function(e) {
        var $tip = $('<div class="tiny-tooltip ' + settings.class + '">' + title + '</div>').appendTo('body');
        $tip.css({
          position: 'absolute',
          top: e.pageY + 10,
          left: e.pageX + 10,
          zIndex: 9999
        });
        $el.on('mousemove.tinyTooltip', function(e) {
          $tip.css({ top: e.pageY + 10, left: e.pageX + 10 });
        });
        $el.on('mouseleave.tinyTooltip', function() {
          $tip.remove();
          $el.off('.tinyTooltip');
        });
      }, function() {
        $('.tiny-tooltip').remove();
        $el.off('.tinyTooltip');
      });
    });
  };
})(jQuery); 
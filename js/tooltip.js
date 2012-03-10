/**
 * a javascript tooltip with douban.com style based on jQuery 1.3.2+
 *
 * @author Micate Cn<yawewe@gmail.com>
 * @version $Id$
 * @url http://micate.me/projects/tooltip/
 */
(function($, doc) {
var OPTIONS = {
    content: undefined, // tips to show, jQuery Object or selector
    event: 'hover', // click, hover
    width: 'auto', 
    height: 'auto', 
    direction: 'right', // left, right
    distance: 15, 
    delay: 200,
    prefix: 'fn-tooltip'
},
CLASSES = {
    TOOLTIP: '', 
    ARROW: 'arrow', 
    ARROW_LEFT: 'arrow-left',
    ARROW_RIGHT: 'arrow-right',
    SHADOW: 'shadow',
    SHADOW_LEFT: 'shadow-left', 
    SHADOW_RIGHT: 'shadow-right'
}, 
body = doc.body;
function clazz(o, name) {
    return o.prefix + (CLASSES[name] ? '-' + CLASSES[name] : '');
}
function Tooltip(elem, options) {
    var self = this;
    elem && elem.jquery || (elem = $(elem));
    if (! elem.length) return false;
    this._options = $.extend({}, OPTIONS, options || {});
    this._hover = this._options.event == 'hover';
    this._elem = elem.bind((this._hover ? 'mouseenter' : 'click') + '.tooltip', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        ! self._inited && self._init();
        ! self._show && self.show();
    });
    return this;
}
$.extend(Tooltip.prototype, {
    _init: function() {
        var o = this._options,
            content = this._find(o.content);
        if (! content.length) return false;
        
        this._tooltip = $('<div></div>')
            .css({position: 'absolute', left: '-999999px', top: '-999999px'})
            .appendTo(body)
            .hide()
            .addClass(clazz(o, 'TOOLTIP') + ' ' + clazz(o, 'SHADOW'));
        o.width && this._tooltip.css('width', o.width);
        o.height && this._tooltip.css('height', o.height);
        
        this._arrow = $('<span></span>')
            .css({position: 'absolute'})
            .appendTo(this._tooltip)
            .addClass(clazz(o, 'ARROW'));

        this._tooltip.addClass(clazz(o, (o.direction == 'left') ? 'SHADOW_RIGHT' : 'SHADOW_LEFT'));
        this._arrow.addClass(clazz(o, (o.direction == 'left') ? 'ARROW_RIGHT' : 'ARROW_LEFT'));

        this.updateContent(content);
        this._inited = true;
    },
    _find: function(config) {
        var elem = this._elem, 
            ret;
        if (! config || config.jquery) return config;
        ret = elem.find(config);
        if (ret.length) return ret;
        ret = elem.siblings(config);
        if (ret.length) return ret;
        return $(config);
    },
    show: function() {
        var self = this;
        if (! this._inited || this._show) return false;
        this._tooltip.show();
        if (this._hover) {
            this._elem.bind('mouseout.tooltip', function() {
                self.hide();
            });
        } else {
            $(doc).bind('click.tooltip', function(ev) {
                var target = ev.target, 
                    tooltip = self._tooltip.get(0);
                if (target == self._elem.get(0) || target == tooltip || $(target).parents().index(tooltip) > -1) return;
                self.hide();
            });
        }
        $(window).bind('resize.tooltip', function() {
            self.updatePosition();
        });
        this._show = true;
    },
    hide: function() {
        if (! this._inited || ! this._show) return false;
        
        // API 使得外部可以阻止默认的隐藏事件
        if (this._elem.data('tooltip.autohide') === false) {
            return false;
        }
        
        this._tooltip.hide();

        if (this._hover) {
            this._elem.unbind('mouseout.tooltip');
        } else {
            $(doc).unbind('click.tooltip');
        }
        $(window).unbind('resize.tooltip');
        this._show = false;
    },
    updatePosition: function() {
        var o = this._options, 
            elemOffset = this._elem.offset(), 
            elemWidth = this._elem.width(), 
            tooltipWidth = this._tooltip.width();
        if (o.direction == 'left') {
            this._tooltip.css({
                left: elemOffset.left - tooltipWidth - o.distance, 
                top: elemOffset.top
            });
        } else {
            this._tooltip.css({
                left: elemOffset.left + elemWidth + o.distance, 
                top: elemOffset.top
            });
        }
        this._arrow.css({
            left: (o.direction == 'left') ? (tooltipWidth - this._arrow.width()) : 0,
            top: Math.floor((this._elem.height() / 3.382))
        });
    },
    updateContent: function(content) {
        this._tooltip.children(':not(:last)').remove();
        this._content = content.hide().clone(true).prependTo(this._tooltip).show();
        this.updatePosition();
    }
});

$.fn.tooltip = function(options) {
    return this.each(function() {
        $(this).data('tooltip', new Tooltip(this, options))
    });
};

// AUTO 基于约定的自动初始化
$(function() {
    $('[fn-tooltip]').each(function() {
        var self = $(this), tooltip = $(self.attr('fn-tooltip'));
        tooltip.length && self.tooltip({
            content: tooltip
        });
        
        // TEST 测试是否能够在外部调用 API 禁止提示框隐藏
        /*setInterval(function() {
            var status = !!!self.data('tooltip.autohide');
            console.info(status);
            self.data('tooltip.autohide', status);
        }, 5000);*/
    });
});
})(jQuery, document);
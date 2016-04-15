/*
 * Swipeout 左滑效果
 * By caijf
 * 支持amd，如不使用amd，可以使用全局变量Swipeout
 *
 * Date: 2016/4/07
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        root.Swipeout = factory();
    }
})(this, function() {

    //处理事件兼容问题
    var EVENT;
    if ('ontouchstart' in window) {
        EVENT = {
            START: 'touchstart',
            MOVE: 'touchmove',
            END: 'touchend'
        };
    } else {
        EVENT = {
            START: 'mousedown',
            MOVE: 'mousemove',
            END: 'mouseup'
        };
    }

    // CSS3 属性前缀兼容
    // transitionEnd事件兼容
    var vendorPrefix = getVendorPrefix(),
        fxTransform,
        fxTransition,
        fxTransitionEnd = handlerTransitionEnd();

    if(vendorPrefix === ''){
        fxTransform = 'transform';
        fxTransition = 'transition';
    }else{
        fxTransform = vendorPrefix + 'Transform';
        fxTransition = vendorPrefix + 'Transition';
    }

    /**
     * css 属性前缀兼容
     * @return {String}
     */
    function getVendorPrefix() {    
        var body = document.body || document.documentElement,
            style = body.style,
            vendor = ["Moz", "Webkit", "Khtml", "O", "ms"],
            i = 0,
            len = vendor.length;

        while (i < len) {
            if (typeof style[vendor[i] + 'Transition'] === "string") {
                return '-' + vendor[i].toLowerCase() + '-';
            }
            i++;
        }
        return '';
    }

    /**
     * transitionEnd事件兼容
     * @return {[type]} [description]
     */
    function handlerTransitionEnd() {
        var body = document.body || document.documentElement,
            style = body.style,
            transEndEventNames = {
                WebkitTransition: 'webkitTransitionEnd',
                MozTransition: 'transitionend',
                OTransition: 'oTransitionEnd otransitionend',
                transition: 'transitionend'
            },
            i = 0,
            len = transEndEventNames.length;

        for (var name in transEndEventNames) {
            if (typeof style[name] === "string") {
                return transEndEventNames[name];
            }
        }

        return false;
    };

    /**
     * @description 左滑删除
     * @param {Object} options
     * @param {String | Object} options.wrapper 事件委托父级，支持css选择器 或 Zepto dom对象。默认 'body'
     * @param {String} options.swipeoutEl 操作元素，目前仅支持css选择器。默认 'li'
     * @param {String} options.swipeoutContentClass 执行动画的元素的className，例如，我们作用元素是li，实际动画是在 li>.li-inner。默认 'li-inner'
     * @param {String} options.actionClass 右侧操作元素的className，例如，右侧我们放置了操作元素 li>.li-action。默认 'li-action'
     * @param {Number} options.overstepLimit 可超出距离。默认 options.maxLimit / 2
     * @param {Number} options.animateTime 滑动时间，单位ms。默认 300
     * @param {Function} options.disabledHandle 禁用条件函数
     * @example
     *     var messageSwipeout = new Swipeout();
     *
     */
    function Swipeout(options) {

        //去除new字符串
        if (!(this instanceof Swipeout)) return new Swipeout(options);

        var self = this;

        // 参数覆盖
        var opt = $.extend({
            wrapper: '',
            swipeoutEl: 'li',
            swipeoutContentClass: 'li-inner',
            swipeoutActionClass: 'li-action',
            animateTime: 300,
            animateFunction: 'ease-out',
            disabledHandle: null
        }, options);

        // 偏移可以超出范围
        opt.overstepLimit = (opt.overstepLimit && typeof opt.overstepLimit === 'number') ? (opt.overstepLimit > 0 ? -opt.overstepLimit : opt.overstepLimit) : 0;

        var allowSwipeout = true, // 允许滑动，作用于滑动收起时，防止重复触发
            swipeoutOpenedEl, // 当前滑出元素
            swipeoutEl, // 当前操作dom
            swipeoutContent, // 滑动元素
            swipeoutAction, // 操作区域
            swipeoutActionWidth, // 操作区域宽度
            touchesStart = {}, // 开始坐标
            touchesStartTime, // 开始触发时间
            touchesDiff, // 移动距离
            translate, // 偏移距离
            direction, // 判断touch方向，v为垂直，h为水平
            isTouch, // 标识触发点击
            isMove, // 标识是否在移动
            isScrolling; //标识是否垂直滚动

        // 获取 dom
        var $dom = $(document),
            $wrapper = opt.wrapper ? $(opt.wrapper) : $dom;

        // 绑定事件
        // TODO：init提取
        $wrapper.find(opt.swipeoutEl)
            .on(EVENT.START, start)
            .on(EVENT.MOVE, move)
            .on(EVENT.END, end);

        /**
         * 开始移动时触发
         * @param  {Object} e 事件对象
         */
        function start(e) {
            if (opt.disabledHandle && typeof opt.disabledHandle === 'function' && opt.disabledHandle()) {
                return;
            }

            // 滑动收起时，禁止再触发
            if(!allowSwipeout) return;

            var $target = $(e.target);

            // 存在滑出元素，并且不处于操作区域，隐藏滑出元素
            // if (swipeoutOpenedEl && swipeoutOpenedEl != $(this) && $target.parents('.' + opt.swipeoutActionClass).length === 0) {
            if (swipeoutOpenedEl && $target.parents('.' + opt.swipeoutActionClass).length === 0) {
                swipeoutClose(swipeoutContent);
                e.preventDefault();
                return;
            }

            // 初始化
            isMove = false;
            isTouch = true;
            isScrolling = undefined;
            touchesStart.x = e.type === 'touchstart' ? e.touches[0].pageX : e.pageX;
            touchesStart.y = e.type === 'touchstart' ? e.touches[0].pageY : e.pageY;
            touchesStartTime = Date.now();

        }

        /**
         * 正在移动时触发
         * @param  {Object} e 事件对象
         */
        function move(e) {
            if (!isTouch) return;

            var pageX = e.type === 'touchmove' ? e.touches[0].pageX : e.pageX,
                pageY = e.type === 'touchmove' ? e.touches[0].pageY : e.pageY;

            // 取点判断方向
            if (typeof isScrolling === 'undefined') {
                isScrolling = !!(isScrolling || Math.abs(pageY - touchesStart.y) > Math.abs(pageX - touchesStart.x));
            }
            if (isScrolling) {
                isTouch = false;
                return;
            }

            if(!isMove){
                swipeoutEl = $(this);
                swipeoutContent = swipeoutEl.find('.' + opt.swipeoutContentClass);
                swipeoutAction = swipeoutEl.find('.' + opt.swipeoutActionClass);
                swipeoutActionWidth = swipeoutAction.width();
                // 是否动态获取界限值（操作区域的宽度）
                opt.maxLimit = -swipeoutEl.find('.' + opt.actionClass).width();
                opt.toggleLimit = opt.maxLimit / 2;
            }

            isMove = true;
            e.preventDefault();
            translate = parseInt(swipeoutContent.attr('data-translatex'), 10) || 0;
            touchesDiff = pageX - touchesStart.x;
            translate += touchesDiff;

            // 边界值限定
            if (translate < (opt.maxLimit + opt.overstepLimit)) {
                translate = opt.maxLimit + opt.overstepLimit;
            } else if (translate > -opt.overstepLimit) {
                translate = -opt.overstepLimit;
            }

            transform(swipeoutContent, translate);
        }

        /**
         * 移动结束时触发
         * @param  {Object} e 事件对象
         */
        function end(e) {
            if (!isTouch || !isMove) {
                isTouch = false;
                isMove = false;
                return;
            }

            isTouch = false;
            isMove = false;
            var timeDiff = (new Date()).getTime() - touchesStartTime;

            if (
                timeDiff < 300 && touchesDiff < -10 ||
                timeDiff >= 300 && Math.abs(translate) > swipeoutActionWidth / 2
            ) {
                swipeoutOpen();
            }else{
                swipeoutClose(swipeoutContent);
            }
        }

        // 隐藏滑出dom
        function swipeoutClose($el) {
            allowSwipeout = false;
            slide($el, opt.animateTime, 0, function(){
                swipeoutOpenedEl = undefined;
                allowSwipeout = true;
            });
        }

        // 显示滑出dom
        function swipeoutOpen(callback) {
            swipeoutOpenedEl = swipeoutEl;
            slide(swipeoutContent, opt.animateTime, opt.maxLimit, callback);
        }

        /**
         * @description 元素transform偏移
         * @param  {Object} $el       Zepto或jQuery dom对象
         * @param  {Number} offsetX 偏移值，x轴
         */
        function transform($el, offsetX) {
            $el.css(fxTransform, 'translate3d(' + offsetX + 'px, 0, 0)')
                .attr('data-movex', offsetX);
        }

        /**
         * transition动画
         * @param  {Object} $el           Zepto或jQuery dom对象
         * @param  {Number}   animateTime 动画执行时间
         * @param  {Number}   offsetX   偏移值，x轴
         * @param  {Function} callback    动画执行完回调函数
         */
        function slide($el, animateTime, offsetX, callback) {

            $el.css(fxTransition, 'transform ' + animateTime + 'ms ease-out 0s')
                .attr({
                    'data-translatex': offsetX,
                    'data-movex': offsetX
                });

            var closeTo;

            function onTransitionEnd(){
                clearTimeout(closeTo);
                $el.css(fxTransition, '');
                callback && (typeof callback === 'function') && callback();
            }

            if(fxTransitionEnd){
                $el.one(fxTransitionEnd, onTransitionEnd);
            }

            // 兼容不触发
            closeTo = setTimeout(onTransitionEnd, animateTime+200);

            transform($el, offsetX);
        }

        /**
         * @method destroy 销毁函数
         */
        this.destroy = function() {
            swipeoutClose();
            $wrapper.find(opt.swipeoutEl)
                .off(EVENT.START)
                .off(EVENT.MOVE)
                .off(EVENT.END);
        }

        /**
         * @method swipeoutClose 重置滑出状态
         */
        // this.swipeoutClose = function() {
        //     if (isOpen) {
        //         swipeoutClose();
        //     }
        // }

        /**
         * @method init 初始化
         */
        // this.init = function() {
        //     self.wrapper.on(EVENT.START, start);
        // }
    }

    return Swipeout;

});
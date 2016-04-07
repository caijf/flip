/*
 * Flip ��Ч��
 * By caijf
 * ֧��amd���粻ʹ��amd������ʹ��ȫ�ֱ���Flip
 *
 * Date: 2016/4/07
 */
(function(){

    /**
     * ��׼��λ����Ϣ
     * @param e �¼�����
     * @returns {Object}
     */
    function getStandEvent(e){
        var touches = e;
        if(e.touches && e.touches.length){
            touches = e.touches[0];
        }
        if(e.changedTouches && e.changedTouches.length){
            touches = e.changedTouches[0];
        }
        return $.extend({
            origin: {
                x: touches.pageX,
                y: touches.pageY
            }
        },e);
    }

    //�����¼���������
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

    var vendorPrefix = fxPrefix(), // CSS3 ����ǰ׺
        transitionEnd = fxTransitionEnd(); // transitionEnd�¼�����

    /**
     * css ����ǰ׺����
     * @return {String}
     */
    function fxPrefix(){
        var body = document.body || document.documentElement,
            style=body.style,
            vendor = ['', 'Moz', 'Webkit', 'Khtml', 'O', 'ms'],
            i = 0,
            len = vendor.length,
            result = '';

        while(i < len){
            if(typeof style[vendor[i] + 'transition'] === 'string'){
                result = vendor[i];
                break;
            }
            i++;
        }
        return result;
    }

    /**
     * transitionEnd�¼�����
     * @return {[type]} [description]
     */
    function fxTransitionEnd(){
        var body = document.body || document.documentElement,
            style=body.style,
            transEndEventNames = {
              WebkitTransition : 'webkitTransitionEnd',
              MozTransition    : 'transitionend',
              OTransition      : 'oTransitionEnd otransitionend',
              transition       : 'transitionend'
            },
            result = 'transition';

        for(var name in transEndEventNames){
            if(typeof style[name] === "string"){
                result = transEndEventNames[name];
                break;
            }
        }

        return result;
    };

     /**
      * ��ֹ����¼�ִ�С�ð��
      * @param  {Object} $el Zepto��jQuery dom����
      */
     function preventClickFn($el){
        $el && $el.on && $el.on('click', function click(e){
            e.stopPropagation();
            e.preventDefault();
            $el.off('click', click);
        })
     }

     /**
      * @description ��ɾ��
      * @param {Object} options
      * @param {String | Object} options.wrapper �¼�ί�и�����֧��cssѡ���� �� Zepto dom����Ĭ�� 'body'
      * @param {String} options.itemSelector ����Ԫ�أ�Ŀǰ��֧��cssѡ������Ĭ�� 'li'
      * @param {String} options.transClass ִ�ж�����Ԫ�ص�className�����磬��������Ԫ����li��ʵ�ʶ������� li>.li-inner��Ĭ�� 'li-inner'
      * @param {String} options.actionClass �Ҳ����Ԫ�ص�className�����磬�Ҳ����Ƿ����˲���Ԫ�� li>.li-action��Ĭ�� 'li-action'
      * @param {Boolean} options.dynamicLimit ��̬��ȡ��������Ŀ�ȣ�����֮��options.maxLimit��Ϊ��̬��ȡ����Ӱ��options.toggleLimit��options.overstepLimit���á�Ĭ�� false
      * @param {Number} options.maxLimit �󻬾��룬��������Ϊ�Ҳ�ɲ���Ԫ�صĿ�ȡ�Ĭ�� -80
      * @param {Number} options.toggleLimit �����������Ϊ����״̬��Ĭ�� options.maxLimit / 2
      * @param {Number} options.overstepLimit �ɳ������롣Ĭ�� options.maxLimit / 2
      * @param {Boolean} options.preventClick ��ֹ���ð�ݡ�Ĭ�� true
      * @param {Number} options.animateTime ����ʱ�䣬��λms��Ĭ�� 300
      * @param {Boolean} options.animateDecrease ��̬���㶯��ִ��ʱ�䡣���ƶ�80px��Ҫ200ms����ô�ƶ�40px��ֻҪ100ms
      * @param {Function} options.disabledHandle ��������������
      * @example
      *     var messageFlip = new Flip();
      *     
      */
    function Flip(options){

        //ȥ��new�ַ���
        if (!(this instanceof Flip)) return new Flip(options);

        var self = this;

        // ��������
        var opt = $.extend({
            wrapper: 'body',
            itemSelector: 'li',
            transClass: 'li-inner',
            actionClass: 'li-action',
            dynamicLimit: false,
            preventClick: true,
            animateTime: 300,
            animateFunction: 'ease-out',
            animateDecrease: false,
            disabledHandle: null
        }, options);

        // ����dom
        var $dom = $(document),
            $wrapper = $(opt.wrapper);

        // �Ƿ�̬��ȡ����ֵ����������Ŀ�ȣ�
        if(!options.dynamicLimit){
            // ƫ�ƽ���ֵ
            opt.maxLimit = (opt.maxLimit && typeof opt.maxLimit === 'number') ?  (opt.maxLimit > 0 ? -opt.maxLimit : opt.maxLimit) : -$wrapper.find(opt.itemSelector).eq(0).find('.' + opt.actionClass).width();
            opt.toggleLimit = (opt.toggleLimit && typeof opt.toggleLimit === 'number') ?  (opt.toggleLimit > 0 ? -opt.toggleLimit : opt.toggleLimit) : opt.maxLimit / 2;
        }

        // ƫ�ƿ��Գ�����Χ
        opt.overstepLimit = (opt.overstepLimit && typeof opt.overstepLimit === 'number') ?  (opt.overstepLimit > 0 ? -opt.overstepLimit : opt.overstepLimit) : 0;

        // �ƶ�1px��Ҫ�ĺ�����
        var MOVETIME_ONEPIXEL = Math.floor(Math.abs(opt.animateTime / opt.maxLimit));

        var currentTarget = null, // ��ǰ������dom����
            transElement = null, // currentTarget�ڲ�����������Ԫ��
            origin = {
                x: 0, // ��ʼx������
                y: 0 // ��ʼy������
            },
            dir = '', // �ж�touch����vΪ��ֱ��hΪˮƽ
            startTime; // ��ʼ����ʱ��


        var isHideAnimate = false, // ��ʶ���ع��ɶ��������У����ض������ܴ��
            isRoll = false; // ��ʶ�Ƿ���ڻ���״̬

        // ���¼�
        $wrapper.on(EVENT.START, start);

        // ���ػ���dom
        function hideSlide(){

            // ��ֹ�ظ����ض���
            if(isHideAnimate) return;

            // ��ʶ���ع��ɶ���������
            isHideAnimate = true;

            var animateTime = opt.animateTime;

            // ����ʱ����ݾ������
            if(opt.animateDecrease){
                animateTime = Math.floor(MOVETIME_ONEPIXEL * Math.abs(__moveX - offsetObj.x) * 2)
            }

            // ִ�����ض���
            slide(transElement, animateTime, {x: 0, y: 0}, function(){
                currentTarget = null;
                isRoll = false;
                isHideAnimate = false;
            });
        }

        // ��ʾ����dom
        function showSlide(){

            // ��ֹ�ظ����ض���
            if(isHideAnimate) return;

            // ִ�л�������
            slide(transElement, opt.animateTime, {x: opt.maxLimit, y: 0}, function(){
                // ��ʶ���ڻ���״̬
                isRoll = true;
            });
        }

        /**
         * @description Ԫ��transformƫ��
         * @param  {Object} $el       Zepto��jQuery dom����
         * @param  {Object} offsetObj ƫ��ֵ��x���y�ᣬ���� {x: 0, y: 0}
         */
        function transform($el, offsetObj){
            $el.css(vendorPrefix + 'transform', 'translate3D('+ offsetObj.x +'px,' + offsetObj.y + 'px, 0)')
                .attr('data-movex', offsetObj.x);
        }

        /**
         * transition����
         * @param  {Object} $el           Zepto��jQuery dom����
         * @param  {Number}   animateTime ����ִ��ʱ��
         * @param  {Object}   offsetObj   ƫ��ֵ��x���y�ᣬ���� {x: 0, y: 0}
         * @param  {Function} callback    ����ִ����ص�����
         */
        function slide($el, animateTime, offsetObj, callback){

            var __moveX = $el.attr('data-movex') ? parseInt($el.attr('data-movex'), 10) : 0; // �ƶ�����

            var __animateTime = Math.floor(MOVETIME_ONEPIXEL * Math.abs(__moveX - offsetObj.x) * 2); // �ƶ�ʱ��

            if(__moveX == offsetObj.x){
                callback && (typeof callback === 'function') && callback();
            }else{
                $el.css(vendorPrefix + 'transition', 'transform ' + (animateTime) + 'ms ease-out 0s')
                    .attr({
                        'data-translatex': offsetObj.x,
                        'data-movex': offsetObj.x
                    })
                    .one(transitionEnd, function(){
                        $el.css(vendorPrefix + 'transition', '');
                        callback && (typeof callback === 'function') && callback();
                    });

                transform($el, offsetObj);
            }
        }

        /**
         * ��ʼ�ƶ�ʱ����
         * @param  {Object} e �¼�����
         */
        function start(e){
            if(opt.disabledHandle && typeof opt.disabledHandle === 'function' && opt.disabledHandle()){
                return;
            }

            var evt = getStandEvent(e);

            origin.x = evt.origin.x;
            origin.y = evt.origin.y;
            startTime = Date.now();

            var $target = $(e.target).parents(opt.itemSelector);

            // ��ʼ��
            dir = '';

            // ���ڻ���״̬
            if(currentTarget && currentTarget.length > 0){
                // ��������Ĳ���ɾ�����Ƴ���ǰ״̬
                if($(e.target).hasClass(opt.actionClass) || $(e.target).parents('.' + opt.actionClass).length > 0){
                    preventClickFn($target);
                }else{
                    preventClickFn($target);

                    // ��ֹĬ����Ϊ��������
                    e.preventDefault();

                    // ���ػ���Ԫ��
                    hideSlide();

                    return;
                }
            }

            if($target.length <= 0) return;

            currentTarget = $target;
            transElement = currentTarget.find('.' + opt.transClass);

            // �Ƿ�̬��ȡ����ֵ����������Ŀ�ȣ�
            if(options.dynamicLimit){
                // ƫ�ƽ���ֵ
                opt.maxLimit = -currentTarget.find('.' + opt.actionClass).width();
                opt.toggleLimit = opt.maxLimit / 2;
            }

            $dom.on(EVENT.MOVE, move);
            $dom.on(EVENT.END, end);
        }

        /**
         * �����ƶ�ʱ����
         * @param  {Object} e �¼�����
         */
        function move(e){
            if (!currentTarget || !transElement) return;

            var evt = getStandEvent(e),
                tranX,
                moveX = evt.origin.x - origin.x,
                moveY = evt.origin.y - origin.y,
                absDistX = Math.abs(moveX),
                absDistY = Math.abs(moveY);

            // ȡ���жϷ���
            if(!dir){
                if(absDistX >= absDistY){
                    dir = 'h';
                }else{
                    dir = 'v';
                }
            }

            // ˮƽ��������
            if(dir === 'h'){

                // �����ƶ�
                tranX = parseInt(transElement.attr('data-translatex'), 10) || 0;
                tranX += moveX;

                // �߽�ֵ�޶�
                if(tranX < (opt.maxLimit + opt.overstepLimit)){
                    tranX = opt.maxLimit + opt.overstepLimit;
                }else if(tranX > -opt.overstepLimit){
                    tranX = -opt.overstepLimit;
                }

                transform(transElement, {x: tranX, y: 0});

                // ��ֹĬ���¼�
                e.preventDefault();
            }else{
                $dom.off(EVENT.MOVE, move);
                $dom.off(EVENT.END, end);

                end(e);
            }
        }

        /**
         * �ƶ�����ʱ����
         * @param  {Object} e �¼�����
         */
        function end(e){
            if (!currentTarget || !transElement) return;

            var evt = getStandEvent(e),
                moveX = evt.origin.x - origin.x,
                tranX = 0,
                endTime = Date.now();

            tranX = parseInt(transElement.attr('data-translatex'), 10) || 0;
            tranX += moveX;

            // ����
            if(tranX < opt.toggleLimit){
                showSlide();
            }else{
                hideSlide();
            }

            //��갴���¼�������PC���У�
            if(opt.preventClick && EVENT.START === 'mousedown' && ((startTime && endTime - startTime > 300) || (dir ==='h' && Math.abs(moveX) > 3))) {
                preventClickFn(currentTarget);
                startTime = null;
            }

            // ��ֹĬ����Ϊ
            // e.preventDefault();

            $(document).off(EVENT.MOVE, move);
            $(document).off(EVENT.END, end);
        }

        /**
         * @method destroy ���ٺ���
         */
        this.destroy = function(){
            $wrapper.off(EVENT.START);
            self.reset();
        }

        /**
         * @method reset ���û���״̬
         */
        this.reset = function(){
            if(currentTarget){
                hideSlide();
            }
        }

        /**
         * @method hasRollState �Ƿ��л���״̬
         */
        this.hasRollState = function(){
            return isRoll;
        }
    }


    if ( typeof define === "function" && define.amd ) {
        define( "flip", [], function () { return Flip; } );
    }else{
        window.Flip = Flip;
    }

})();
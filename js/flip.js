define(['zepto'], function($){

    /**
     * ��׼��λ����Ϣ
     * @param e
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

    // ǰ׺����
    var body=document.body || document.documentElement,
        style=body.style,
        vendorPrefix,
        transitionEnd;

    vendorPrefix = (function(){
        var vendor = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
            i = 0,
            len = vendor.length;

        while(i < len){
            if(typeof style[vendor[i] + 'transition'] === 'string'){
                return vendor;
            }
            i++;
        }
        return '';
    })();

    transitionEnd = (function(){
        var transEndEventNames = {
              WebkitTransition : 'webkitTransitionEnd',
              MozTransition    : 'transitionend',
              OTransition      : 'oTransitionEnd otransitionend',
              transition       : 'transitionend'
            };

        for(var name in transEndEventNames){
            if(typeof style[name] === "string"){
                return transEndEventNames[name]
            }
        }
    })();

     // ��ֹ����¼�ִ�С�ð��
     function preventClickFn($el){

        $el.on('click', function click(e){
            e.stopPropagation();
            e.preventDefault();
            $el.off('click', click);
        })
     }

    // ƫ����
    function transform($el, offsetObj){
        $el.css(vendorPrefix + 'transform', 'translate3D('+ offsetObj.x +'px,' + offsetObj.y + 'px, 0)')
            .attr('data-moveX', offsetObj.x);
    }

    // ƫ�ƶ���
    function slide($el, animateTime, offsetObj, callback){

        if($el.attr('data-moveX') == offsetObj.x){
            callback && (typeof callback === 'function') && callback();
        }else{
            $el.css(vendorPrefix + 'transition', 'transform ' + animateTime + 'ms ease-out 0s')
                .attr({
                    'data-translateX': offsetObj.x,
                    'data-moveX': offsetObj.x
                })
                .one(transitionEnd, function(){
                    $el.css(vendorPrefix + 'transition', '');
                    callback && (typeof callback === 'function') && callback();
                });

            transform($el, offsetObj);
        }

    }

     /**
      * [Flip description]
      * @param {[type]} options [description]
      */
    function Flip(options){

        //ȥ��new�ַ���
        // if (this instanceof Flip) return new Flip(options);

        var self = this;

        // ��������
        var opt = $.extend({
            wrapper: 'body',
            itemSelector: 'li',
            transClass: 'li-inner',
            deleteClass: 'delete',
            maxLimit: -80,
            overstepLimit: -40,
            preventClick: true,
            animateTime: 200,
            disabledHandle: null // ������������
        }, options);

        // ƫ�ƽ���ֵ
        opt.toggleLimit = opt.toggleLimit || opt.maxLimit / 2;

        // �ڲ�����
        var currentTarget = null, // ��ǰ������dom����
            transElement = null, // currentTarget�ڲ�����������Ԫ��
            origin = {
                x: 0, // ��ʼx������
                y: 0 // ��ʼy������
            },
            dir = '', // �ж�touch����vΪ��ֱ��hΪˮƽ
            startTime; // ��ʼ����ʱ��

        // ����dom
        var $dom = $(document),
            $wrapper = $(opt.wrapper);

        // ��ʶ���ڽ������ع��ɶ���
        var isFlipAnimate = false;

        // ���ڻ���״̬��ֻҪԪ���Ƴ�ԭ����λ�ö�Ϊ true
        var isFlip = false;

        // ���¼�
        $(opt.wrapper).on(EVENT.START, start);

        // ���ػ���dom
        function hideSlide(){

            // ��ʶ���ڽ������ع��ɶ���
            if(isFlipAnimate) return;

            isFlipAnimate = true;

            slide(transElement, opt.animateTime, {x: 0, y: 0}, function(){
                currentTarget = null;
                isFlip = false;
                isFlipAnimate = false;
            });
        }

        // ��ʾ����dom
        function showSlide(){

            // ��ʶ���ڽ������ع��ɶ���
            if(isFlipAnimate) return;

            slide(transElement, opt.animateTime, {x: opt.maxLimit, y: 0});
        }

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
                if($(e.target).hasClass(opt.deleteClass)){
                    preventClickFn($target);
                }else{
                    preventClickFn($target);

                    // ��ֹĬ����Ϊ��������
                    e.preventDefault();

                    hideSlide();

                    return;
                }
            }

            currentTarget = $target;

            transElement = currentTarget.find('.' + opt.transClass);

            $dom.on(EVENT.MOVE, move);
            $dom.on(EVENT.END, end);
        }

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
                tranX = parseInt(transElement.attr('data-translateX'), 10) || 0;
                tranX += moveX;

                // �߽�ֵ�޶�
                if(tranX < (opt.maxLimit + opt.overstepLimit)){
                    tranX = opt.maxLimit + opt.overstepLimit;
                }else if(tranX > 0){
                    tranX = 0;
                }

                transform(transElement, {x: tranX, y: 0});

                // ��ֹĬ����Ϊ��������
                e.preventDefault();
            }else{
                $dom.off(EVENT.MOVE, move);
                $dom.off(EVENT.END, end);

                end(e);
            }
        }

        function end(e){
            if (!currentTarget || !transElement) return;

            var evt = getStandEvent(e),
                moveX = evt.origin.x - origin.x,
                tranX = 0,
                endTime = Date.now();

            tranX = parseInt(transElement.attr('data-translateX'), 10) || 0;
            tranX += moveX;

            // ����
            if(tranX < opt.toggleLimit){
                // ��ʶ���ڻ���״̬
                isFlip = true;
                showSlide();
            }else{
                hideSlide();
            }

            //��갴���¼�������PC���У�
            if(opt.preventClick && EVENT.START === 'mousedown' && ((startTime && endTime - startTime > 300) || Math.abs(moveX) > 5)) {
                preventClickFn(currentTarget);
                startTime = null;
            }

            // ��ֹĬ����Ϊ
            e.preventDefault();

            $(document).off(EVENT.MOVE, move);
            $(document).off(EVENT.END, end);
        }

        // ����
        this.destroy = function(){
            $(opt.wrapper).off(EVENT.START);
            self.reset();
        }

        // ������ڻ���״̬��������
        this.reset = function(){
            if(currentTarget){
                hideSlide();
            }
        }

        // ��ǰ�Ƿ��л���״̬
        this.hasFlip = function(){
            return (currentTarget && currentTarget.length > 0) ? true : false;
        }
    }

    return Flip;

});
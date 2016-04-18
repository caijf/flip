require.config({
    baseUrl: '../static',
    shim:{
        zepto: {
            exports: '$'
        }
    },
    paths: {
        zepto: 'third/zepto',
        flip: 'js/flip'
    }
});


require(['zepto', 'flip'], function($, xlip){

    // 测试 左滑删除1
    window.test_flip_1 = new xlip({
        wrapper: '#test-flip1',
        itemSelector: 'li',
        transClass: 'li-inner',
        actionClass: 'li-action',
        overstepLimit: -30,
        disabledHandle: disabledHandle
    });

    // 测试 左滑删除 2
    window.test_flip_2 = new xlip({
        wrapper: '#test-flip2',
        itemSelector: 'li',
        transClass: 'li-inner',
        actionClass: 'li-action',
        overstepLimit: -30,
        disabledHandle: disabledHandle
    });

    // 测试 左滑删除 3
    window.test_flip_3 = new xlip({
        wrapper: '#test-flip3',
        itemSelector: 'li',
        transClass: 'li-inner',
        actionClass: 'li-action',
        dynamicLimit: true,
        overstepLimit: -30,
        disabledHandle: disabledHandle
    });


    $('.attention').on('click', function(e){
        // console.log('click attention');
    });

    $('.delete').on('click', function(e){
        // console.log('click delete');
    });

    $('body').on('click', 'li', function(e){
        // console.log('click li');
    })

    $(window).on('resize', function(e){
        if($(document).width() > 768){
            test_flip_1.reset();
            test_flip_2.reset();
            test_flip_3.reset();
        }
    });

    function disabledHandle(){
        // dom宽度大于 768px 返回false
        return $(document).width() > 768;
    }

});
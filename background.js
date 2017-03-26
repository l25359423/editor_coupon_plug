chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
    if(request.cmd=='update_coupon_valid') {
        $.post(request.url,
            {"coupon_id": request.coupon_id, "user_id": request.user_id, "valid_time": request.valid_time, "type": "-1", "login_type":"-1", "webSiteType": request.webSiteType, "store_type": request.store_type, "store_id": request.store_id},
            function(res){
                sendResponse(JSON.parse(res));
            });
        return true;
    } else if(request.cmd == 'login') {
        $.post(request.url,
            {"name":request.name, "password":request.password, "login_type":"-1"},
            function(res){
                sendResponse(JSON.parse(res));
            });
        return true;
    } else if(request.cmd=='sold_out'){
        $.post(request.url,
            {"soldOutCouponId": request.soldOutCouponId, "user_id": request.user_id, "type": "-1", "login_type":"-1", "webSiteType": request.webSiteType, "store_type": request.store_type, "store_id": request.store_id},
            function(res){
                sendResponse(JSON.parse(res));
            });
        return true;
    } else if (request.cmd=='open_update_coupon') {
        var url=request.url;                     //转向网页的地址;
        var name='update coupon';                //网页名称，可为空;
        var iWidth=screen.width;                         //弹出窗口的宽度;
        var iHeight=screen.height;                         //弹出窗口的高度;
        var iTop = 0;                            //获得窗口的垂直位置
        var iLeft = 0;                           //获得窗口的水平位置
        window.open(url, name, 'height=' + iHeight + ',,innerHeight=' + iHeight + ',width=' + iWidth + ',innerWidth=' + iWidth + ',top=' + iTop + ',left=' + iLeft + ',status=no,toolbar=no,menubar=no,location=no,resizable=no,scrollbars=0,titlebar=no');
    }
})

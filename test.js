
var host = "http://52.9.249.199:12580";
// http://52.9.249.199:12580
var website_type = 0;
var store_type = null;
var store_id = null;

// 初始化加载
$(document).ready(function(){

	set_store_id();
	set_store_type();
	set_web_site_type();
	add_js_to_page();

	if ( !check_editor() ) {
		return false;
	}

	// $("a[class='btn t-btn get-deal-btn']").css("width","auto");
	// $("a[class='btn h-btn get-deal-btn']").css("width","auto");

	var coupon_len = $(".c-r-item").length;
	
	if ( coupon_len <= 0 ) return false;

	$(".get-deal-btn").attr("target","_blank");

	$(".info").each(function(i,item){
		var code = $(item).parents(".c-r-item").find(".operate").find("p").text();
		var btn_html = get_btn_html(code);
		$(item).css("position","relative");
		$(item).append(btn_html);
		if ( code ) {
			$(item).parents(".c-r-item").find(".use-tag").append('<span>&nbsp;&nbsp;code：'+code+'</span>');
		}
	})

	var code_clip=new Clipboard("[data-type='copyCode']",{
		text:function(trigger){
			return $(trigger).attr("title");
		}
	});

	var coupon_id_clip=new Clipboard("[data-type='editorDeBug']",{
		text:function(trigger){
			return $(trigger).parents(".c-r-item").attr("data-value");
		}
	});

	$(".editor-item").on('click', function(){
		if ( $(this).attr("show-type") == "hide" ) {
			$(".editor-item").attr("show-type", "hide");
			$(".editor-item").find("span").text("编辑");
			$(".editor-item-d").hide();
			$(this).attr("show-type", "show");
			$(this).find("span").text("关闭");
			$(this).parents(".editor-r").find(".editor-item-d").show();
		} else {
			$(this).attr("show-type", "hide");
			$(this).find("span").text("编辑");
			$(this).parents(".editor-r").find(".editor-item-d").hide();
		}
	});

	$("[data-type='editorSoldOut']").on('click', function(){
		if ( !fn_check_login() ) {
			go_login();
			return false;
		}
		fn_sold_out_coupon(this);
	})

	$("[data-type='editorValid']").on('click', function(){
		if ( !fn_check_login() ) {
			go_login();
			return false;
		}
		fn_show_valid(this);
	})

	$("[data-type='goEditorSystem']").on('click', function(){
		fn_go_editor_system(this);
	})

	$(".get-deal-btn").on('click', function(){
		window.open($(this).attr("href"));
	})

});

// 添加js到页面
function add_js_to_page()
{
	var a = chrome.extension.getURL("/Zebra_Datepicker-master/public/javascript/zebra_datepicker.js");
	//$('<link rel="stylesheet" type="text/css" href="' + a + '" >').appendTo("head");
	$('<scrpit src="' + a + '" ></scrpit>').appendTo("head");
}

// 下架操作
function fn_sold_out_coupon(obj){

    if ( !check_submit ) return false;

    check_submit = false;

    var coupon_id = $(obj).parents(".c-r-item").attr("data-value");
    var user_id = localStorage.editor_system_user_id;

    chrome.runtime.sendMessage({"cmd":"sold_out","url":get_api_url('sold_out'),"soldOutCouponId": coupon_id, "user_id": user_id, "webSiteType": website_type, "store_type": store_type, "store_id": store_id},function(response){
        if ( response.status==200 ) {
            alert(response.msg);
        } else {
            alert(response.msg);
        }
        check_submit = true;
    })
}

var valid_coupon_id = null;

// 显示valid时间修改
function fn_show_valid(obj){
	var time_html = '<div data-type="s_valid_time" style="position:fixed;top: 50%;left:50%;margin: -150px 0 0 -150px;width: 300px;height: 200px;padding:20px;background-color:#4A374A;border-radius:10px;border:1px solid black;z-index:11111;">';

	time_html += '<input type="text" style="width: 265px;height: 38px;margin-bottom: 10px;outline: none;padding: 10px;font-size: 13px;color: #fff;text-shadow:1px 1px 1px;border-top: 1px solid #312E3D;border-left: 1px solid #312E3D; border-right: 1px solid #312E3D;border-bottom: 1px solid #56536A;border-radius: 4px;background-color: #2D2D3F;" id="valid_time" name="valid_time" data-date-format="yyyy-mm-dd">';
	time_html += '<div>';
	time_html += '<button style="width: 265px;min-height: 20px;margin-top:15px;display: block;background-color: #4a77d4;border: 1px solid #3762bc;color: #fff;padding: 9px 14px;font-size: 15px;line-height: normal;border-radius: 5px;" data-type="editorUpdateValid" type="button">确定</button>';
    time_html += '<button style="width: 265px;min-height: 20px;margin-top:15px;display: block;background-color: #4a77d4;border: 1px solid #3762bc;color: #fff;padding: 9px 14px;font-size: 15px;line-height: normal;border-radius: 5px;" onclick=\"javascript:$(this).parents(\'[data-type=s_valid_time]\').hide()\" type="button">关闭</button>';
	time_html += '</div>';
	time_html += '</div>';

	$("[data-type='s_valid_time']").remove();
	$("body").append(time_html);

	//初始化开始时间
    $('#valid_time').Zebra_DatePicker();

    valid_coupon_id = $(obj).parents(".c-r-item").attr("data-value");

    $("[data-type='editorUpdateValid']").on('click', function(){

    	var user_id = localStorage.editor_system_user_id;
		var valid_time = $("#valid_time").val();

    	if(!valid_time){
    		alert("请填写过期时间");
    		return false;
    	}

    	if ( !check_submit ) return false;

		check_submit = false;

    	chrome.runtime.sendMessage({"cmd":"update_coupon_valid","url":get_api_url('update_coupon_valid'),"coupon_id": valid_coupon_id, "user_id": user_id, "valid_time": valid_time, "webSiteType": website_type, "store_type": store_type, "store_id": store_id},function(response){
		  	if ( response.status==200 ) {
		  		$("[data-type='s_valid_time']").hide();
                alert(response.msg);
	    	} else {
	    		alert(response.msg);
	    	}
	    	check_submit = true;
        })

	})
}


// 跳转后台
function fn_go_editor_system(obj)
{
	var coupon_id = $(obj).parents(".c-r-item").attr("data-value");
    var user_id = localStorage.editor_system_user_id;

	if ( !coupon_id ) {
		alert("coupon_id不能为空");
		return false;
	}

    var url = host+'/index.php/TagsCoupon/openUpdateCouponHttpsJumpHttp?coupon_id='+coupon_id+"&webSiteType="+website_type+"&user_id="+user_id+"&login_type=-1&store_type="+store_type+"&store_id="+store_id;

    chrome.runtime.sendMessage({"cmd":"open_update_coupon","url":url},function(response){
    })
}

// 检测登录
function fn_check_login(){
	
	if ( !localStorage.editor_system_user_id ) 
	{
		return false;
	}
	
	return true;
}

// show login
function go_login(){
	
	$("body").append(get_login_html());

	$("[data-type='editorLogin']").on('click', function(){
		editor_login();
	});

	$("[data-type='editorLoginClose']").on('click', function(item){
		$(this).parents("#editor_login").hide();
	});

}

// login 操作
var check_submit = true;
function editor_login(){

    if ( !check_submit ) return false;

    check_submit = false;

    if( !check_login_from() ) {
        check_submit = true;
        return false;
    }

    chrome.runtime.sendMessage({"cmd":"login","url":get_api_url('login'),"name":$("#editor_user_name").val(), "password":$("#editor_password").val()},function(response){
        if ( response.status==200 ) {
            localStorage.editor_system_user_id = response.user_id;
            $("#editor_login").hide();
        } else {
            alert("用户名或密码错误！");
        }
        check_submit = true;
    })
}


// 表单验证
function check_login_from(){
	
	if ( !$("#editor_user_name").val() )
	{
		alert("请输入用户名");
		return false;
	}

	if ( !$("#editor_password").val() )
	{
		alert("请输入密码");
		return false;
	}

	return true;
}

// 获取下架和验证 btn HTML
function get_btn_html(code){

	var btn_html = '<div class="editor-r">';
	btn_html += '<div class="editor-item-d" data-type="editorDeBug" onselectstart="return false">';
	btn_html += '<span>调试</span>';
	btn_html += '</div>';
	btn_html += '<div class="editor-item-d" data-type="goEditorSystem" onselectstart="return false">';
	btn_html += '<span>修改</span>';
	btn_html += '</div>';
	btn_html += '<div class="editor-item-d" data-type="editorValid" onselectstart="return false">';
	btn_html += '<span>验证</span>';
	btn_html += '</div>';
	btn_html += '<div class="editor-item-d" data-type="editorSoldOut" onselectstart="return false">';
	btn_html += '<span>下架</span>';
	btn_html += '</div>';
	btn_html += '<div class="editor-item-d" title="'+code+'" data-type="copyCode" onselectstart="return false">';
	btn_html += '<span>code</span>';
	btn_html += '</div>';
	btn_html += '<div class="editor-item" show-type="hide" onselectstart="return false">';
	btn_html += '<span>编辑</span>';
	btn_html += '</div>';
	btn_html += '</div>';

	// var btn_html = '<div class="extension" style="position: absolute;right: 10px;bottom: 10px;overflow: hidden;">';
	//
	// btn_html += '<div class="tool-btn" style="padding: 8px 14px 8px 14px;float: left;background-color: #008ddb;color: #fff;border-radius: 3px;margin-right: 10px;cursor: pointer;" data-type="editorSoldOut">';
	// btn_html += '下架';
	// btn_html += '</div>';
	// btn_html += '<div class="tool-btn" style="float: left;padding: 8px 14px 8px 14px;float: left;background-color: #008ddb;color: #fff;border-radius: 3px;margin-right: 10px;cursor: pointer;" data-type="editorValid">';
	// btn_html += '验证';
	// btn_html += '</div>';
	// btn_html += '<div class="tool-btn" style="float: left;padding: 8px 14px 8px 14px;float: left;background-color: #008ddb;color: #fff;border-radius: 3px;margin-right: 10px;cursor: pointer;" data-type="goEditorSystem">';
	// btn_html += '修改';
	// btn_html += '</div>';
	// btn_html += '</div>';

	return btn_html;

}


// 获取登录 HTML
function get_login_html(){

	var login_html = '<div id="editor_login" style="position:fixed;top: 50%;left:50%;margin: -150px 0 0 -150px;width: 300px;height: 300px;padding:20px;background-color:#4A374A;border-radius:10px;border:1px solid black;z-index:111111;">';
    
    login_html += '<h1 style="color: #fff;text-shadow:0 0 10px;   letter-spacing: 1px;text-align: center;">Editor Login</h1>';
    login_html += '<form id="editor_login_form" method="post">';  
    login_html += '<input type="text" style="width: 265px;height: 38px;margin-top:20px;margin-bottom: 10px;outline: none;padding: 10px;font-size: 13px;color: #fff;text-shadow:1px 1px 1px;border-top: 1px solid #312E3D;border-left: 1px solid #312E3D; border-right: 1px solid #312E3D;border-bottom: 1px solid #56536A;border-radius: 4px;background-color: #2D2D3F;" required="required" placeholder="用户名" id="editor_user_name" name="editor_user_name"></input>';  
    login_html += '<input type="password" style="width: 265px;height: 38px;margin-bottom: 10px;outline: none;padding: 10px;font-size: 13px;color: #fff;text-shadow:1px 1px 1px;border-top: 1px solid #312E3D;border-left: 1px solid #312E3D; border-right: 1px solid #312E3D;border-bottom: 1px solid #56536A;border-radius: 4px;background-color: #2D2D3F;" required="required" placeholder="密码" id="editor_password" name="editor_password"></input>';
    login_html += '<button style="width: 265px;min-height: 20px;margin-top:15px;display: block;background-color: #4a77d4;border: 1px solid #3762bc;color: #fff;padding: 9px 14px;font-size: 15px;line-height: normal;border-radius: 5px;" data-type="editorLogin" type="button">登录</button>';  
    login_html += '<button style="width: 265px;min-height: 20px;margin-top:15px;display: block;background-color: #4a77d4;border: 1px solid #3762bc;color: #fff;padding: 9px 14px;font-size: 15px;line-height: normal;border-radius: 5px;" data-type="editorLoginClose" type="button">关闭</button>';  
    login_html += '</form>';  
    login_html += '</div>';  

    return login_html;

}

// 获取网站类型
function set_web_site_type()
{
	if ( location.hostname.indexOf("everafterguide") >= 0 )
	{
		website_type = 0;
	} else if ( location.hostname.indexOf("couponokay") >= 0 ) {
		website_type = 1;
	} else if ( location.hostname.indexOf("discountsoff") >= 0 ) {
		website_type = 2;
	}
}

// 获取store类型
function set_store_type(){
	var type_store_id = $("#coupon-brand").attr("data-id");
	
	if ( !type_store_id ) {
		store_type = 1;
	} else {
		store_type = 0;
	}
}

// 验证此网站是否可编辑
function check_editor(){
	if ( !store_id || (!website_type && website_type != 0) || (!store_type && store_type != 0)
		|| location.hostname == "52.9.249.199" ) {
		return false;
	}
	return true;
}

// 获取store_id
function set_store_id(){
	store_id = $("#coupon-brand").attr("data-id");
	if ( !store_id ) {
		store_id = $("#coupon-search").attr("data-id");
	}
}

// 获取某个接口的请求地址
function get_api_url(api_type){
	var api_url = "";
	if ( api_type== "sold_out" ) {
		if ( store_type == 0 ) {
			api_url = host+"/index.php/TagsCoupon/soldOutCouponAjax";
		} else if ( store_type == 1 ) {
			api_url = host+"/index.php/SearchCoupon/soldOutCouponAjax";
		}
	} else if ( api_type == "update_coupon_valid" ) {
		if ( store_type == 0 ) {
			api_url = host+"/index.php/TagsCoupon/updateCouponValidAjax";
		} else if ( store_type == 1 ) {
			api_url = host+"/index.php/SearchCoupon/updateCouponValidAjax";
		}
	} else if ( api_type == "login" ) {
        api_url = host+"/index.php/Login/loginAjax";
    } else if ( api_type == "check_permission" ) {
		api_url = host+"/index.php/CouponStoreAllocation/checkPermissionAjax";
	}
	return api_url;
}
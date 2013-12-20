jQuery.cnuAction = {

    getBaseUrl: function(){
        // return 'proxy.php?pa=';
        return 'http://115.47.56.228:8080/alumni/service';
    },
	
	convert2HTML: function ( str ){
		var re = /[\r\n]+/mg;
		return str.replace( re, "</p><br/><p>");
	},

	getQueryStringByName: function (name){
		var result = location.search.match(new RegExp("[\?\&]" + name+ "=([^\&]+)","i"));
		if(result == null || result.length < 1)
		{
			return "";
		}
		return result[1];
	}, 
	
	//登录
    login: function (username, password, rememberme){
        $.ajax({
            url: $.cnuAction.getBaseUrl() + '/login?v=1&cid=1',
            type: 'POST',
            contentType: 'application/json',
            dataType: "json",
            data: '{name:"' + username + '",password:"' + password + '"}'
        })
        .done(function(d) {
            if(d.ec==1 && d.rc==1){
                if( d.admin == 1 ){ 
                    $.cookie('admin', d.admin);
                }
                $.cookie('sid', d.sid);
                location.href = './alumnus.html';
            } else {
                alert('用户名或密码错误');
            }
        })
        .fail(function() {
            alert('connection fail, try later please!');
        });
    },

    accountCreate: function(username,password,idCardNo,stuNo){
        if (!stuNo) {stuNo='';};
        $.ajax({
            url: $.cnuAction.getBaseUrl() + '/account/create?v=1&cid=1',
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: '{name:"' + username + '",password:"' + password + '",idCardNo:"' + idCardNo + '",stuNo:"' + stuNo + '"}'
        })
        .done(function(d) {
            if (d.ec==1){
                $.cookie('sid', d.sid);
                alert('注册成功');
                location.href = './alumnus.html';
            } else if (d.ec==2) {
                $.cookie('sid', d.sid);
                location.href = './setup.html';
            } else if (d.ec==-2) {
                alert('该登录名已经被注册过');
            } else if (d.ec==0) {
                alert('注册失败，请稍后再试');
            }
        })
        .fail(function() {
            alert('connection fail, try later please!');
        })
        
    },
	
	//设置普通列表
    mediaList: function (type, page, num, previewLen) {
        sid = $.cookie('sid');
        if (!type) type=1;
        if (!page) {page=1};
        if (!num) {num=3};
        if (!previewLen) {previewLen=200};
        $.ajax({
            url: $.cnuAction.getBaseUrl() + '/media/list?v=1&cid=1',
            type: 'get',
            dataType: "json",
            data: {sid:sid, type:type, page:page, num:num, previewLen:previewLen}
        })
        .done(function(d) {
            if (d.ec==1 && d.rc==1) {
                // set title
                if (type==1) {title='校友动态';}
                else if(type==2) {title='通知公告';}
                else if(type==3) {title='母校动态';}
                else if(type==4) {title='回馈母校';}
                $('.news-wrap .title').text(title);
                // template render
                bt = baidu.template;
                $('#d-news-list').html( bt('t:tpl-new-list',d) );
				
				
				$(".item-text .input-btn").each(function(){
					$.cnuAction.setDetailHerf($(this));
				});
				
				$(".item-pic a").each(function(){
					$.cnuAction.setDetailHerf($(this));
				});
				
				
				$('#a-prev-page').click(function(event) {
					
					if ($(this).attr('data-page-no')<1) {
						return false;
					}
					$.cnuAction.mediaList(current_type, $(this).attr('data-page-no'));
					$(this).attr('data-page-no', $(this).attr('data-page-no')-1);
					$('#a-prev-page').attr('data-page-no', $('#a-prev-page').attr('data-page-no')-1);
				});
				$('#a-next-page').click(function(event) {
					$.cnuAction.mediaList(current_type, $(this).attr('data-page-no'));
					$(this).attr('data-page-no', $(this).attr('data-page-no')+1);
					$('#a-prev-page').attr('data-page-no', $('#a-prev-page').attr('data-page-no')+1);
				});
            } else if (d.ec==-1 || ec==-5){
                alert('操作超时，请重新登陆');
				location.href = './login.html';
            }
        })
        .fail(function() {
            alert('connection fail, try later please!');
        });
        
    },
	
	//设置幻灯
    mediaTopList: function (type, page, num, previewLen) {
        sid = $.cookie('sid');
        if (!type) type=1;
        if (!page) {page=1};
        if (!num) {num=10};
        if (!previewLen) {previewLen=100};
        $.ajax({
            url: $.cnuAction.getBaseUrl() + '/media/top/list?v=1&cid=1',
            type: 'get',
            dataType: "json",
            data: {sid:sid, type:type, page:page, num:num, previewLen:previewLen}
        })
        .done(function(d) {
            if (d.ec==1 && d.rc==1) {
               bt = baidu.template;
			   $('#b_item').html( bt('t:tpl-banner-list',d) );
			   
				$('.flexslider').flexslider();
				$('.flexslider').hover(function() {
					$('.flex-direction-nav li a.prev').css('display', 'block');
					$('.flex-direction-nav li a.next').css('display', 'block');
				}, function() {
					$('.flex-direction-nav li a.prev').css('display', 'none');
					$('.flex-direction-nav li a.next').css('display', 'none');
				});
				
				$(".slides a").each(function(){
					$.cnuAction.setDetailHerf($(this));
				});
            };
        })
        .fail(function() {
            alert('connection fail, try later please!');
        });
        
    },
	
	//设置文章按钮链接
	setDetailHerf: function(obj){
		obj.attr("href", './details.html?detailId=' + obj.attr("data-id"));
	},
	
	//设置文章详情
	mediaDetail: function(){
		var detailId =  $.cnuAction.getQueryStringByName('detailId');
		sid = $.cookie('sid');
		
        $.ajax({
            url: $.cnuAction.getBaseUrl() + '/media/'+ detailId +'/detail?v=1&cid=1',
            type: 'get',
            dataType: "json",
            data: {sid:sid}
        })
        .done(function(d) {
			
            if (d.ec==1 && d.rc==1) {
				
               bt = baidu.template;
			   
			   $('#details_wrap').html( bt('t:tpl-new-detail',d) );
			   
			   $("#detail_content").html($.cnuAction.convert2HTML(d.content))
			   
            };
        })
        .fail(function() {
            alert('connection fail, try later please!');
        });
		
	},

    // 获取院系信息
    configDeptList: function(){
        $.ajax({
            url: $.cnuAction.getBaseUrl() + '/config/dept/list?v=1&cid=1',
            type: 'get',
            dataType: "json",
            data: {sid:sid}
            async: false,
        })
        .done(function(d){
            console.log(d);
        })

    },

    // 获取部门组织双级列表
	configOrgList: function(){
        $.ajax({
            url: $.cnuAction.getBaseUrl() + '/config/org/list?v=1&cid=1',
            type: 'get',
            dataType: "json",
            data: {sid:sid}
            async: false,
        })
        .done(function(d){
            console.log(d);
        })
    }
}
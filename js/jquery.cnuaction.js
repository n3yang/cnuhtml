jQuery.cnuAction = {

    getBaseUri: function(){
        return 'http://115.47.56.228:8080/alumni/service';
    },


    login: function (username, password, rememberme){
        $.ajax({
            // url: 'proxy.php?pa=login',
            url: 'http://115.47.56.228:8080/alumni/service/login?v=1&cid=1',
            type: 'POST',
            contentType: 'application/json',
            dataType: "json",
            data: '{name:"' + username + '",password:"' + password + '"}',
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

    mediaList: function (type, page, num, previewLen) {
        sid = $.cookie('sid');
        if (!type) type=1;
        if (!page) {page=1};
        if (!num) {num=3};
        if (!previewLen) {previewLen=200};
        $.ajax({
            // url: 'proxy.php?pa=media/list?v=1&cid=1',
            url: 'http://115.47.56.228:8080/alumni/service/media/list?v=1&cid=1',
            type: 'get',
            dataType: "json",
            data: {sid:sid, type:type, page:page, num:num, previewLen:previewLen},
        })
        .done(function(d) {
            if (d.ec==1 && d.rc==1) {
                // set title
                if (type==1) {title='校友动态';}
                else if(type==2) {title='通知公告';}
                $('.news-wrap .title').text(title);
                // template render
                bt=baidu.template;
                document.getElementById('d-news-list').innerHTML = bt('t:tpl-new-list',d);
				
				$('#a-prev-page').click(function(event) {
					
					if ($(this).attr('data-page-no')<1) {
						return false;
					}
					$.cnuAction.mediaList(current_type, $(this).attr('data-page-no'));
					$(this).attr('data-page-no', $(this).attr('data-page-no')-1);
					$('#a-prev-page').attr('data-page-no', $('#a-prev-page').attr('data-page-no')-1);
					console.log($('#a-prev-page').attr('data-page-no'));
				});
				$('#a-next-page').click(function(event) {
					$.cnuAction.mediaList(current_type, $(this).attr('data-page-no'));
					$(this).attr('data-page-no', $(this).attr('data-page-no')+1);
					$('#a-prev-page').attr('data-page-no', $('#a-prev-page').attr('data-page-no')+1);
					console.log($('#a-next-page').attr('data-page-no'));
				});
                // $('.news-wrap .news-list').innerHTML = bt('t:_1234-abcd-1',d);
                // $.each(d.list, function(index, val) {
                //     $('.news-list ul').
                // });
            } else if (d.ec==-1 || ec==-5){
                alert('操作超时，请重新登陆');
				$.cookie("sid",null);
				location.href = './login.html';
            }
        })
        .fail(function() {
            alert('connection fail, try later please!');
        });
        
    },

    mediaTopList: function (type, page, num, previewLen) {
        sid = $.cookie('sid');
        if (!type) type=1;
        if (!page) {page=1};
        if (!num) {num=10};
        if (!previewLen) {previewLen=100};
        $.ajax({
            // url: 'proxy.php?pa=media/top/list?v=1&cid=1',
            url: 'http://115.47.56.228:8080/alumni/service/media/top/list?v=1&cid=1',
            type: 'get',
            dataType: "json",
            data: {sid:sid, type:type, page:page, num:num, previewLen:previewLen},
        })
        .done(function(d) {
            if (d.ec==1 && d.rc==1) {
                // $('.big-banner ul').html($('.big-banner ul').html() + '<li></li>')
            };
        })
        .fail(function() {
            alert('connection fail, try later please!');
        });
        
    },
}
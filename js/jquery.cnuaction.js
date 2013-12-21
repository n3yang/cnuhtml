jQuery.cnuAction = {

    getBaseUrl: function(p,sid,v,cid){
        var r = {},rq='';
        if (sid) {r.sid=sid};
        if (v) {r.v=r} else {r.v=1};
        if (cid) {r.cid=cid} else {r.cid=1};
        $.each(r, function(index, val) {
            rq = rq + '&' + index + '=' + val;
        });
        rq = rq.substring(1, rq.length);
        //return 'proxy.php?pa='+p+'&'+rq;
        return 'http://115.47.56.228:8080/alumni/service'+p+'?'+rq;
    },

    isLogined: function(d){
        if (d.ec!='undefined' && d.ec!=1) {
            location.href = 'login.html';
        }
        if ($.cookie('sid')=='undefined' || $.cookie('sid')==null) {
			setFancyBox('请先登录，2秒后自动跳转')
			setTimeout(function(){
				location.href = 'login.html';
			},2000)
            location.href = 'login.html';
        }
    },

    isAdmin: function(){
		if($.cookie('admin')!=1){
			$("#sid_admin").hide();
		}else{
			$("#sid_admin").show();
		}
    },

    accessFail: function(){
		setFancyBox('网络访问失败，请稍后重试')
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
            url: this.getBaseUrl('/login'),
            type: 'POST',
            contentType: 'application/json',
            dataType: "json",
            data: '{name:"' + username + '",password:"' + password + '"}'
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if(d.rc==1){
                if( d.admin == 1 ){ 
                    $.cookie('admin', d.admin);
                }else{
					$.cookie('admin', 0);
				}
                $.cookie('sid', d.sid);
                location.href = './alumnus.html';
            } else {
				setFancyBox('用户名或密码错误')
            }
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });
    },

    logout: function(){
        $.ajax({
            url: this.getBaseUrl('/logout'),
            type: 'POST',
            contentType: 'application/json',
            dataType: "json",
            data: '{sid:"' + $.cookie('sid') + '"}'
        })
        .done(function(d) {
            $.cookie('sid', '');
            $.cookie('admin', '');
			setFancyBox('退出成功')
			setTimeout(function(){
				location.href = 'login.html';
			},2000)
        })
        .fail(function() {
            $.cnuAction.accessFail();
        })
        
    },

    accountCreate: function(username,password,idCardNo,stuNo){
        if (!stuNo) {stuNo='';};
        $.ajax({
            url: this.getBaseUrl('/account/create'),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: '{name:"' + username + '",password:"' + password + '",idCardNo:"' + idCardNo + '",stuNo:"' + stuNo + '"}'
        })
        .done(function(d) {
            if (d.ec==1){
                $.cookie('sid', d.sid);
				setFancyBox('注册成功,2秒后自动跳转')
				setTimeout(function(){
					location.href = './alumnus.html';
				},2000)
                
            } else if (d.ec==2) {
                $.cookie('sid', d.sid);
                location.href = './profile-update.html';
            } else if (d.ec==-2) {
				setFancyBox('该登录名已经被注册过')
            } else if (d.ec==0) {
				setFancyBox('注册失败，请稍后再试')
            }
        })
        .fail(function() {
            $.cnuAction.accessFail();
        })
        
    },
	
    accountPasswordUpdate: function(oldpwd, newpwd) {
        $.ajax({
            url: this.getBaseUrl('/account/password/update', $.cookie('sid')),
            type: 'POST',
            contentType: 'application/json',
            dataType: "json",
            data: '{old:"' + oldpwd + '",new:"' + newpwd + '"}'
        })
        .done(function(d) {
            // $.cnuAction.isLogined(d);
            if (d.rc==1) {
				setFancyBox('修改成功')
            }else if (d.rc=-1) {
				setFancyBox('原密码错误')
            }else {
				setFancyBox('未知错误')
            }
        })
        .fail(function() {
            $.cnuAction.accessFail();
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
            url: this.getBaseUrl('/media/list'),
            type: 'get',
            dataType: "json",
            data: {sid:sid, type:type, page:page, num:num, previewLen:previewLen}
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if (d.rc==1) {
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
					this.mediaList(current_type, $(this).attr('data-page-no'));
					$(this).attr('data-page-no', $(this).attr('data-page-no')-1);
					$('#a-prev-page').attr('data-page-no', $('#a-prev-page').attr('data-page-no')-1);
				});
				$('#a-next-page').click(function(event) {
					this.mediaList(current_type, $(this).attr('data-page-no'));
					$(this).attr('data-page-no', $(this).attr('data-page-no')+1);
					$('#a-prev-page').attr('data-page-no', $('#a-prev-page').attr('data-page-no')+1);
				});
            }
        })
        .fail(function() {
            $.cnuAction.accessFail();
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
            url: this.getBaseUrl('/media/top/list'),
            type: 'get',
            dataType: "json",
            data: {sid:sid, type:type, page:page, num:num, previewLen:previewLen}
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if (d.rc==1) {
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
				
				$(".slides a[data-id]").each(function(){
					$.cnuAction.setDetailHerf($(this));
				});
            }
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });
        
    },
	
	//设置文章按钮链接
	setDetailHerf: function(obj){
		obj.attr("href", './details.html?detailId=' + obj.attr("data-id"));
	},
	
	setFriendsSearch:function(){
		$(".search-btn").click(function(){
			console.log(12)
			if($(".search-text").val()!=''){
				location.href = './search.html?keywords='+$(".search-text").val();
			}
		})
	},
	//找人
	newSearchList:{},
	configFriendsSearch: function(page,num,keywords){
		if (!page) {page=1}
		if (!num) {num=50}
		if (!keywords) {keywords=''}
		sid = $.cookie('sid');
        $.ajax({
            url: this.getBaseUrl('/friends/search'),
            type: 'get',
            dataType: "json",
            data: {sid:sid,page:page,num:num,keywords:$.cnuAction.getQueryStringByName("keywords")}
        })
        .done(function(d) {
			$.cnuAction.isLogined(d);
            if (d.rc==1) {
			   $.cnuAction.newSearchList=d;
			   setSearchList();
            }
        })
        .fail(function() {
            $.cnuAction.accessFail();
        })
		
	},
	
	//设置文章详情
	mediaDetail: function(){
		var detailId =  this.getQueryStringByName('detailId');
		sid = $.cookie('sid');
		
        $.ajax({
            url: this.getBaseUrl('/media/'+ detailId +'/detail'),
            type: 'get',
            dataType: "json",
            data: {sid:sid}
        })
        .done(function(d) {
			$.cnuAction.isLogined(d);
            if (d.rc==1) {
               bt = baidu.template;
			   $('#details_wrap').html( bt('t:tpl-new-detail',d) );
			   $("#detail_content").html($.cnuAction.convert2HTML(d.content));
            }
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });
		
	},

	//时间轴
    timeLineList: {},
    timeline: function (id) {
        if (!id) {id='me'}
        $.ajax({
            url: this.getBaseUrl('/timeline/'+id+'/list'),
            type: 'get',
            dataType: 'json',
            data: {sid:$.cookie('sid')},
            async: false
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if (d.rc==-1) {
				setFancyBox('查询对象不存在')
                return;
            }
            if (d.rc==0) {
				setFancyBox('未知错误')
                return;
            }
            if (d.ec==1 && d.rc==1) {
                $.cnuAction.timeLineList = d.list;
				$.cnuAction.configProFile(id);
            } else if (d.ec==-1 || ec==-5){
				setFancyBox('操作超时,请重新登录')
				setTimeout(function(){
					location.href = './alumnus.html';
				},2000)
            }
        })
        .fail(function() {
            $.cnuAction.accessFail();
        })
        
    },
	
	//获取个人信息
	proFile :{},
	configProFile: function(id){
        if (!id) {id='me'}
        $.ajax({
            url: this.getBaseUrl('/profile/'+id+'/detail'),
            type: 'get',
            dataType: 'json',
            data: {sid:$.cookie('sid')},
            async: false
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if (d.rc==-1) {
				setFancyBox('查询对象不存在')
                return;
            }
            if (d.rc==0) {
				setFancyBox('未知错误')
                return;
            }
            if (d.ec==1 && d.rc==1) {
                $.cnuAction.proFile = d;
				setTimeLine(id);
            }
        })
        .fail(function() {
            $.cnuAction.accessFail();
        })
		
	},

    deptList : {},
    // 获取院系信息
    configDeptList: function(){
        $.ajax({
            url: this.getBaseUrl('/config/dept/list'),
            type: 'get',
            dataType: "json",
            data: {sid:$.cookie('sid')},
            async: false
        })
        .done(function(d){
            $.cnuAction.isLogined(d);
            if (d.ec==1) {
                $.cnuAction.deptList = d.list;
            }
        })
        .fail(function(){
            $.cnuAction.accessFail();
        });
    },

    // 获取部门组织双级列表
    orgList : {},
    configOrgList: function(){
        $.ajax({
            url: this.getBaseUrl('/config/org/list'),
            type: 'get',
            dataType: "json",
            data: {sid:$.cookie('sid')},
            async: false,
        })
        .done(function(d){
            $.cnuAction.isLogined(d);
            if (d.ec==1) {
                $.cnuAction.orgList = d.list;
            }
        })
        .fail(function(){
            $.cnuAction.accessFail();
        });
    },

    // 行业列表信息
    industryList : {},
    configIndustryList: function(){
        $.ajax({
            url: this.getBaseUrl('/config/industry/list'),
            type: 'get',
            dataType: "json",
            data: {sid:$.cookie('sid')},
            async: false,
        })
        .done(function(d){
            $.cnuAction.isLogined(d);
            if (d.ec==1) {
                $.cnuAction.industryList = d.list;
            }
        })
        .fail(function(){
            $.cnuAction.accessFail();
        });
    },
	
	//相似度好友列表
    newfriendsList : {},
    configNewfriendsList: function(id,page,num){
		if (!id) {id=$(".main li").eq(0).attr("data-id")}
		if (!page) {page=1}
		if (!num) {num=10}
        $.ajax({
            url: this.getBaseUrl('/timeline/me/node/'+id+'/newfriends/list'),
            type: 'get',
            dataType: "json",
            data: {sid:$.cookie('sid'),id:id,page:page,num:num},
            async: false
        })
        .done(function(d){
            $.cnuAction.isLogined(d);
            if (d.rc==-1) {
				setFancyBox('查询对象不存在')
                return;
            }
            if (d.rc==0) {
				setFancyBox('未知错误')
                return;
            }
            if (d.ec==1 && d.rc==1) {
                $.cnuAction.newfriendsList = d;
				setNewFriendsList();
            }
        })
        .fail(function(){
            $.cnuAction.accessFail();
        });
    },
	
	
	//关注
	configFriendsFollow: function(id){
        $.ajax({
            url: this.getBaseUrl('/friends/'+id+'/follow'),
            type: 'POST',
            dataType: "json",
            data: {sid:$.cookie('sid'),id:id},
            async: false
        })
        .done(function(d){
            $.cnuAction.isLogined(d);
            if (d.rc==-1) {
				setFancyBox('查询对象不存在')
                return;
            }
            if (d.rc==0) {
				setFancyBox('未知错误')
                return;
            }
			if(d.rc==-2){
				setFancyBox('没有关注过此人')
                return;
			}
			if(d.rc==-3){
				setFancyBox('取消关注的对象非法')
                return;
			}
            if (d.ec==1 && d.rc==1) {
				window.location.reload(true);
            }
        })
        .fail(function(){
            $.cnuAction.accessFail();
        });
	},
	
	
	//印象首师
	configGalaryList: function(page,num){
        if (!page) {page=1}
        if (!num) {num=50}
        $.ajax({
            url: this.getBaseUrl('/galary/list'),
            type: 'get',
            dataType: 'json',
            data: {sid:$.cookie('sid'),page:page,num:num},
            async: false
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if (d.rc==-1) {
				setFancyBox('查询对象不存在')
                return;
            }
            if (d.rc==0) {
				setFancyBox('未知错误')
                return;
            }
            if (d.ec==1 && d.rc==1) {
                $.cnuAction.timeLineList = d.list;
				//$.cnuAction.configGalaryDetail(id);
				
				bt = baidu.template;
				$('#galary_box').html( bt('t:tpl-galary-list',d) );
				
				$('.fancybox-thumbs').fancybox({
					prevEffect : 'none',
					nextEffect : 'none',
	
					closeBtn  : false,
					arrows    : false,
					nextClick : true,
	
					helpers : {
						thumbs : {
							width  : 50,
							height : 50
						}
					}
				});
				
            } else if (d.ec==-1 || ec==-5){
				setFancyBox('操作超时,请重新登录')
				setTimeout(function(){
					location.href = './alumnus.html';
				},2000)
            }
        })
        .fail(function() {
            $.cnuAction.accessFail();
        })
	},
	
	//大图
	configGalaryDetail: function(id){
        $.ajax({
            url: this.getBaseUrl('/galary/'+id+'/detail'),
            type: 'get',
            dataType: 'json',
            data: {sid:$.cookie('sid')},
            async: false
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if (d.rc==-1) {
				setFancyBox('查询对象不存在')
                return;
            }
            if (d.rc==0) {
				setFancyBox('未知错误')
                return;
            }
            if (d.ec==1 && d.rc==1) {
                $.cnuAction.timeLineList = d.list;
				$.cnuAction.configProFile(id);
            } else if (d.ec==-1 || ec==-5){
				setFancyBox('操作超时,请重新登录')
				setTimeout(function(){
					location.href = './alumnus.html';
				},2000)
            }
        })
        .fail(function() {
            $.cnuAction.accessFail();
        })
	}
}
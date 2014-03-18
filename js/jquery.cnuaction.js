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
         return 'http://115.47.56.228/alumni/service'+p+'?'+rq;
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
		
		var msg = '';
		
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
                $.cookie('admin', d.admin);
                $.cookie('sid', d.sid);
                $.cookie('status', d.status);
                if (d.status==-1) {
                    msg = '请完善个人资料，2秒后自动跳转';
                    setTimeout(function(){
                        location.href = 'profile-update.html';
                    },2000);
                } else if (d.status==-2){
                    msg = '您的信息尚在审核中，请耐心等待';
                } else {
                    location.href = 'alumnus.html';
                }
            } else {
				msg = '用户名或密码错误';
            }
            setFancyBox(msg);
            return;
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
            if (d.rc==1){
                $.cookie('sid', d.sid);
				msg = '注册成功，2秒后自动跳转';
				setTimeout(function(){
					location.href = 'alumnus.html';
				},2000)
            } else if (d.rc==2) {
                $.cookie('sid', d.sid);
                $.cookie('status', -1);
                msg = '注册成功，请完善个人资料，2秒后自动跳转';
                setTimeout(function(){
                    location.href = 'profile-update.html';
                },2000);
            } else if (d.rc==-2) {
				msg = '该登录名已经被注册过';
            } else if (d.rc==0) {
				msg = '注册失败，请稍后再试';
            }
            setFancyBox(msg);
            return;
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
    
    
    adminMediaList:{},
    adminMedia: function(type, page, num) {
    	if (!page||page<1) {page=1;}
    	if (!num) {num=20;}
        $.ajax({
            url: this.getBaseUrl('/media/list'),
            type: 'get',
            dataType: "json",
            async: false,
            data: {sid:$.cookie('sid'), type:type, page:page, num:num, previewLen:0}
        })
        .done(function(d){
        	$.cnuAction.isLogined(d);
        	$.cnuAction.adminMediaList = d.list;
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });
    },
    
    adminMediaTopList:{},
    adminMediaTop: function(type) {
        $.ajax({
            url: this.getBaseUrl('/media/top/list'),
            type: 'get',
            dataType: "json",
            async: false,
            data: {sid:$.cookie('sid'), type:type}
        })
        .done(function(d){
        	$.cnuAction.isLogined(d);
        	$.cnuAction.adminMediaTopList = d.list;
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });
    },
    
    adminMediaDelete: function(id){
        if (!id) {return false;}
        $.ajax({
            url: this.getBaseUrl('/admin/media/'+id+'/delete', $.cookie('sid')),
            type: 'POST',
            contentType: 'application/json',
            dataType: "json",
            data: '{id:"' + id + '"}',
            async: false
        })
        .done(function(d) {
            if (d.rc==1) {
                setFancyBox('删除成功');
				return true;
            } else if (d.rc==-1) {
                setFancyBox('信息不存在');
				return false;
            } else {
                setFancyBox('未知错误');
				return false;
            }
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });
        
    },
	
	//从媒体信息删除图片
    adminMediaPicDelete: function(mid,pid){
        if (!mid) {return false;}
        if (!pid) {return false;}
		
        $.ajax({
            url: this.getBaseUrl('/admin/media/'+ mid +'/pic/'+ pid +'/delete', $.cookie('sid')),
            type: 'POST',
            contentType: 'application/json',
            dataType: "json",
            data: '{id:"' + mid + '",picId:"' + pid + '"}',
            async: false
        })
        .done(function(d) {
            if (d.rc==1) {
                setFancyBox('删除成功');
				return true;
            } else if (d.rc==-1) {
                setFancyBox('信息不存在');
				return false;
            } else {
                setFancyBox('未知错误');
				return false;
            }
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });
        
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
					$.cnuAction.mediaList(current_type, $(this).attr('data-page-no'));
					$(this).attr('data-page-no', $(this).attr('data-page-no')-1);
					$('#a-prev-page').attr('data-page-no', $('#a-prev-page').attr('data-page-no')-1);
				});
				$('#a-next-page').click(function(event) {
					$.cnuAction.mediaList(current_type, $(this).attr('data-page-no'));
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
			if($(".search-text").val()!=''){
				location.href = './search.html?keywords='+encodeURIComponent($(".search-text").val());
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
            data: {sid:sid,page:page,num:num,keywords:decodeURIComponent($.cnuAction.getQueryStringByName("keywords"))}
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
	mediaDetailList:{},
	mediaDetail: function(id){
		if(!id) { id = this.getQueryStringByName('detailId') };
		sid = $.cookie('sid');
		
        $.ajax({
            url: this.getBaseUrl('/media/'+ id +'/detail'),
            type: 'get',
            dataType: "json",
            data: {sid:sid},
			async:false
        })
        .done(function(d) {
			$.cnuAction.isLogined(d);
            if (d.rc==1) {
				$.cnuAction.mediaDetailList = d;
				
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
    timeline: function (id,p) {
        if (!id) {id='me'}
        $.ajax({
            url: this.getBaseUrl('/timeline/'+id+'/list'),
            type: 'get',
            dataType: 'json',
            data: {sid:$.cookie('sid'),id:id},
            async: false
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if (d.rc==-1) {
				
				$.cnuAction.configProFile(id);
                return;
            }
            if (d.rc==0) {
				setFancyBox('未知错误')
                return;
            }
            if (d.ec==1 && d.rc==1) {
				
				if(p){
					$.cnuAction.timeLineList = d.list;	
					$.cnuAction.timeLineList.d = 'myFriend';
				}else{
					$.cnuAction.timeLineList = d.list;	
					$.cnuAction.timeLineList.d = '';
				}
                
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

    timelineNodeDelete: function(id, box) {
        if (!id) {return false;}
        $.ajax({
            url: this.getBaseUrl('/timeline/me/node/delete', $.cookie('sid')),
            type: 'POST',
            contentType: 'application/json',
            dataType: "json",
            data: '{id:"' + id + '"}'
        })
        .done(function(d) {
            if (d.rc==1) {
                setFancyBox('删除成功');
                $(box).remove();
            } else if (d.rc==-1) {
                setFancyBox('信息不存在');
            } else {
                setFancyBox('未知错误');
            }
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });
        
    },
	
	//获取个人信息
	proFile :{},
	configProFile: function(id){
        if (!id) {id='me'}
        $.ajax({
            url: this.getBaseUrl('/profile/'+id+'/detail'),
            type: 'get',
            dataType: 'json',
            data: {sid:$.cookie('sid'),id:id},
            async: false
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if (d.rc==-1) {
				//setFancyBox('查询对象不存在')
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
            async: false
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
            async: false
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
		
		if( id != 'me'){
		
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
			
		}else{
			return
		}
    },
	
	
	//我关注的好友列表
	friendsList:{},
	configFriendsList: function(page,num){
		if(!page){page='1'}
		if(!num){num='50'}
		$.ajax({
			url: this.getBaseUrl('/friends/me/list'),
			type: 'get',
			dataType: "json",
			data: {sid:$.cookie('sid'),page:page,num:num},
			async: false
		})
		.done(function(d){
			$.cnuAction.isLogined(d);
			if (d.rc==0) {
				setFancyBox('未知错误')
				return;
			}
			if (d.ec==1 && d.rc==1) {
				$.cnuAction.friendsList = d;
				setFriendsList();
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
				setFancyBox('已经关注过此人')
                return;
			}
			if(d.rc==-3){
				setFancyBox('关注的对象非法')
                return;
			}
            if (d.ec==1 && d.rc==1) {
				setFancyBox('关注成功')
				setTimeout(function(){
					window.location.reload(true);
				},2000)
            }
        })
        .fail(function(){
            $.cnuAction.accessFail();
        });
	},
	
	//取消关注
	configFriendsUnfollow: function(id){
        $.ajax({
            url: this.getBaseUrl('/friends/'+id+'/unfollow'),
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
				setFancyBox('取消成功')
				setTimeout(function(){
					window.location.reload(true);
				},2000)
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
				//$.cnuAction.configGalaryDetail(id);
				
				bt = baidu.template;
				$('#galary_box').html( bt('t:tpl-galary-list',d) );
				
				$('.fancybox-thumbs').fancybox({
					prevEffect : 'none',
					nextEffect : 'none',
	
					closeBtn  : true,
					arrows    : true,
	
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
	},
	
	//申请校友龙卡
	configCardApply: function(cardname, cardemail, cardetel){
		
		var msg = '';
		
        $.ajax({
            url: this.getBaseUrl('/college/card/apply',$.cookie('sid')),
            type: 'POST',
            contentType: 'application/json',
            dataType: "json",
			data: '{name:"' + cardname + '",email:"' + cardemail + '",mobile:"' + cardetel + '"}'
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if(d.rc==1){
				msg = '申请成功';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            } else if(d.rc==0) {
				msg = '未知错误';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            } else {
				msg = '已提交过校友卡申请，请点击右侧查看申请进度';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            }
            setFancyBox(msg);
            return;
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });
	},
	
	//查看校友龙卡申请进度
	configCardStatus: function(){
		
		var msg = '';
		
        $.ajax({
            url: this.getBaseUrl('/college/card/status'),
            type: 'GET',
            contentType: 'application/json',
            dataType: "json",
			data: {sid:$.cookie('sid')}
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if(d.rc==1){
				if(d.status==0){
					msg = '您于'+ d.applyTime +'提交申请，请耐心等待审批';
				}else{
					msg = '审批通过，您的审批时间为'+ d.approveTime;
				}
            }else if(d.rc==0){
				msg = '未知错误';
			}else if(d.rc==-1){
				msg = '未提交过校友卡申请';
			}
            setFancyBox(msg);
            return;
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });
	
	},
	
	//申请回馈母校
	configFeedbackApply: function(feedbackname, feedbackemail, feedbacktel){
		
		var msg = '';
		
        $.ajax({
            url: this.getBaseUrl('/college/feedback/apply',$.cookie('sid')),
            type: 'POST',
            contentType: 'application/json',
            dataType: "json",
			data: '{name:"' + feedbackname + '",email:"' + feedbackemail + '",mobile:"' + feedbacktel + '"}'
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if(d.rc==1){
				msg = '申请成功,感谢您，请耐心等待母校联系';
				setTimeout(function(){
					window.location.reload(true);
				},5000);
            } else if(d.rc==0) {
				msg = '未知错误';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            } else {
				msg = '已提交过捐赠申请';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            }
            setFancyBox(msg);
            return;
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });
	},
	
	
	//------------admin-------------
	
	//成员激活
	configAdminAccountApplyList: function(page, num){
		if(!page){page=1};
		if(!num){num=10};
		
		var tmp='';
		
        $.ajax({
            url: this.getBaseUrl('/admin/account/apply/list'),
            type: 'get',
            dataType: 'json',
            data: {sid:$.cookie('sid'),page:page,num:num},
            async: false
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if (d.rc==0) {
				setFancyBox('未知错误')
                return;
            }
            if (d.ec==1 && d.rc==1) {
				
				var g='';
				
				for(var i=0;i<d.list.length;i++){
					
					d.list[i].gender==1? g="男" : g="女";
					tmp += "<li><strong><em>姓名："+ d.list[i].name +"</em><em>性别："+ g +"</em></strong><span><em>"+ d.list[i].createTime +"</em><input data-id="+ d.list[i].id +" class=\"account-ok input-btn m-l-10\" type=\"button\" value=\"批准\" /></span></li>"
					
				}
				
				
				$("#account_apply").html(tmp);
				
				
				$(".account-ok").click(function(){
					$.cnuAction.configAdminAccountApplyApprove($(this).attr('data-id'))
				})
				
				
				
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
	
	
	//批准用户注册
	//admin/account/${id}/apply/approve
	configAdminAccountApplyApprove: function(id){
		
		var msg;
		
        $.ajax({
            url: this.getBaseUrl('/admin/account/'+ id +'/apply/approve'),
            type: 'POST',
            dataType: "json",
			data: {sid:$.cookie('sid'),id:id},
			async: false
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
			
            if(d.rc==1){
				msg = '批准成功';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            } 
			
			if(d.rc==0) {
				msg = '未知错误';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            } 
			
			if(d.rc==-1) {
				msg = 'ID不存在';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            } 
			
			if(d.rc==-2) {
				msg = '该账号不是待审批状态';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            } 
			
            setFancyBox(msg);
            return;
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });
	},
	
	
	//校友龙卡申请
	configAdminCollegeCardApplyList: function(page, num, status){
		if(!page){page=1};
		if(!num){num=10};
		if(!status){status=0};
		
		var tmp='';
		
        $.ajax({
            url: this.getBaseUrl('/admin/college/card/apply/list'),
            type: 'get',
            dataType: 'json',
            data: {sid:$.cookie('sid'),page:page,num:num,status:status},
            async: false
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if (d.rc==0) {
				setFancyBox('未知错误')
                return;
            }
            if (d.ec==1 && d.rc==1) {
				
				for(var i=0;i<d.list.length;i++){
					
					tmp += "<li><strong><em>姓名："+ d.list[i].name +"</em><em>邮箱："+ d.list[i].email +"</em><em>手机："+ d.list[i].mobile +"</em></strong><span><em>"+ d.list[i].applyTime +"</em><input data-id="+ d.list[i].id +" class=\"card-ok input-btn m-l-10\" type=\"button\" value=\"批准\" /></span></li>"
					
				}
				
				
				$("#college_card_apply").html(tmp);
				
				
				$(".card-ok").click(function(){
					$.cnuAction.configAdminCollegeCardApplyApprove($(this).attr('data-id'))
				})
				
				
				
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
	
	
	//批准校友龙卡申请
	configAdminCollegeCardApplyApprove: function(id){
		
		var msg;
		
        $.ajax({
            url: this.getBaseUrl('/admin/college/card/apply/'+ id +'/approve'),
            type: 'POST',
            dataType: "json",
			data: {sid:$.cookie('sid'),id:id},
			async: false
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
			
            if(d.rc==1){
				msg = '批准成功';
				setTimeout(function(){
					$.cnuAction.configAdminCollegeCardApplyList();
				},2000);
            } 
			
			if(d.rc==0) {
				msg = '未知错误';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            } 
			
			if(d.rc==-1) {
				msg = 'ID不存在';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            } 
			
			if(d.rc==-2) {
				msg = '该账号不是待审批状态';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            } 
			
            setFancyBox(msg);
            return;
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });
	},
	
	//捐赠审批
	configAdminCollegeFeedbackApplyList: function(page, num, status){
		if(!page){page=1};
		if(!num){num=10};
		if(!status){status=0};
		
		var tmp='';
		
        $.ajax({
            url: this.getBaseUrl('/admin/college/feedback/apply/list'),
            type: 'get',
            dataType: 'json',
            data: {sid:$.cookie('sid'),page:page,num:num,status:status},
            async: false
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if (d.rc==0) {
				setFancyBox('未知错误')
                return;
            }
            if (d.ec==1 && d.rc==1) {
				
				for(var i=0;i<d.list.length;i++){
					
					tmp += "<li><strong><em>姓名："+ d.list[i].name +"</em><em>邮箱："+ d.list[i].email +"</em><em>手机："+ d.list[i].mobile +"</em></strong><span><em>"+ d.list[i].applyTime +"</em><input data-id="+ d.list[i].id +" class=\"feedback-ok input-btn m-l-10\" type=\"button\" value=\"已处理\" /></span></li>"
					
				}
				
				
				$("#college_feedback_apply").html(tmp);
				
				
				$(".feedback-ok").click(function(){
					$.cnuAction.configAdminCollegeFeedbackApplyApprove($(this).attr('data-id'))
				})
				
				
				
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
	
	
	//处理捐赠
	configAdminCollegeFeedbackApplyApprove: function(id){
		
		var msg;
		
        $.ajax({
            url: this.getBaseUrl('/admin/college/feedback/apply/'+ id +'/approve'),
            type: 'POST',
            dataType: "json",
			data: {sid:$.cookie('sid'),id:id},
			async: false
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
			
            if(d.rc==1){
				msg = '已处理';
				setTimeout(function(){
					$.cnuAction.configAdminCollegeFeedbackApplyList();
				},2000);
            } 
			
			if(d.rc==0) {
				msg = '未知错误';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            } 
			
			if(d.rc==-1) {
				msg = 'ID不存在';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            } 
			
			if(d.rc==-2) {
				msg = '该账号不是待处理状态';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            } 
			
            setFancyBox(msg);
            return;
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });
	},
	
	//印象首师图片列表
	configAdminGalaryList: function(page,num){
		if(!page){page=1};
		if(!num){num=50};
		
		var tmp='';
		
        $.ajax({
            url: this.getBaseUrl('/galary/list'),
            type: 'get',
            dataType: 'json',
            data: {sid:$.cookie('sid'),page:page,num:num},
            async: false
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if (d.rc==0) {
				setFancyBox('未知错误')
                return;
            }
            if (d.ec==1 && d.rc==1) {
				
				for(var i=0;i<d.list.length;i++){
					
					tmp += "<li><img src="+ d.list[i].thumbnail +"><h4><input data-id="+ d.list[i].id +" class=\"galary-delete input-btn m-l-10\" type=\"button\" value=\"删除\" /></h4></li>"
					
				}
				
				
				$("#galary_admin").html(tmp);
				
				
				$(".galary-delete").click(function(){
					$.cnuAction.configAdminGalaryDelete($(this).attr('data-id'))
				})
				
				
				
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
	
	//删除印象首师图片
	configAdminGalaryDelete: function(id){
		var msg;
		
        $.ajax({
            url: this.getBaseUrl('/admin/galary/'+ id +'/delete'),
            type: 'POST',
            dataType: "json",
			data: {sid:$.cookie('sid'),id:id},
			async: false
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            if(d.rc==1){
				msg = '已删除';
				setTimeout(function(){
					$.cnuAction.configAdminGalaryList();
				},500);
            } 
			
			if(d.rc==0) {
				msg = '未知错误';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            } 
			
			if(d.rc==-1) {
				msg = '查询对象不存在';
				setTimeout(function(){
					window.location.reload(true);
				},2000);
            } 

            setFancyBox(msg);
            return;
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });
	},

    
    //推荐圈子列表
    groupList : {},
    configGroupList: function(page,num){
        if (!page) {page=1}
        if (!num) {num=10}
        
        $.ajax({
            url: this.getBaseUrl('/group/list'),
            type: 'get',
            dataType: "json",
            data: {sid:$.cookie('sid'),page:page,num:num},
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
                $.cnuAction.groupList = d;
                setGroupList();
            }
        })
        .fail(function(){
            $.cnuAction.accessFail();
        });

    },

    //我创建圈子列表
    groupMyList : {},
    configGroupMyList: function(page,num){
        if (!page) {page=1}
        if (!num) {num=20}
        
        $.ajax({
            url: this.getBaseUrl('/group/my/list'),
            type: 'get',
            dataType: "json",
            data: {sid:$.cookie('sid'),page:page,num:num},
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
                $.cnuAction.groupMyList = d;
                setGroupMyList();
            }
        })
        .fail(function(){
            $.cnuAction.accessFail();
        });

    },

    //我创建圈子列表
    groupMeList : {},
    configGroupMeList: function(page,num){
        if (!page) {page=1}
        if (!num) {num=20}
        
        $.ajax({
            url: this.getBaseUrl('/group/me/list'),
            type: 'get',
            dataType: "json",
            data: {sid:$.cookie('sid'),page:page,num:num},
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
                $.cnuAction.groupMeList = d;
                setGroupMeList();
            }
        })
        .fail(function(){
            $.cnuAction.accessFail();
        });

    },

    
    //加入圈子
    configGroupJoin: function(id){
        $.ajax({
            url: this.getBaseUrl('/group/'+ id +'/join', $.cookie('sid')),
            type: 'POST',
            contentType: 'application/json',
            dataType: "json",
            data: ''
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            
            if(d.rc==1){
                msg = '加入成功';
                setTimeout(function(){
                    window.location.reload(true);
                },2000);
            } 
            
            if(d.rc==0) {
                msg = '未知错误';
                setTimeout(function(){
                    window.location.reload(true);
                },2000);
            } 
            
            if(d.rc==-1) {
                msg = 'ID不存在';
                setTimeout(function(){
                    window.location.reload(true);
                },2000);
            } 
            
            if(d.rc==-2) {
                msg = '已经加入过该圈子';
                setTimeout(function(){
                    window.location.reload(true);
                },2000);
            } 
            
            setFancyBox(msg);
            return;
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });
    },

    //删除圈子
    configGroupDelete: function(id){

        $.ajax({
            url: this.getBaseUrl('/group/'+ id +'/delete', $.cookie('sid')),
            type: 'POST',
            contentType: 'application/json',
            dataType: "json",
            data: ''
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            
            if(d.rc==1){
                msg = '删除成功';
                setTimeout(function(){
                    window.location.reload(true);
                },2000);
            } 
            
            if(d.rc==0) {
                msg = '未知错误';
                setTimeout(function(){
                    window.location.reload(true);
                },2000);
            } 
            
            if(d.rc==-1) {
                msg = 'ID不存在';
                setTimeout(function(){
                    window.location.reload(true);
                },2000);
            } 
            
            
            setFancyBox(msg);
            return;
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });

        event.stopPropagation();
    },

    //退出圈子
    configGroupQuit: function(id){
        $.ajax({
            url: this.getBaseUrl('/group/'+ id +'/quit', $.cookie('sid')),
            type: 'POST',
            contentType: 'application/json',
            dataType: "json",
            data: ''
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            
            if(d.rc==1){
                msg = '退出成功';
                setTimeout(function(){
                    window.location.reload(true);
                },2000);
            } 
            
            if(d.rc==0) {
                msg = '未知错误';
                setTimeout(function(){
                    window.location.reload(true);
                },2000);
            } 
            
            if(d.rc==-1) {
                msg = 'ID不存在';
                setTimeout(function(){
                    window.location.reload(true);
                },2000);
            } 
            
            if(d.rc==-2) {
                msg = '没有加入过该圈子';
                setTimeout(function(){
                    window.location.reload(true);
                },2000);
            } 
            
            setFancyBox(msg);
            return;
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });

        event.stopPropagation();
    },

    //创建圈子
    configGroupCreate: function(name, desc){

        $.ajax({
            url: this.getBaseUrl('/group/create', $.cookie('sid')),
            type: 'POST',
            contentType: 'application/json',
            dataType: "json",
            data: '{name:"' + name + '",desc:"' + desc + '"}'
        })
        .done(function(d) {
            $.cnuAction.isLogined(d);
            
            if(d.rc==1){
                msg = '创建成功';
                setTimeout(function(){
                    window.location.reload(true);
                },2000);
            }else{
                if(d.rc==0) {
                    msg = '未知错误';
                    setTimeout(function(){
                        window.location.reload(true);
                    },2000);
                    return
                }
                msg = '创建失败';
                setTimeout(function(){
                    window.location.reload(true);
                },2000);
            }
            
            
            setFancyBox(msg);
            return;
        })
        .fail(function() {
            $.cnuAction.accessFail();
        });

        event.stopPropagation();
    },

    //获取圈子发言列表
    groupCommentList : {},
    configGroupCommentList: function(id,page,num){

        if (!page) {page=1}
        if (!num) {num=20}

        $.ajax({
            url: this.getBaseUrl('/group/'+ id +'/comment/list'),
            type: 'get',
            dataType: "json",
            data: {sid:$.cookie('sid'),page:page,num:num},
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
                $.cnuAction.groupCommentList = d;
                setGroupCommentList();
            }
        })
        .fail(function(){
            $.cnuAction.accessFail();
        });

    },

    //发言
    configGroupCommentCreate: function(content, resTo, id){

        if(!id){id=gid}
        if(!resTo){resTo = 0}

        $.ajax({
            url: this.getBaseUrl('/group/'+ id +'/comment/create', $.cookie('sid')),
            type: 'POST',
            contentType: 'application/json',
            dataType: "json",
            data: '{content:"' + content + '",resTo:"' + resTo + '"}'
        })
        .done(function(d){
            $.cnuAction.isLogined(d);
            if (d.rc==-1) {
                setFancyBox('圈子ID不存在')
                return;
            }
            if (d.rc==0) {
                setFancyBox('未知错误')
                return;
            }
            if (d.ec==1 && d.rc==1) {
                setFancyBox('发布成功')
                setTimeout(function(){
                    window.location.reload(true);
                },2000);
            }
        })
        .fail(function(){
            $.cnuAction.accessFail();
        });

    },

    //我关注的好友列表
    participantList:{},
    configParticipantList: function(id,page,num){
        if(!page){page='1'}
        if(!num){num='50'}
        $.ajax({
            url: this.getBaseUrl('/group/'+ id +'/participant/list'),
            type: 'get',
            dataType: "json",
            data: {sid:$.cookie('sid'),id:id,page:page,num:num},
            async: false
        })
        .done(function(d){
            $.cnuAction.isLogined(d);
            if (d.rc==0) {
                setFancyBox('未知错误')
                return;
            }
            if (d.ec==1 && d.rc==1) {
                $.cnuAction.participantList = d;
                setParticipantsList();
            }
        })
        .fail(function(){
            $.cnuAction.accessFail();
        });
    }

}
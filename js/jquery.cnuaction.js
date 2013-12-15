jQuery.cnuAction = {

    login: function (username, password, rememberme){
        $.ajax({
            url: 'proxy.php?pa=login',
            type: 'POST',
            dataType: 'json',
            data: {name:username,password:password},
        })
        .done(function(m) {
            if(m.rc==1){
                $.cookie('admin', m.admin);
                $.cookie('sid', m.sid);
                location.href = './alumnus.html';
            } else {
                alert('用户名或密码错误');
            }
        })
        .fail(function() {
            alert('connection fail, try later please!');
        });
    },

    mediaList: function (type, page, num, preview_len) {
        sid = $.cookie('sid');
        console.log(sid);
        $.ajax({
            url: 'proxy.php?pa=media/list',
            type: 'POST',
            dataType: 'json',
            data: {type:type, page:page, num:num, previewLen:preview_len, sid:sid},
        })
        .done(function(d) {
            console.log(d);
        })
        .fail(function() {
            alert('connection fail, try later please!');
        });
        
    },

}
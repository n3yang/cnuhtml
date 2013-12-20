  

function setTimeLine(id){
	var date = {
		a: {},
		b: {},
		c: id,
	};
	
	date.a = $.cnuAction.timeLineList;
	
	date.b = $.cnuAction.proFile;
		
	if(id == 'me'){
	   bt = baidu.template;
	   $('.main').html( bt('t:tpl-history',date) );
	   systole('.main');
	   
	   $(".main li").click(function(){
		   
		    $.cnuAction.configNewfriendsList($(this).attr("data-id"));
			
		});
	}
};  
  
function setNewFriendsList(){
	
	   bt = baidu.template;
	   $('#similar').html( bt('t:tpl-friend-list',$.cnuAction.newfriendsList) );
	
}  
  
  function systole(obj) {
	  
    if (!$(obj+" .history").length) {
      return;
    }
	
	
    var $warpEle = $(obj+" .history-date"),
      $targetA = $warpEle.find("h2 a.btn"),
      parentH,
      eleTop = [];
    parentH = $warpEle.parent().height();
    $warpEle.parent().css({
      "height":0
    });
    setTimeout(function () {

      $warpEle.find("ul").each(function (idx) {
		  
        eleTop.push($(this).position().top);
        $(this).css({
          "margin-top":-eleTop[idx]
        }).children().hide();
      }).animate({
          "margin-top":0
        }, 1000).children().fadeIn();
      $warpEle.parent().animate({
        "height":parentH
      }, 1300);

      $warpEle.find("ul").addClass("bounceInDown").css({
        "-webkit-animation-duration":"2s",
        "-webkit-animation-delay":"0",
        "-webkit-animation-timing-function":"ease",
        "-webkit-animation-fill-mode":"both"
      }).end().children("h2").css({
          "position":"relative"
        });
    }, 300);

    $targetA.click(function () {
      $(this).parent().css({
        "position":"relative"
      });
      $(this).parent().siblings().slideToggle();
      $warpEle.parent().removeAttr("style");
      return false;
    });

  };

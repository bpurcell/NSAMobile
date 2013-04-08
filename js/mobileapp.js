    $(document).live('pageinit',function(event){
        
        var h = $(window).height()-40;
        var w = $(window).width();
        $('.image-wrapper').height(h);

        jQuery(function($){
            $('.image_wrap .zoom').smoothZoom({
                width: w,
                height: h,
                responsive: false,
                zoom_BUTTONS_SHOW : 'NO',
                pan_BUTTONS_SHOW : 'NO',
                pan_LIMIT_BOUNDARY : 'NO'

            });
        });
        
        $(".zoom, .information").click(function() {
          $('.information').hide();
        });
        
        $(".image_nav .back").hide();

        $(".image_nav .nav_arrows").click(function() {

            $('.information').hide();
            
            var data = $(this).parent().data();
            var dir = (($(this).hasClass('forward')) ? 1 : -1);
            if(data.current > 1) $(".image_nav .back").show();
            
            $(this).parent().data('current', data.current+dir);
            
            $('.nav_count').html('Image ' + data.current+dir + ' of ' + data.total);
            
            $('.zoom').attr('src','img/'+data.folder+'_'+(data.current+dir)+'.jpg');
        });

        
    });
    
    
    
    
    $(document).bind("orientationchange", function(e){  
        $.mobile.changePage(
          window.location.href,
          {
            allowSamePageTransition : true,
            transition              : 'none',
            showLoadMsg             : false,
            reloadPage              : true
          }
        );

        $('.information').hide();
    }); 

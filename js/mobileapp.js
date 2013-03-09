    $(document).live('pageinit',function(event){
        
        var h = $(window).height()-64;
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
        
        $(".image_wrap .slider").change(function() {
            $('.information').hide();
            sVal = $(this).val();
            folder = $(this).data('folder');
            
            $('.zoom').attr('src','img/'+folder+'_'+sVal+'.jpg');
        });
        
        
    });
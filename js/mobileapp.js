    $(document).live('pageinit',function(event){
        
        var h = $(window).height()-130;
        var w = $(window).width();
        $('.image-wrapper').height(h);

        jQuery(function($){
            $('.image_wrap .image-wrapper').smoothZoom({
                width: w,
                height: h,
                responsive: false

            });
        });
        
        
        $(".image_wrap .slider").change(function() {
            sVal = $(this).val();
            folder = $(this).data('folder');
            
            $('.zoom').attr('src','img/'+folder+'_'+sVal+'.jpg');
        });
        
        
    });
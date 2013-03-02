    $(document).live('pageinit',function(event){
        
        var h = $(window).height();
        var w = $(window).width();
        
        $('.image_wrap .zoom').touchPanView({
            width:  w,
            height: h,
            startZoomedOut: true,
        });
        
        $(".image_wrap .slider").change(function() {
            sVal = $(this).val();
            folder = $(this).data('folder');
            
            $('.zoom').attr('src','img/'+folder+'/'+sVal+'.gif')
        });
        
        
    });
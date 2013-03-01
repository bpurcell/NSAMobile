// Temporary fix to session-timeout bug

setInterval(function(){
    $.ajax({
        url : '/home/keepalive?format=json'
    });
}, 1000 * 60 * 1);

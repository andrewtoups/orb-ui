define([], function(){
    return {
        isTouchDevice: () => {
            try {  
                document.createEvent("TouchEvent");  
                return true;  
              } catch (e) {  
                return false;  
              }
        },
        isIosSafari: () => {
            var isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
            var isChromeSafari = !!navigator.userAgent.match('CriOS');
            var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            return (isSafari || isChromeSafari) && iOS;
        }
    };
});
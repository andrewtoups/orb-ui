define([], function(){
    return (function(){
        let mobileMsgContainer = document.createElement('div');
        mobileMsgContainer.style.position = "absolute";
        mobileMsgContainer.style.zIndex = "1";
        mobileMsgContainer.style.width = "100%";
        mobileMsgContainer.style.maxHeight = "25vh";
        let count = 0;
        document.querySelector('body').prepend(mobileMsgContainer);

        let mobileMsgDiv = function(text) {
            this.div = document.createElement('div');
            this.div.innerText = `${count} - ${text}`;
            this.div.style.width = "100%";
            this.div.style.backgroundColor = "white";
            this.div.style.paddingLeft = "5px";
        };
        let mobileMsg = (text, timeout) => {
            count++;
            timeout = timeout || 2500;
            let msg = new mobileMsgDiv(text).div;
            // mobileMsgContainer.prepend(msg);
            setTimeout(() => {
                // mobileMsgContainer.removeChild(msg);
            }, 2500);
        };
        return mobileMsg;
    })();
});
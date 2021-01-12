define(['ko'], ko => {
    return (function(){
        ko.bindingHandlers.transitionState = {
            update: (element, valueAccessor) => {
                let currentValue = valueAccessor();
                element.addEventListener('transitionstart', e => {
                    if (e.target === element) currentValue(true);
                });
                element.addEventListener('transitionend', e => {
                    if (e.target === element) currentValue(false);
                });
                element.addEventListener('transitioncancel', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.target === element) currentValue(false);
                });
            }
        }
    })();
});
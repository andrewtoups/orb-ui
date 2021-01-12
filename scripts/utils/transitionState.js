define(['ko'], ko => {
    return (function(){
        ko.bindingHandlers.transitionState = {
            update: (element, valueAccessor) => {
                element.addEventListener('transitionstart', e => {
                    if (e.target === element) valueAccessor()(true);
                });
                element.addEventListener('transitionend', e => {
                    if (e.target === element) valueAccessor()(false);
                });
                element.addEventListener('transitioncancel', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.target === element) valueAccessor()(false);
                });
            }
        }
    })();
});
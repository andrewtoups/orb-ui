define(['ko'], function(ko){
    return (function(){
        let hide = element => { element.classList.add('hide'); };
        let show = element => { element.classList.remove('hide'); }

        ko.bindingHandlers.optionsPlaceholder = {
            preprocess: function(value, name, addBinding) {
                addBinding("optionsCaption", value);
                return value;
            },
            init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
                let placeholderText = ko.isObservable(valueAccessor()) ? String(valueAccessor()()) : String(valueAccessor());
                let listeners = [
                    'mousedown', 'blur', 'change'
                ];

                let autoSelect = function(e){
                    let options = Array.from(element.querySelectorAll('option'));
                    let placeholderEl = options.find(o => o.innerText === placeholderText);

                    if (e.type === 'mousedown') {
                        if (e.target === element) hide(placeholderEl);
                        else element.value = e.target.value;
                    }
                    else if (e.type === 'blur') show(placeholderEl);
                    else if (e.type === 'change') {
                        element.removeChild(placeholderEl);
                        if (!element.value) {
                            options = Array.from(element.querySelectorAll('option'));
                            let defaultEl = options.find(o => o.innerText === placeholderText) ? options.find(o => o.innerText === placeholderText) : false;
                            element.value = defaultEl ? defaultEl.value : options[0].value;
                        }
                        listeners.forEach(event => { element.removeEventListener(event, autoSelect)});
                    }
                };
                listeners.forEach(event => { element.addEventListener(event, autoSelect)});
            }
        };
    })();
});
define(['ko'], function(ko){
    return (function(){
        let hide = element => {
            element.classList.add('hide');
            element.disabled = true;
        };
        let show = element => {
            element.classList.remove('hide');
            element.disabled = false;
        };
        let forceChange = element => { element.dispatchEvent(new Event('change')); }

        ko.bindingHandlers.optionsPlaceholder = {
            preprocess: function(value, name, addBinding) {
                addBinding("optionsCaption", value);
                return value;
            },
            init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
                let placeholderText = ko.isObservable(valueAccessor()) ? String(valueAccessor()()) : String(valueAccessor());
                vm.pointerMode.subscribe(newValue => {
                    if (newValue === 'touch') {
                        hide(v.placeholderEl);
                    } else {
                        show(v.placeholderEl);
                    }
                });
                let listeners = [
                    'mousedown', 'focusout', 'touchstart', 'blur', 'change'
                ];
                valueAccessor.touchEvent = false;

                let autoSelect = function(e){
                    let options = Array.from(element.querySelectorAll('option'));
                    let placeholderEl = options.find(o => o.innerText === placeholderText && !o.value);
                    let defaultEl = options.find(o => o.innerText === placeholderText && o.value) ?
                        options.find(o => o.innerText === placeholderText && o.value) : false;
                    if (defaultEl && !element.value) element.value = defaultEl.value;
                    if (e.type === 'touchstart') valueAccessor.touchEvent = true;
                    
                    if (e.type === 'mousedown' || e.type === 'touchstart') {
                        if (e.target === element) hide(placeholderEl);
                        else {
                            element.value = e.target.value;
                            forceChange(element);
                        }
                    }
                    else if (e.type === 'blur') show(placeholderEl);
                    else if (e.type === 'focusout' && valueAccessor.touchEvent) {
                        element.value = defaultEl ? defaultEl.value : options[0].value;
                        forceChange(element);
                    }
                    else if (e.type === 'change') {
                        element.removeChild(placeholderEl);
                        element.value = defaultEl ? defaultEl.value : options[0].value;
                        listeners.forEach(event => { element.removeEventListener(event, autoSelect)});
                    }
                };
                listeners.forEach(event => { element.addEventListener(event, autoSelect)});
            }
        };
    })();
});
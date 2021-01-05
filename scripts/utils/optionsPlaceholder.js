define(['ko', 'utils/mobileMsg'], function(ko, mm){
    return (function(){
        let delegation = false;
        let hide = element => {
            element.classList.add('hide');
            element.disabled = true;
        };
        let show = element => {
            element.classList.remove('hide');
            element.disabled = false;
        };
        let forceChange = element => {
            delegation = true;
            element.dispatchEvent(new Event('change'));
        };

        ko.bindingHandlers.optionsPlaceholder = {
            preprocess: function(value, name, addBinding) {
                addBinding("optionsCaption", value);
                return value;
            },
            init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
                let v = valueAccessor;
                let placeholderText = ko.isObservable(v()) ? String(v()()) : String(v());
                v.options = Array.from(element.querySelectorAll('option'));
                v.placeholderEl = v.options.find(o => o.innerText === placeholderText && !o.value);
                v.placeholderEl.classList.add('placeholder');
                vm.pointerMode.subscribe(newValue => {
                    if (newValue === 'touch') {
                        hide(v.placeholderEl);
                    } else {
                        show(v.placeholderEl);
                    }
                });
                v.defaultEl = v.options.find(o => o.innerText === placeholderText && o.value) ?
                                        v.options.find(o => o.innerText === placeholderText && o.value) : false;
                element.value = v.defaultEl ? v.defaultEl.value : element.value;
                v.setDefault = () => { element.value = v.defaultEl ? v.defaultEl.value : v.options[0].value; };
                let listeners = [
                    'focus', 'focusin', 'mousedown', 'touchstart', 'touchend', 'blur', 'focusout', 'change', 'keydown'
                ];
                let escapers = ['focusout', 'blur'];
                let interactions = ['mousedown', 'focusin', 'focus'];
                let browsingKeys = ['ArrowUp', 'ArrowDown'];

                let autoSelect = function(e){
                    let browsing = interactions.includes(e.type) && e.target === element;
                    let browsingWithKeyboard = (browsingKeys.includes(e.key));
                    let defaultElIsntFirst = (v.options.indexOf(v.defaultEl) > 1);
                    let selecting = (e.type === 'mousedown' && e.target.tagName === 'OPTION');
                    let escaping = escapers.includes(e.type);
                    
                    if (browsingWithKeyboard) element.value = "";

                    if (browsing) {
                        hide(v.placeholderEl);
                        mm(`placeholder "${v.placeholderEl.innerText}"'s class is: ${v.placeholderEl.classList[0]}`);
                        mm(`placeholder "${v.placeholderEl.innerText}"'s disabled status is: ${v.placeholderEl.disabled}`);
                    }

                    if (defaultElIsntFirst) element.value = !element.value && v.defaultEl ? v.defaultEl.value : element.value;

                    if (selecting) {
                        element.value = e.target.value;
                        forceChange(element);
                    }
                    if (e.type === 'blur') show(v.placeholderEl);

                    if (escaping) { // Just select whatever was highlighted:
                        v.setDefault();
                        forceChange(element);
                    }
                    if (e.type === 'change') {
                        element.removeChild(v.placeholderEl);
                        if (!element.value && !delegation) v.setDefault();
                        listeners.forEach(event => { element.removeEventListener(event, autoSelect)});
                        delegation = false;
                    }
                };
                listeners.forEach(event => { element.addEventListener(event, autoSelect)});
            }
        };
    })();
});
define(['ko'], function(ko) {
    let cleanInit = (element, valueAccessor, allBindings, viewModel, bindingContext) => {
        let v = valueAccessor();

        v.startingValue = typeof v.startingValue === 'undefined' ? v() : v.startingValue;
        v.clean = ko.observable(true);
        v.untouched = ko.observable(true);
        v.touched = ko.computed(() => !v.untouched());
        v.dirty = ko.computed(() => !v.clean());

        bindingContext.$data.cleanReady = ko.observable(false);

        let cleanSub = v.subscribe(newValue => {
            newValue = /^\d+$/.test(newValue) ? parseInt(newValue) : newValue;
            if (newValue !== v.startingValue) {
                v.clean(false);
                cleanSub.dispose();
            }
        });

        let touch = event => {
            v.untouched(false);
            element.removeEventListener('blur', touch);
        };
        element.addEventListener('blur', touch);

        let cssRules = {
            untouched: v.untouched,
            touched: v.touched,
            clean: v.clean,
            dirty: v.dirty
        };
        ko.applyBindingsToNode(element, {css: cssRules}, bindingContext.$data);

        ko.bindingEvent.subscribe(element, 'descendantsComplete', function () {
            bindingContext.$data.cleanReady(true);
        });
 
        // startPossiblyAsyncContentBinding is necessary for descendant bindings to notify us of their completion
        var innerBindingContext = ko.bindingEvent.startPossiblyAsyncContentBinding(element, bindingContext);
    }
    return (function() {
        ko.bindingHandlers.cleanValue = {
            preprocess: function(value, name, addBinding){
                addBinding("value", value);
                return value;
            },
            init: cleanInit
        }
        ko.bindingHandlers.cleanTextInput = {
            preprocess: function(value, name, addBinding){
                addBinding("textInput", value);
                return value;
            },
            init: cleanInit
        }
    })();
});
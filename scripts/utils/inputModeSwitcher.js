define(['ko'], function(ko){
    let inputModeSwitcher = (cb) => {
        let currentMode;
        let waiting = false;
        const timeout = 1000;

        let Mode = function(events, otherModes) {
            this.events = events;
            this.otherModes = otherModes;
            this.attached = false;

            this.addListeners = (f) => {
                this.events.forEach(eventType => {
                    this[eventType+'listener'] = f.bind(this);
                    document.addEventListener(eventType, this[eventType+'listener'], true)
                });
                this.attached = true;
            };
            this.removeListeners = () => {
                this.events.forEach(eventType => {
                    if (this[eventType+'listener']) {
                        document.removeEventListener(eventType, this[eventType+'listener'], true);
                    }
                });
                this.attached = false;
            }
        };
        let modeEvents = {
            touch: ['touchstart', 'touchend', 'touchcancel'],
            key: ['keydown', 'keyup'],
            mouse: ['mousedown', 'click', 'auxclick', 'mousemove', 'wheel']
        };
        let modeTypes = Object.keys(modeEvents);
        let modes = {};
        modeTypes.forEach(modeType => {
            let otherModes = modeTypes.filter(mt => mt !== modeType);
            modes[modeType] = new Mode(
                modeEvents[modeType],
                otherModes
            );
        });
        let listener = function(e){
            let thisMode;
            for (const mode in modeEvents) {
                if (modeEvents[mode].find(event => event === e.type)) thisMode = mode;
            }
            let modeObj = modes[thisMode] ? modes[thisMode] : false;
            if (currentMode !== thisMode && !waiting && modeObj) {
                if (thisMode === 'touch') {
                    waiting = true;
                    setTimeout(() => {
                        waiting = false;
                    }, timeout);
                }
                currentMode = thisMode;
                cb && cb(thisMode);
                modeObj.removeListeners();
                modeObj.otherModes.forEach(otherMode => {
                    let m = modes[otherMode];
                    if (!m.attached) m.addListeners(listener);
                });
            }
        };
        for (const mode in modes) {
            modes[mode].addListeners(listener);
        }
    };
    return (function() {
        ko.bindingHandlers.inputMode = {
            init: (element, valueAccessor, allBindings, viewModel, bindingContext) => {
                let v = valueAccessor;
                if (!ko.isObservable(v())) v = ko.observable(v);
                inputModeSwitcher(mode => { valueAccessor()(mode) });
            }
        };
    })();
});
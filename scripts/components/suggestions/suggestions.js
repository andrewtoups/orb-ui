define(['ko'], function(ko){
    return function(params){
        let self = this;

        let Suggestion = function(result){
            this.value = result ? result.value : null;
            this.resultData = result ? result.data : {};
            this.active = ko.observable(false);
            this.rank = result ? ko.computed(() => self.rankResult(result.value)) : 0;
        };

        self.value = params.value;
        self.index = params.index;
        self.value(null);
        self.valueSet = ko.computed(() => self.value() !== null );
        self.setValue = function(index, result, event){
            event.preventDefault();
            self.query('');
            self.value(result.value);
            self.index(index);
            if (self.activeResult()) self.deactivate(self.activeResult());
        };
        self.unsetValue = function(){
            self.query('');
            self.value(null);
            self.index(null);
        };

        self.rankResult = (result) => {
            let q = params.query().toLowerCase();
            let rank;
            if (result === q) rank = 1;
            else if (result.startsWith(q) && result.includes(q)) rank = 2;
            else if (result.includes(q)) rank = 3;
            else rank = 4;
            return rank;
        };
        
        self.results = ko.computed(() => {
            if (params.results().length && !self.valueSet()) {
                params.status(true);
                let results = params.results().map((result) => new Suggestion(result));
                results = results.filter(result => result.rank() > 0);
                results.sort((a,b) => {
                    return a.rank() === b.rank() ? 0 :
                            a.rank() > b.rank() ? 1 : -1;
                });
                params.status(false);
                return results;
            } else {
                return [];
            }
        });
        self.inputFocus = ko.observable(false);
        self.valueSet.subscribe(newValue => {
            self.inputFocus(!newValue);
        });
        self.show = ko.computed(() => {
            return self.results().length && self.inputFocus();
        });

        self.query = params.query;

        self.activeResult = ko.observable(new Suggestion());

        self.results.subscribe(newValue => {
            if (!newValue.find(result => result.active() === true) && newValue.length) {
                self.activate(newValue[0]);
            }
            else if (newValue.length === 0){
                self.activeResult(new Suggestion());
            }
        });
        
        self.activate = function(suggestion){
            suggestion.active(true);
            self.activeResult(suggestion);
        };
        self.deactivate = function(suggestion){
            suggestion.active(false);
            self.activeResult(new Suggestion());
        };

        
        self.placeholder = ko.computed(() => {
            let p = "";
            if (!self.valueSet()){
                let useActiveResult = !self.activeResult().value ? false :
                    self.activeResult().value.toLowerCase().startsWith(params.query().toLowerCase()) ? true : false;
                let useTopResult = useActiveResult ? false : !self.results().length ? false :
                    self.results()[0].value.toLowerCase().startsWith(params.query().toLowerCase()) ? true : false;
                
                let pResult = useActiveResult ? self.activeResult().value : useTopResult ? self.results()[0].value : false;
                if (pResult && self.show()) {
                    p = params.query() + pResult.substring(params.query().length, pResult.length);
                }
            }
            return p;
        });

        self.keyDown = function(value, event) {
            let keyActions = {
                navigation: ["ArrowDown", "ArrowUp"],
                selection: ["Enter", "Tab"],
                escape: ["Escape", "Cancel"]
            };
            let interception = (() => {
                for (const action in keyActions){
                    if (keyActions[action].includes(event.key)) return action;
                }
            })();
            let index = self.results().indexOf(self.activeResult());
            switch (interception) {
                case 'navigation':
                    event.preventDefault();
                    let destination = index === -1 ? 0 : 
                                    event.key === "ArrowUp" ? index-1 :
                                    event.key === "ArrowDown" ? index+1 : false;
                    if (destination >= 0 && destination < self.results().length) {
                        if (self.activeResult()) self.deactivate(self.activeResult());
                        self.activate(self.results()[destination]);
                    }
                    break;
                case 'selection':
                    if (event.key === "Enter" && self.valueSet()) self.unsetValue();
                    else if (event.key === "Tab" && event.shiftKey) return true;
                    else if (self.activeResult() && !self.valueSet()) self.setValue(index, self.activeResult(), event);
                    break;
                case 'escape':
                    self.unsetValue();
                    break;
                default:
                    break;
            }
            return true;
        };
    };
});
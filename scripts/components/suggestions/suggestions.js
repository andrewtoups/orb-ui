define(['ko'], function(ko){
    return function(params){
        let self = this;

        let Suggestion = function(properties){
            this.active = ko.observable(false);
            if (properties.address[params.type]) properties.rank = ko.computed(() => self.rankResult(properties));
            for (const property in properties){
                this[property] = properties[property];
            }
        };

        self.selected = ko.observable(null);
        self.valueSet = ko.computed(() => self.selected() !== null );
        self.value = ko.observable(null);
        self.select = function(value, event){
            event.preventDefault();
            self.value(value);
            self.selected(value.address[params.type]);
            params.results([]);
            if (self.activeResult()) self.deactivate(self.activeResult());
        };
        self.value.subscribe(newValue => {
            params.value(newValue);
        });
        params.value.subscribe(newValue => {
            if (newValue.address[params.type]){
                self.selected(newValue.address[params.type]);
            }
        });
        self.unselect = function(){
            params.results([]);
            self.query('');
            self.selected(null);
        };

        self.rankResult = (result) => {
            let resStr = result.address[params.type].toLowerCase();
            let q = params.query().toLowerCase();
            let rank = resStr === q ? 1 :
                        resStr.startsWith(q) && resStr.includes(q) ? 2 :
                        resStr.includes(q) ? resStr.length : 3;
            if (!rank) rank = 4;
            return rank;
        }
        
        self.results = ko.computed(() => {
            params.status(true);
            console.log("receiving results from params.results: ", params.results());
            if (self.valueSet()) results = [];
            else if (params.results().length) results = params.results().map((result) => new Suggestion(result));
            else results = params.results();
            results = results.filter(result => result.rank() > 0);
            results.sort((a,b) => {
                return a.rank() === b.rank() ? 0 :
                        a.rank() > b.rank() ? 1 : -1;
            });
            params.status(false);
            return results;
        });
        self.inputFocus = ko.observable(false);
        self.valueSet.subscribe(newValue => {
            self.inputFocus(!newValue);
        });
        self.show = ko.computed(() => {
            return self.results().length && self.inputFocus();
        });

        self.query = ko.observable(params.query());
        self.query.subscribe(newValue => {
            params.query(newValue);
        });

        self.currentInput = ko.observable();
        self.currentInput.subscribe(newValue => {
            params.input(newValue);
        });

        self.selected.subscribe(newValue => {
            params.selected(newValue);
        });

        self.activeResult = ko.observable();

        self.results.subscribe(newValue => {
            if (!newValue.find(result => result.active() === true) && newValue.length) {
                self.activate(newValue[0]);
            }
            else if (newValue.length === 0){
                self.activeResult(null);
            }
        });
        
        self.activate = function(suggestion){
            suggestion.active(true);
            self.activeResult(suggestion);
        };
        self.deactivate = function(suggestion){
            suggestion.active(false);
            self.activeResult(null);
        };

        
        self.placeholder = ko.computed(() => {
            let useActiveResult = !self.activeResult() ? false :
                self.activeResult().address[params.type].toLowerCase().startsWith(params.query().toLowerCase()) ? true : false;
            let useTopResult = useActiveResult ? false : !self.results().length ? false :
                self.results()[0].address[params.type].toLowerCase().startsWith(params.query().toLowerCase()) ? true : false;
            
            let pResult = useActiveResult ? self.activeResult() : useTopResult ? self.results()[0] : false;
            if (pResult && self.show()) {
                p = params.query().substring(0, pResult.rank()) + pResult.address[params.type].substring(pResult.rank(), pResult.address[params.type].length);
            } else {
                p = "";
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
            switch (interception) {
                case 'navigation':
                    event.preventDefault();
                    let index = self.results().indexOf(self.activeResult());
                    let destination = index === -1 ? 0 : 
                                    event.key === "ArrowUp" ? index-1 :
                                    event.key === "ArrowDown" ? index+1 : false;
                    if (destination >= 0 && destination < self.results().length) {
                        if (self.activeResult()) self.deactivate(self.activeResult());
                        self.activate(self.results()[destination]);
                    }
                    break;
                case 'selection':
                    if (event.key === "Enter" && self.valueSet()) self.unselect();
                    else if (event.key === "Tab" && event.shiftKey) return true;
                    else if (self.activeResult()) self.select(self.activeResult(), event);
                    break;
                case 'escape':
                    self.unselect();
                    break;
                default:
                    break;
            }
            return true;
        };
    };
});
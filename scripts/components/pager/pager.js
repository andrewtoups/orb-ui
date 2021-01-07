define([
    'ko',
    'utils/inputModeSwitcher'
], function(ko, inputMode){
    return function() {
        var self = this;
        
        self.inputMode = ko.observable();
        self.pointerMode = ko.observable();
        self.inputMode.subscribe(newValue => {
            if (newValue === 'touch' || newValue === 'mouse') {
                self.pointerMode(newValue);
            } else {
                self.pointerMode(self.pointerMode());
            }
        });
        self.registry = ko.observableArray(['pager']);
        self.pages = [
            'natalForm',
            'poem'
        ];
        self.currentPageComponent = ko.observable({});
        self.currentPage = ko.computed(() => {
            return self.currentPageComponent().hasOwnProperty('name') ? self.currentPageComponent().name :
                    typeof self.currentPageComponent() === 'string' ? self.currentPageComponent() : false;
        });
        self.changePage = function(name, params){
            self.currentPageComponent(params ? { name: name, params: params } : name);
            if (!self.registry().includes(name)) self.loadComponent(name);
        }

        self.loadComponent = function(name){
            let cPath = "components";
            let jsPath = `${cPath}/${name}/${name}`;
            let htmlPath = `text!${cPath}/${name}/${name}.html`;
            require([jsPath, htmlPath], function(viewModel, template){
                var vm = {
                    viewModel: {
                        createViewModel: function(params, componentInfo){
                            self[name] = new viewModel(params);
                            return self[name];
                        }
                    },
                    template: template
                };
                if (!self.registry().includes(name)) {
                    ko.components.register(name, vm);
                    self.registry.push(name);
                }
            });
        };
        self.removeComponent = function(name){
            self.registry.remove(name);
            ko.components.unregister(name);
        };
        self.currentPage.subscribe(newValue => {
            let inactivePages = self.registry().filter(page => self.pages.includes(page) && page !== newValue);
            if (inactivePages.length) {
                inactivePages.forEach(page => {
                    self.removeComponent(page);
                });
            }
        });

        self.ready = ko.computed(() => {
            return self.registry().includes(self.currentPage());
        });

        setTimeout(() => {
            self.changePage('natalForm');
        }, 0);

        self.requestCounter = ko.observableArray([{
            name: 'azure',
            requests: ko.observable(0)
        }, {
            name: 'photon',
            requests: ko.observable(0)
        }]);
        self.requestsThisSession = ko.computed(() => self.requestCounter().reduce((total, {requests}) => total.requests() + parseInt(requests())));
        self.addRequest = (key) => { 
            let api = self.requestCounter().find(({name}) => name === key);
            api.requests(api.requests()+1);
        };

        self.keyDown = function(value, event){
            if (event.key === "p" && vm.poem) vm.poem.showPlacements(!vm.poem.showPlacements());
            return true;
        };
    };
});
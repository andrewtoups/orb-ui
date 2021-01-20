define([
    'ko',
    'utils/inputModeSwitcher',
    'utils/page'
], function(ko, inputMode, {Page, Transition}){
    return function() {
        let self = this;
        const splashDelay = 0;

        // Pager states:
        self.registry = ko.observableArray(['pager']);

        self.splashTimeout = ko.observable(true);
        setTimeout(() => {self.splashTimeout(false)}, splashDelay);

        self.initialLoadComplete = ko.computed(() => !self.splashTimeout() );
        self.natalFormSubmitted = ko.observable(false);

        self.isLoading = ko.observable(true);
        
        self.pageLoading = ko.observable(false);
        self.pageLoading.subscribe(s => { self.isLoading(s) });

        self.natalFormReady = ko.observable(false);
        self.poemDataReady = ko.observable(false);

        // Define pages and show/hide states:
        let natalForm = new Page('natalForm');
        natalForm.show(new Transition(self.natalFormReady));
        natalForm.hide(new Transition(self.poemDataReady));

        let poem = new Page('poem');
        self.poemReady = ko.computed(() => self.poemDataReady() && natalForm.hiding());
        poem.base('zoom');
        poem.hide(new Transition(false, 'masked out'));
        poem.show(new Transition(self.poemDataReady));

        self.loadComponent = function(name, state){
            if (!self.registry().includes(name)) {
                state && state(true);
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
                    ko.components.register(name, vm);
                    self.registry.push(name);
                    state && state(false);
                });
            }
        };
        self.removeComponent = function(name){
            self.registry.remove(name);
            ko.components.unregister(name);
        };

        let Pages = [
            natalForm, poem
        ];
        self.pages = ko.observableArray([]);
        self.latestCompletePage = ko.observable('');
        Pages.forEach(page => {
            page.loading.subscribe(s => self.pageLoading(s));
            page.showingComplete.subscribe(s => {
                if (s) {
                    self.latestCompletePage(`${page.name()}-page`);
                    
                    let disposables = self.pages().filter(p => p.dispose && p !== page);
                    self.pages(self.pages().filter(p => !disposables.includes(p)));
                    disposables.forEach(d => { self.removeComponent(d.name()) });
                }
            });
        });        

        self.loadPage = (pageName, params) => {
            let page = Pages.find(page => page.name() === pageName);
            params && page.setParams(params);
            self.loadComponent(page.name(), page.loading);
            self.pages.push(Pages.find(page => page.name() === pageName));
        };
        self.initialLoadComplete.subscribe(s => {
            s && self.loadPage('natalForm');
        });

        self.hideOrb = ko.computed(() => self.natalFormReady() &&
                                         !natalForm.showingComplete() &&
                                         !natalForm.hidingComplete());
        self.orbClass = ko.computed(() => {
            let c = [];
            if (!self.splashTimeout() || natalForm.showing()) c.push('orb-loader');
            if (self.hideOrb()) c.push('masked');
            if (self.natalFormReady() && natalForm.showingComplete()) c.push('logo');
            if (self.poemDataReady()) c.push('logo');
            return c.join(' ');
        }); 

        // Global input tracking:
        self.inputMode = ko.observable();
        self.pointerMode = ko.observable();
        self.inputMode.subscribe(newValue => {
            if (newValue === 'touch' || newValue === 'mouse') {
                self.pointerMode(newValue);
            } else {
                self.pointerMode(self.pointerMode());
            }
        });
        
        // Debug:
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
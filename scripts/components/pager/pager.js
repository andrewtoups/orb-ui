define([
    'ko',
    'utils/inputModeSwitcher',
    'utils/page',
    'api'
], function(ko, inputMode, {Page, Transition}, api){
    return function() {
        // pull new poem data from spreadsheet:
        api.updatePoemData().then(data => console.log(data));
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
        self.natalFormShowingComplete = natalForm.showingComplete;
        self.natalFormHidingComplete = natalForm.hidingComplete;

        let poem = new Page('poem');
        self.hidePoem = ko.observable(false);
        self.poemReady = ko.computed(() => self.poemDataReady() && natalForm.hiding());
        poem.base('zoom');
        poem.show(new Transition(self.poemDataReady));
        poem.hide(new Transition(self.hidePoem, 'masked out'));

        self.loadComponent = function(name, state){
            if (!self.registry().includes(name)) {
                state && state(true);
                let cPath = "components";
                let jsPath = `${cPath}/${name}/${name}`;
                let htmlPath = `text!${cPath}/${name}/${name}.html`;
                require([jsPath, htmlPath], function(viewModel, template){
                    if (!self.registry().includes(name) && !ko.components.isRegistered(name)) {
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
                    }
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

        self.pageTransitioning = ko.computed(() => self.pages().some(page => page.transitioning()));

        self.loadPage = (pageName, params) => {
            let page = Pages.find(page => page.name() === pageName);
            page.reset();
            params && page.setParams(params);
            self.loadComponent(page.name(), page.loading);
            self.pages.push(Pages.find(page => page.name() === pageName));
        };
        self.screenshotMode = ko.observable(false);
        self.placementsMode = ko.observable(true);
        self.togglePlacementsMode = () => { self.placementsMode(!self.placementsMode())} ;
        self.initialLoadComplete.subscribe(s => {
            if (s) {
                let path = window.location.pathname.split('/').filter(i => !!i);
                if (path[0] === "viewPoem") {
                    let qParams = new URLSearchParams(window.location.search);
                    let birthChart = {};
                    self.placementsMode(false);
                    for (const [key, value] of qParams.entries()) {
                        let metaKey;
                        if (key === "screenshot")    self.screenshotMode(value === 'true');
                        if (key === "placements")    self.placementsMode(value === 'true');
                        if (key.includes("Element")) metaKey = key.replace("Element", "");
                        if (key.includes("Sign"))    metaKey = key.replace("Sign", "");
                        if (typeof birthChart[metaKey] === "undefined") birthChart[metaKey] = {sign: "", element: ""};
                        if (key.includes("Element")) birthChart[metaKey].element = value;
                        if (key.includes("Sign"))    birthChart[metaKey].sign = value;
                    }
                    let params = {birthChart: birthChart};
                    console.log(params);
                    self.loadPage('poem', params);
                } else {
                    self.loadPage('natalForm');       
                }                
            }
        });

        self.hideOrb = ko.computed(() => {
            let conditions = [
                (self.natalFormReady() && !natalForm.showingComplete() && !natalForm.hidingComplete()),
                (self.pageTransitioning())
            ];
            return conditions.some(cond => cond);
        });
        self.orbClass = ko.computed(() => {
            let c = [];
            if (self.pageTransitioning() && self.pages().length === 1) c.push('orb-loader');
            if (self.hideOrb()) c.push('masked');
            if (self.natalFormReady() && natalForm.showingComplete()) c.push('logo');
            if (self.poemDataReady()) c.push('logo');
            return c.join(' ');
        });

        self.screenshot = ko.observable();
        self.screenshotPlacements = ko.observable();

        // Modal controls:
        self.loadingModal = ko.observable(false);
        self.currentModal = ko.observable('');
        self.modalParams = ko.observable();
        self.modalActive = ko.computed(() => self.modalParams() ? true : false);
        self.modalData = ko.observable();
        self.launchModal = (name, data) => {
            data && self.modalData(data);
            self.loadComponent('modal', self.loadingModal);
            self.currentModal(name);
        };
        self.closeModal = () => {
            self.removeComponent(self.currentModal());
            self.removeComponent('modal');
            self.modalParams('');
        };
        self.loadingModal.subscribe(s => {
            if (!s) {
                self.modalParams({
                    content: self.currentModal(),
                    data: self.modalData()
                });
            }
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
            if (event.key === "p" && vm.poem) vm.poem.showDebug(!vm.poem.showDebug());
            if (event.key === "`" && !self.natalFormSubmitted() && !self.isLoading()) vm.natalForm.randomChart();
            return true;
        };
    };
});

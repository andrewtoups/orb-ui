define(['ko', 'utils/transitionState'], ko => {
    const hider = 'masked';
    const isValidComponent = (c) => {
        return typeof c === 'string' ||
            (c.hasOwnProperty('name') && typeof c.name === 'string') &&
            (c.hasOwnProperty('params') && typeof c.params === 'object');
    };
    const Transition = function(state, cssClass) {
        this.state = state || ko.observable();
        this.cssClass = cssClass || '';
    };
    const Page = function(name) {
        this.name = ko.observable(name);
        this.params = ko.observable();
        this.setParams = params => { this.params(params) };

        this.element = ko.observable(false);
        this.setElement = el => this.element(el);

        this.component = ko.computed(() => {
            if (!this.params())     return this.name();
            else if (this.params()) return { name: this.name(), params: this.params() };
        });

        this.loading = ko.observable(true);
        // this.loading.subscribe(s => { !s && ko.applyBindingsToNode(this.element(), {component: this.component()}) });

        this.transitioning = ko.observable(false);
        this.showing = ko.observable(false);
        this.hiding = ko.observable(false);
        this.showingComplete = ko.observable(false);
        this.hidingComplete = ko.observable(false);
        this.reset = () => {
            this.loading(true); this.transitioning(false); this.showing(false);
            this.hiding(false); this.showingComplete(false); this.hidingComplete(false);
        };
        this.transitioning.subscribe(s => {
            console.log(this.name(), (s ? 'is' : 'is not'), 'transitioning');
            if (!s && this.showing()) {
                console.log('showing', this.name(), 'complete');
                this.showing(false);
                this.showingComplete(true);
                this.hidingComplete(false);
                getComputedStyle(this.element()).transform !== 'none' && this.element().classList.add('transform-complete');                
            }
            if (!s && this.hiding()) {
                console.log('hiding', this.name(), 'complete');
                this.hiding(false); 
                this.hidingComplete(true);
                this.showingComplete(false);
            }
        });

        this.baseClass = [];
        this.base = baseClass => { this.baseClass = baseClass.split(' ') };

        this.showState = ko.observable();
        this.showClass = [];
        this.show = trans => {
            this.showState = ko.pureComputed(() => trans.state ? trans.state() : ko.observable());
            this.showClass = trans.cssClass ? trans.cssClass.split(' ') : this.showClass;
        };

        this.hideState = ko.observable();
        this.hideClass = hider.split(' ');
        this.hide = trans => {
            this.hideState = ko.pureComputed(() => trans.state ? trans.state() : ko.observable());
            this.hideClass = trans.cssClass ? trans.cssClass.split(' ') : this.hideClass;
        };

        this.dispose = true;
    };
    ko.bindingHandlers.page = {
        init: (element, valueAccessor, allBindings, viewModel, bindingContext) => {
            let page = valueAccessor();
            ko.applyBindingsToNode(element, {transitionState: page.transitioning}, vm);
            page.unbound = true;
            page.created = Date.now();
            page.setElement(element);
            page.hideClass.forEach(c => { element.classList.add(c) });
            page.baseClass.forEach(c => { element.classList.add(c) });
            if (page.name() === 'poem') console.log('on creation, poem showingComplete:',page.showingComplete());
            element.classList.add(`${page.name()}-page`);
            element.classList.add('fixed');
        },
        update: (element, valueAccessor) => {
            let page = valueAccessor();
            let timeElapsed = Date.now() - page.created;
            let timeout = (timeElapsed < 50) ? 50 : 0;
            if (!page.loading() && page.unbound) {
                ko.applyBindingsToNode(element, {component: page.component()}, vm);
                page.unbound = false;
            }

            if (page.showState() && !page.showingComplete() && !page.hideState()) {
                page.showing(true);
                getComputedStyle(element).transform !== 'none' && element.classList.contains('transform-complete') && element.classList.remove('transform-complete');
                setTimeout(() => {
                    page.hideClass.forEach(c => { c && element.classList.remove(c) });
                    page.showClass && page.showClass.forEach(c => { c && element.classList.add(c) });
                }, timeout);
            }
            else if (element.classList.contains('fixed') && page.showingComplete()) element.classList.remove('fixed');

            if (page.hideState() && !page.hidingComplete()) {
                page.hiding(true);
                page.hideClass.forEach(c => { c && element.classList.add(c) });
            }
        }
    };
    return {Page: Page, Transition: Transition};
});

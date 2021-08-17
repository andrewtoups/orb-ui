define(['ko'], (ko) => {
    return function(params) {
        let self = this;
        let start = new Date();
        self.content = params.content;
        self.data = params.data || {};
        self.loading = ko.observable(true);
        self.closing = ko.observable(false);
        self.modalClasses = ko.computed(() => {
            let elapsed = new Date() - start;
            const delay = 15;
            if (self.loading() || self.closing()) return 'hide';
            else if (elapsed < delay) {
                self.loading(true);
                setTimeout(() => {self.loading(false)}, delay - elapsed);
                return 'hide';
            } else return 'show';
        });
        self.transitionState = ko.observable(false);
        self.data.closeCb = ko.observable();
        self.modalLoading = ko.observable(false);
        self.loadingComplete = ko.observable(true);
        self.modalLoading.subscribe(nv => {console.log(`modal loading: ${nv}`)});
        self.close = (v, e) => {
            if ([document.querySelector('.modal'), document.querySelector('.x')].includes(e.target)) {
                self.closing(true);
                self.data.closeCb() && self.data.closeCb()();
            }
            return true;
        };
        self.transitionState.subscribe(s => {
            !s && self.closing() && vm.closeModal();
        });
        if (vm.registry().includes(params.content)) setTimeout(() => { self.loading(false) }, 1);
        else vm.loadComponent(self.content, self.loading);
    };
});

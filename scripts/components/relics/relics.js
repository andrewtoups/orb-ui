define(['ko', 'api'], (ko, api) => {
    return function(){
        let self = this;

        self.ready = ko.observable(false);
        vm.modal.loadingComplete(false);
        params.closeCb(() => { self.ready(false) });
        
        self.ready.subscribe(nv => {
            vm.modal.modalLoading(!nv);
            if (nv) { vm.modal.loadingComplete(true); }
            });
        }
    }
});

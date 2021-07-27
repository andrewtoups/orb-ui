define(["ko"], ko => {
    return function(params){
        let self = this;
        self.href = ko.computed(() =>  vm.placementsMode() ? vm.screenshotPlacements() : vm.screenshot() );
        self.btnCls = ko.computed(() => vm.placementsMode() ? "on" : "off");
        let path = "/styles/png/";
    }
})

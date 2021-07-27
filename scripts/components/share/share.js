define(["ko"], ko => {
    return function(params){
        let self = this;
        self.toggleShowPlacements = () => { vm.showPlacements(!vm.showPlacements()); };
        self.href = ko.computed(() =>  vm.showPlacements() ? vm.screenshotPlacements() : vm.screenshot() );
        self.btnCls = ko.computed(() => vm.showPlacements() ? "on" : "off");
        let path = "/styles/png/";
    }
})

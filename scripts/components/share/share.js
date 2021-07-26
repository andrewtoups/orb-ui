define(["ko"], ko => {
    return function(params){
        let self = this;
        self.showPlacements = ko.observable(false);
        self.toggleShowPlacements = () => { self.showPlacements(!self.showPlacements()); };
        self.href = ko.computed(() =>  self.showPlacements() ? vm.screenshotPlacementsURI() : vm.screenshotURI() );
        self.btnCls = ko.computed(() => self.showPlacements() ? "on" : "off");
        let path = "/styles/png/";
    }
})

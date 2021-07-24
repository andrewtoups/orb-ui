define(["ko"], ko => {
    return function(params){
        let self = this;
        self.showPlacements = ko.observable(false);
        self.href = ko.computed(() =>  self.showPlacements() ? vm.screenshotPlacementsURI() : vm.screenshotURI() );
        let path = "/styles/png/";
        self.btnCls = ko.computed(() => vm.pointerMode() === "touch" ? "long-press" : "save-btn");
        self.btnEnabled = ko.computed(() => self.btnCls() !== "touch");
    }
})

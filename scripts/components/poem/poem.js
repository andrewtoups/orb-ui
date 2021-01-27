define(['ko'], function(ko){
    return function(params){
        let self = this;
        console.log(params.birthChart);

        self.showPlacements = ko.observable(false);
        let bdate = params.birthData.date;
        let blocation = params.birthData.location;
        let bcoords = params.birthData.coord;
        self.birthDay = ko.observable(`${bdate.getMonth()+1}/${bdate.getDate()}/${bdate.getFullYear()} -- ${bdate.getHours()+1}:${(bdate.getMinutes()<10?'0':'')+bdate.getMinutes()} UTC`);
        self.coords = ko.observable(`${bcoords[0]},${bcoords[1]}`);
        self.location = ko.observable(`${blocation.city}, ${blocation.state} ${blocation.country}`);

        self.sun = ko.observable(params.birthChart.sun);
        self.mars = ko.observable(params.birthChart.mars);
        self.rising = ko.observable(params.birthChart.ascendant);
        self.venus = ko.observable(params.birthChart.venus);
        self.moon = ko.observable(params.birthChart.moon);
        self.mercury = ko.observable(params.birthChart.mercury);

        self.poemData = ko.observableArray();
        self.poemData.subscribe(s => {
            s && self.isLoading(false);
            s && vm.poemDataReady(true);
            !s && vm.poemDataReady(false);
        });
        self.isLoading = ko.observable(true)
        self.isLoading.subscribe(newValue => {
            vm.isLoading(newValue);
        });
        api.poem().then(data => { self.poemData(data) });
        self.lines = ko.computed(() => {
            return self.poemData().map(line => {
                let planet = Object.keys(line)[0];
                return {
                    line: line[planet][self[planet]()],
                    placement: `${self[planet]()} ${planet}`
                };
            });
        });
        document.querySelector('main').focus();
    };
});
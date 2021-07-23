define(['ko', 'api'], function(ko, api){
    return function(params){
        let self = this;
        !vm.screenshotMode() && api.screenshot(params.birthChart).then(data => vm.screenshotURI(data));

        self.showDebug = ko.observable(false);
        self.linesActive = ko.observable(false);
        self.toggleActive = () => { self.linesActive(!self.linesActive())};
        self.birthData = params.birthData;
        if (params.birthData){
            let bdate = params.birthData.date;
            let blocation = params.birthData.location;
            let bcoords = params.birthData.coord;
            self.birthDay = ko.observable(`${bdate.getMonth()+1}/${bdate.getDate()}/${bdate.getFullYear()} -- ${bdate.getHours()+1}:${(bdate.getMinutes()<10?'0':'')+bdate.getMinutes()} UTC`);
            self.coords = ko.observable(`${bcoords[0]},${bcoords[1]}`);
            self.location = ko.observable(`${blocation.city}, ${blocation.state} ${blocation.country}`);            
        }

        self.sun = ko.observable(params.birthChart.sun);
        self.mars = ko.observable(params.birthChart.mars);
        self.rising = ko.observable(params.birthChart.ascendant);
        self.venus = ko.observable(params.birthChart.venus);
        self.moon = ko.observable(params.birthChart.moon);
        self.mercury = ko.observable(params.birthChart.mercury);

        self.poemData = ko.observableArray();
        self.poemData.subscribe(newValue => {
            let dataExists = !!newValue.length;
            self.isLoading(!dataExists);
            vm.poemDataReady(dataExists);
            vm.hidePoem(false);
        });
        self.isLoading = ko.observable(true)
        self.isLoading.subscribe(newValue => {
            vm.isLoading(newValue);
        });
        let icons = {};
        self.iconPrimary = ko.observable(""), self.iconSecondary = ko.observable(""), self.iconTertiary = ko.observable("");
        require(['dataStore/icons'], iconObj => {
            icons = iconObj;
            self.randomizeIcons();
        });
        self.keyDown = (v, e) => {
            if (e.code==="KeyR") {
                self.randomizeIcons();
            }
            if (e.code==="KeyQ") {
                self.cycleIcons(icons.primary, self.iconPrimary, "up");
            }
            if (e.code==="KeyW") {
                self.cycleIcons(icons.primary, self.iconPrimary, "down");
            }
            if (e.code==="KeyA") {
                self.cycleIcons(icons.secondary, self.iconSecondary, "up");
            }
            if (e.code==="KeyS") {
                self.cycleIcons(icons.secondary, self.iconSecondary, "down");
            }
            if (e.code==="KeyZ") {
                self.cycleIcons(icons.tertiary, self.iconTertiary, "up");
            }
            if (e.code==="KeyX") {
                self.cycleIcons(icons.tertiary, self.iconTertiary, "down");
            }
            return true;
        }
        self.randIcon = (iconSet, icon) => {
            let i;
            while (!i) {
                let t = Math.floor(Math.random()*iconSet.length);
                if (t !== iconSet.indexOf(icon())) i = t;
            }
            i > -1 && i < iconSet.length-1 && icon(iconSet[i]);
        }
        self.randomizeIcons = () => {
            self.randIcon(icons.primary, self.iconPrimary);
            self.randIcon(icons.secondary, self.iconSecondary);
            self.randIcon(icons.tertiary, self.iconTertiary);
        };
        self.cycleIcons = (iconSet, icon, dir) => {
            let i;
            if (dir==="up") {
                i = iconSet.indexOf(icon()) === iconSet.length-1 ? 0 : iconSet.indexOf(icon())+1;
            }
            if (dir==="down") {
                i = iconSet.indexOf(icon()) === 0 ? iconSet.length-1 : iconSet.indexOf(icon())-1;
            }
            i > -1 && icon(iconSet[i]);
        };
        api.poem().then(data => { self.poemData(data) });
        self.lines = ko.computed(() => {
            return self.poemData().map(line => {
                let planet = Object.keys(line)[0];
                return {
                    line: line[planet][self[planet]().sign],
                    placement: `${self[planet]().sign} ${planet}`
                };
            });
        });
    };
});

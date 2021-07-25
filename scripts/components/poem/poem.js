define(['ko', 'api'], function(ko, api){
    return function(params){
        let self = this;
        !vm.screenshotMode() && api.screenshot(params.birthChart).then(data => vm.screenshotURI(data));
        vm.screenshotURI.subscribe(nv => {
            if (typeof nv !== 'undefined') api.screenshot(params.birthChart, true).then(data => vm.screenshotPlacementsURI(data));
        });

        self.showDebug = ko.observable(false);
        self.linesActive = ko.observable(false);
        if (vm.placementsMode()) self.linesActive(true);
        self.toggleActive = () => { if(!vm.placementsMode()) self.linesActive(!self.linesActive())};
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

        let icons = {};
        self.iconPrimary = ko.observable(""), self.iconSecondary = ko.observable(""), self.iconTertiary = ko.observable("");
        require(['dataStore/icons'], iconObj => {
            icons = iconObj;
        });
        self.stats = ko.observable({});
        self.iconsReady = ko.observable(false);
        require(['dataStore/iconMap'], iconMap => {
            let Stats = function(){
                this.log = [],
                this.logger = msg => { 
                    msg!=="nl" && console.log(msg);
                    this.log.push(msg);
                };
            };
            let stats = new Stats();
            let tieBreaker = ["sun","ascendant","moon","mars","venus","mercury"];
            let placementOrder = tieBreaker;
            let elementRank = [{fire: 0}, {earth: 0}, {air: 0}, {water: 0}];
            for (placement in (params.birthChart)) {
                let val;
                if      (placement === "sun")       val=8;
                else if (placement === "moon")      val=6.5;
                else if (placement === "ascendant") val=6.5;
                else                                val=3.5;

                let element = params.birthChart[placement].element;
                let sign = params.birthChart[placement].sign;
                elementRank.forEach(item => {
                    if (Object.keys(item)[0] === element) {
                        stats.logger(`${sign} ${placement} (${element} sign)`);
                        stats.logger(`placement weight: ${val}`);
                        stats.logger(`current score:    ${item[element]}`);
                        stats.logger(`                 +___`);
                        stats.logger(`                  ${item[element]+val}`);
                        stats.logger(`${element}'s new score: ${item[element]+val}`)
                        stats.logger(`***************************`);
                        stats.logger(`nl`);
                        item[element] += val;
                    }
                });
            }
            stats.logger(`final element scores:            `);       
            elementRank.forEach((e, i)=>{
                let element = Object.keys(elementRank[i])[0];
                stats.logger(` * ${i+1}: ${elementRank[i][element]} - ${element}`);
            });
            stats.logger(`***************************`);
            stats.logger(`nl`);

            stats.logger(`determining rankings...`)
            let tiesFound = false;
            elementRank.sort((item1, item2) => {
                let item1Obj = {}, item2Obj = {};
                item1Obj.element = Object.keys(item1)[0];
                item2Obj.element = Object.keys(item2)[0];
                item1Obj.count = item1[item1Obj.element];
                item2Obj.count = item2[item2Obj.element];
                if (item1Obj.count > 0 && item1Obj.count === item2Obj.count) {
                    tiesFound=true;
                    stats.logger(`${item1Obj.element} and ${item2Obj.element} are tied with score of ${item1Obj.count}...`);
                    stats.logger(`nl`);
                    let winner = tieBreaker.find(placement => {
                        return params.birthChart[placement].element === item1Obj.element
                            || params.birthChart[placement].element === item2Obj.element;
                    });
                    if (winner) {
                        let loser = params.birthChart[winner].element === item1Obj.element ? item2Obj.element : item1Obj.element;
                        stats.logger(`winner is ${params.birthChart[winner].element} because ${params.birthChart[winner].sign} ${Object.keys(params.birthChart).find(p => p === winner)}`);
                        stats.logger(`comes before any ${loser} placements when checking birth chart in this order:`);
                        stats.logger(`nl`);
                        stats.logger(`${tieBreaker.map(i => i.substring(0,3)).join(" -> ")}`);
                        if      (params.birthChart[winner].element === item1Obj.element) item1Obj.count++;
                        else if (params.birthChart[winner].element === item2Obj.element) item2Obj.count++;
                    }
                    else stats.logger(`ruh roh, winner not resolved :cringe:`);
                    stats.logger(`nl`);
                }
                return item2Obj.count - item1Obj.count;
            });
            if (!tiesFound) stats.logger(`no ties found...`);
            stats.logger(`***************************`);
            stats.logger(`nl`);
            stats.logger(`initial element ranking is:`);       
            elementRank.forEach((e, i)=>{
                let element = Object.keys(elementRank[i])[0];
                stats.logger(` * ${i+1}: ${elementRank[i][element]} - ${element}`);
            });
            stats.logger(`***************************`);
            stats.logger(`nl`);
            let threshold = elementRank[0][Object.keys(elementRank[0])[0]]/2;
            stats.logger(`outlier threshold is ${threshold} (highest rank divided by 2)`);
            elementRank = elementRank.filter((e, i) => {
                let element = Object.keys(e)[0];
                let thisScore = e[element];
                return thisScore >= threshold;
            });
            stats.logger(`final element ranking after removing elements with a score less than ${threshold}:`);       
            elementRank.forEach((e, i)=>{
                let element = Object.keys(elementRank[i])[0];
                stats.logger(` * ${i+1}: ${elementRank[i][element]} - ${element}`);
            });
            stats.logger(`***************************`);
            stats.logger(`nl`);
            let elementPrimary, elementSecondary, elementTertiary;
            if (elementRank.length >= 3) {
                elementPrimary =   Object.keys(elementRank[0])[0];
                elementSecondary = Object.keys(elementRank[1])[0];
                elementTertiary =  Object.keys(elementRank[2])[0];
            } else if (elementRank.length === 2) {
                elementPrimary =   Object.keys(elementRank[0])[0];
                elementSecondary = elementPrimary;
                elementTertiary =  Object.keys(elementRank[1])[0];
            } else if (elementRank.length === 1) {
                elementPrimary =   Object.keys(elementRank[0])[0];
                elementSecondary = elementPrimary;
                elementTertiary =  elementPrimary;
            }
            let placementPrimary =   tieBreaker.find(placement => params.birthChart[placement].element === elementPrimary);
            tieBreaker = tieBreaker.filter(i => i!==placementPrimary);

            let placementSecondary = tieBreaker.find(placement => params.birthChart[placement].element === elementSecondary) || tieBreaker[0];
            tieBreaker = tieBreaker.filter(i => i!==placementSecondary);

            let placementTertiary =  tieBreaker.find(placement => params.birthChart[placement].element === elementTertiary) || tieBreaker[0];
            tieBreaker = tieBreaker.filter(i => i!==placementTertiary);

            if (elementRank.length === 2 && placementOrder.indexOf(placementTertiary) < placementOrder.indexOf(placementSecondary)) {
                stats.logger(`Swapping tertiary and secondary to preserve preferred order...`);
                stats.logger(`***************************`);
                stats.logger(`nl`);                
                let t = placementSecondary;
                placementSecondary = placementTertiary;
                placementTertiary = t;
            }

            // let elementPrimary = Object.keys(elementRank[0])[0];
            // let placementPrimary =   tieBreaker.find(placement => params.birthChart[placement].element === elementPrimary) || tieBreaker[0];
            // tieBreaker = tieBreaker.filter(i => i!==placementPrimary);
            // stats.logger(`primary   placement:  ${placementPrimary}`);
            // stats.logger("tieBreaker after selecting primary: "+tieBreaker);
            // let elementSecondary = elementRank.length > 1 ? Object.keys(elementRank[1])[0] : elementPrimary;
            // let placementSecondary = tieBreaker.find(placement => params.birthChart[placement].element === elementSecondary) || tieBreaker[0];
            // tieBreaker = tieBreaker.filter(i => i!==placementSecondary);
            // stats.logger(`secondary placement:  ${placementSecondary}`);
            // stats.logger("tieBreaker after selecting secondary: "+tieBreaker);
            // let elementTertiary = elementRank.length > 2 ? Object.keys(elementRank[2])[0] : elementSecondary;
            // let placementTertiary =  tieBreaker.find(placement => params.birthChart[placement].element === elementTertiary) || tieBreaker[0];
            // tieBreaker = tieBreaker.filter(i => i!==placementTertiary);
            // stats.logger(`tertiary  placement:  ${placementTertiary}`);
            // stats.logger("tieBreaker after selecting tertiary: "+tieBreaker);
            let signPrimary =   params.birthChart[placementPrimary].sign;
            // stats.logger(`primary   sign:       ${signPrimary}`);
            let signSecondary = params.birthChart[placementSecondary].sign;
            // stats.logger(`secondary sign:       ${signSecondary}`);
            let signTertiary =  params.birthChart[placementTertiary].sign;
            // stats.logger(`tertiary  sign:       ${signTertiary}`);

            self.iconPrimary(iconMap[signPrimary].primary[placementPrimary]);
            self.iconSecondary(iconMap[signSecondary].secondary[placementSecondary]);
            self.iconTertiary(iconMap[signTertiary].tertiary[placementTertiary]);
            self.iconsReady(true);

            stats.logger(`natal chart:`);
            placementOrder.forEach(i => {
                stats.logger(` * ${params.birthChart[i].sign} ${i},`);
            });
            stats.logger(`***************************`);
            stats.logger(`nl`);
            if (elementRank.length === 2) {
                stats.logger(`Only two elements rank, so highest rank gets two icons:`);
                stats.logger(`nl`);
            }
            if (elementRank.length === 1) {
                stats.logger(`Only one element ranks, so that element gets all three icons:`)
                stats.logger(`nl`);
            } 
            stats.logger(`primary   icon: ${self.iconPrimary()} (${signPrimary} ${placementPrimary})`);
            stats.logger(`secondary icon: ${self.iconSecondary()} (${signSecondary} ${placementSecondary})`);
            stats.logger(`tertiary  icon: ${self.iconTertiary()} (${signTertiary} ${placementTertiary})`);
            stats.logger(`***************************`);

            // stats.logger("birthChart params:", params.birthChart);
            self.stats(stats.log);
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

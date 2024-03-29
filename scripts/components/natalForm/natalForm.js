define([
    'ko',
    'api',
    'utils/clean',
    'utils/optionsPlaceholder'
], function(ko, api){
    return function(params) {
        var self = this;
        // Loading:
        vm.loadComponent('suggestions');
        vm.loadComponent('addressResult');
        self.suggestionFieldsReady = ko.computed(() => vm.registry().includes('suggestions') && vm.registry().includes('addressResult'));
                
        // Time Data:
        self.timeObservables =[
            "month", "day", "year", "hour", "minute", "pmOffset"
        ];
        self.timeObservables.forEach((name, index) => {
            self[name] = ko.observable();
        });
        self.scrollToTop = () => {
            window.scrollTo(0,0);
        }
        
        self.birthTimeTouched = function() {
            return self.timeObservables.every(name => self[name].touched ? self[name].touched() : false);
        };
        self.formTouched = function() {
            return self.timeObservables.some(name => self[name].touched ? self[name].touched() : false) || self.city() !== null;
        }
        
        self.milHour = ko.computed(() => parseInt(self.hour()) + parseInt(self.pmOffset()));
        self.timeProcessing = ko.observable(false);
        self.rawDateReady = ko.computed(() => {
            if (self.year() !== null &&
            self.month() !== null &&
            self.day() !== null &&
            self.milHour() !== null &&
            self.minute() !== null &&
            self.birthTimeTouched()) {
                self.timeProcessing(true);
                return true;
            } else {
                self.timeProcessing(false);
            }
        });
        self.rawDate = ko.computed(() => {
            if (self.rawDateReady()){
                self.timeProcessing(false);
                return new Date(self.year(), self.month() - 1, self.day(), self.milHour(), self.minute());
            }
        });
        self.rawDate.extend({rateLimit: 1000});
        self.historicalTZData = ko.observable();

        self.tzOffset = ko.computed(() => {
            let d = self.historicalTZData();
            return d ? parseInt(d.StandardOffset) + parseInt(d.DaylightSavings) : null;
        });

        self.UTCdate = ko.computed(() => {
            let t = self.tzOffset();
            let d = typeof t === 'number' && self.rawDate() ? new Date(self.rawDate()) : null;
            if (d !== null) {
                return  new Date(d.setHours(d.getHours() - t));
            } else {
                return null;
            }
        });

        // Time webform observables:
        self.months = ko.observableArray([]);
        api.months().then(data => { self.months(data) });
        
        self.days = ko.computed(() => {
            let length;
            if (self.months() && self.months().length === 12 && self.month()) {
                let isLeapYear = ((self.year() % 4 == 0) && (self.year() % 100 != 0)) || (self.year() % 400 == 0);
                length = self.months()[self.month() - 1].days;
                if (isLeapYear && self.month() === "2") length++;
            } else {
                length = 31; // In case user hasn't selected a month yet
            }
            let days = [];
            for (let i = 0; i < length; i++) {
                days[i] = i + 1;
            }
            return days;
        });
        
        let years = [];
        const maxYear = new Date().getFullYear()+25;
        const minYear = maxYear-325;
        for (let i = 0; i <= maxYear - minYear; i++){
            years[i] = minYear + i;
        }
        self.years = ko.observableArray(years);
        self.defaultYear = ko.observable(maxYear - 18);
        self.maxYear = ko.observable(maxYear);
        self.minYear = ko.observable(minYear);
        
        let hours = [];
        for (let i = 0; i < 12; i++) {
            hours[i] = i + 1;
        }
        self.hours = ko.observableArray(hours);
        
        let minutes = [];
        for (let i = 0; i < 60; i++) {
            minutes[i] = i;
        }
        self.minutes = ko.observableArray(minutes);

        self.pmOffsets = ko.observableArray([{
            label: "AM",
            value: 0
        }, {
            label: "PM",
            value: 12
        }]);

        self.timeFieldsReady = ko.computed(() => {
            return self.months().length === 12;
        });

        // Location Data:
        let locationFields = [
            'country',
            'state',
            'city'
        ];
        let Result = function(address, coordinates) {
            this.address = address || {city: null, state: null, country: null};
            this.coordinates = coordinates || null;
        };

        self.suggestionsLoading = ko.observable(false);
        self.latestResult = ko.observable();
        locationFields.forEach(type => {
            // Location Webform Observables:
            self[type] = ko.observable();

            // Additional params for suggestions module:
            self[type+"ResponseData"] = ko.observableArray([]);
            self[type+"ResponseData"].subscribe(newValue => {
                if (self.auto() && newValue.length) {
                    self[type+"Query"]('');
                    self[type+"Index"](Math.floor(Math.random()*newValue.length));
                }
            });

            self[type+"Query"] = ko.observable('');
            self[type+"Query"].subscribe(newValue => { geoLookupQuery(newValue, self[type+'ResponseData'], type) });
            self[type+"Query"].extend({rateLimit: 50});
            
            self[type+"resultsLoading"] = ko.observable(false);
            self[type+"resultsLoading"].subscribe(newValue => self.suggestionsLoading(newValue));

            self[type+"Index"] = ko.observable();
            self[type+"Index"].subscribe(newValue => {
                let r = self[type+"ResponseData"]()[newValue];
                if (r) {
                    self.locationOptions().push(`${type}=${r.value.replace(/\s+/g, '+').toLowerCase()}`);
                    self.latestResult(new Result(r.data.address, r.data.coordinates));
                }
                else {
                    self.locationOptions(self.locationOptions().filter(str => str.includes(type)));
                    self.latestResult(new Result());
                }
            });

            self[type+"Params"] = {
                query: self[type+"Query"],
                results: self[type+"ResponseData"],
                value: self[type],
                status: self[type+"resultsLoading"],
                index: self[type+"Index"],
                blur: self.scrollToTop
            };
        });
        
        self.currentLocationValue = ko.computed(() => {
            let r = self.latestResult() ? self.latestResult() : new Result();
            if (r.address.city && self.auto()) self.city(r.address.city);
            if (r.address.city) return r;
        });
        self.coordinates = ko.computed(() => {
            if (self.currentLocationValue()) {
                return self.currentLocationValue().coordinates;
            } else {
                return null;
            }
        });
        self.coordinates.extend({deferred: true});

        // Time summary:
        self.histTimeZone = ko.computed(() => self.historicalTZData() && self.historicalTZData().Tag);
        self.timeSummary = ko.computed(() => {
            let s =   self.month() ? self.month() : '';
            s += s && self.day() ? `/${self.day()}` : '';
            s += s && self.year() ? `/${self.year()}` : '';
            s += s && self.hour() ? ` ${self.hour()}` : '';
            s += s && self.minute() ? `:${self.minute() < 10 ? '0'+self.minute() : self.minute()} ` : '';
            s += s && self.pmOffset() > -1 ? (self.pmOffset() === 0 ? 'AM' : 'PM') : '';
            s += s && self.histTimeZone() ? ` ${self.histTimeZone()}` : '';
            return s;
        });
        self.locationSummary = ko.computed(() => {
            let a = self.currentLocationValue() ? self.currentLocationValue().address : false;
            if (a) return `${a.city}, ${a.state}, ${a.country}`;
        });
        
        // Timezone offset Lookup:
        const azureKey = "zFm6zIHbxMFA9y-fM4rFv2HLSPw7UjBYulvrTTe2TeE";
        self.timeZoneWarning = ko.observable(false);
        self.timeZoneWarning.subscribe(nv => {
            if (nv) {
                setTimeout(function(){
                    self.timeZoneWarning(false);
                }, 6000);
            }
        });
        self.loadingTZ = ko.observable(false);
        self.lastRequest = ko.observable();
        self.tzLookup = function(rawDate, coordinates){
            if (rawDate instanceof Date && !isNaN(rawDate) && coordinates !== null){
                self.loadingTZ(true);
                let coordString = `${coordinates[1]},${coordinates[0]}`;
                let refDate = rawDate.toISOString();
                let request = `https://atlas.microsoft.com/timezone/byCoordinates/json?subscription-key=${azureKey}&api-version=1.0&timestamp=${refDate}&query=${coordString}`;
                if (request !== self.lastRequest()){
                    vm.addRequest('azure');
                    self.lastRequest(request);
                    fetch(request)
                        .then(response => response.json())
                        .then(data => {
                            if (data.hasOwnProperty('TimeZones') && data.TimeZones.length) {
                                self.historicalTZData(data.TimeZones[0].ReferenceTime);
                                self.loadingTZ(false);
                            } else {
                                console.log("Warning: No timezone found for historical data... using present day timezone.");
                                self.timeZoneWarning(true);
                                fetch(`https://atlas.microsoft.com/timezone/byCoordinates/json?subscription-key=${azureKey}&api-version=1.0&query=${coordString}`)
                                .then(response => response.json())
                                .then(data => {
                                    console.log("present day tz lookup:",data);
                                    if (data.hasOwnProperty('TimeZones') && data.TimeZones.length) {
                                        self.historicalTZData(data.TimeZones[0].ReferenceTime);
                                    }
                                });

                            }
                        });
                }
            }
        }
        let tzSub = () => {
            if (self.rawDate() && self.coordinates()) {
                self.tzLookup(self.rawDate(), self.coordinates());
            }
        };
        self.rawDate.subscribe(tzSub);
        self.coordinates.subscribe(tzSub);

        // Submit:
        self.auto = ko.observable(false);
        self.birthChart = ko.observable();
        self.submitted = ko.observable(false);
        self.submitReady = ko.computed(() => {
            const touched = self.birthTimeTouched(), processing = self.timeProcessing(),
            chart = self.birthChart(), auto = self.auto(), submitted = self.submitted();
            if ( touched && !processing && chart && !submitted) {
                return true;
            } else return false;
        });
        self.submitReady.subscribe(nv=>{
            if (nv && self.auto()) {
                self.auto(false);
                self.submit();
            }
        });
        self.submit = () => {
            self.submitted(true);
            let params = {
                birthChart: self.birthChart(),
                birthData: { date: self.UTCdate(), location: self.currentLocationValue().address, coord: self.coordinates() }
            };
            vm.loadPage('poem', params);
            self.auto() && self.auto(false);
        };

        self.calculateChart = function(){
            if (self.UTCdate() && self.coordinates()) {
                self.birthChart(false);
                let d = self.UTCdate();
                let coordinates = self.coordinates() ? self.coordinates() : [-92.0198427,30.2240897];
                let location = self.currentLocationValue().address;

                console.log("calculating chart...");
                api.birthChart({date: d, coordinates: coordinates})
                .then(data => { self.birthChart(data) });
            }
        };
        self.formCompleted = ko.computed(() => {
            return !!self.UTCdate() && self.coordinates();
        });
        self.formCompleted.subscribe(nv => {
            console.log("form is complete.");
            console.log("utcdate is:",self.UTCdate());
            console.log("coordinates is:",self.coordinates());
            if (nv && !self.submitted()) self.calculateChart();
        });

        // Geolocation lookup:
        self.loadingGeoResults = ko.observable(false);
        self.locationOptions = ko.observableArray([]);
        self.photonQueryStr = ko.pureComputed(() => self.coordinates() ? `&lat=${self.coordinates()[1]}&lon=${self.coordinates()[0]}` : '');
        function geoLookupQuery(query, results, type){
            let locationString = self.locationOptions().length ? self.locationOptions().join('&') : '';
            locationString = locationString.length ? `${locationString}&${type}` : type;
            if (query.length > 2) {
                self.loadingGeoResults(true);
                vm.addRequest('photon');
                fetch(`https://photon.komoot.io/api/?q=${query}${self.photonQueryStr()}`)
                .then(response => response.json())
                .then(data => {
                    let filtered = data.features.filter(r => {
                        let conditions = r.properties.type !== type ? false :
                                        self.country() && type !== 'country' ? r.properties.country === self.country() :
                                        self.state() && type !== 'state' ? r.properties.state === self.state() :
                                        self.city() && type !== 'city' ? r.properties.city === self.city() :
                                        true;
                        return conditions;
                    });
                    let process = r => {
                        let p = r.properties;
                        let address = {};
                        let value;
                        switch (type) {
                            case 'city':
                                value = p.name;
                                address.city = p.name;
                                address.state = p.state ? p.state : null;
                                address.country = p.country ? p.country : null;
                                break;
                            case 'state':
                                value = p.name;
                                address.state = p.name;
                                address.country = p.country ? p.country : null;
                                break;
                            case 'country':
                                value = p.country;
                                address.country = p.country;
                                break;
                            default:
                                break;
                        }
                        return {
                            value: value,
                            data: new Result(address, r.geometry.coordinates)
                        };
                    }
                    if (filtered.length === 0){
                        fetch(`https://photon.komoot.io/api/?q=${query}${self.photonQueryStr()}`)
                        .then(response => response.json())
                        .then(data => {
                            results(data.features.map(process));
                            self.loadingGeoResults(false);
                        });
                    } else {
                        results(filtered.map(process));
                        self.loadingGeoResults(false);
                    }
                });
            } else {
                results([]);
            }
        };

        // Loading state:
        self.firstLoad = ko.observable(true);
        self.loadingRandom = ko.observable(false);
        self.isLoading = ko.computed(() => {
            if (self.months().length !== 12) return true;
            if (!self.suggestionFieldsReady()) return true;
            if (self.loadingTZ()) return true;
            if (self.loadingGeoResults()) return true;
            if (self.suggestionsLoading()) return true;
            if (self.auto()) return true;
            if (self.timeProcessing()) return true;
            if (self.submitted()) return true;
            return false;
        });
        self.isLoading.subscribe(newValue => {
            vm.isLoading(newValue);
        });

        self.touchAll = () => {
            document.querySelectorAll('select, input[type="number"]').forEach(node => {
                node.focus();
                node.blur();
            });
        };
        // Load programmatically:
        self.ready = ko.computed(() => self.timeFieldsReady() && self.suggestionFieldsReady());
        self.ready.subscribe(s => {
            vm.natalFormReady(s)
        });
        vm.natalFormShowingComplete.subscribe(s => {
            if (s && params && params.date && params.city) {
                self.auto(true);
                const d = params.date, c = params.city;
                let interval = 100;
                self.timeObservables.forEach(field => {
                    setTimeout(() => {
                        self[field](d[field]);
                        interval += interval;
                    }, interval);
                });
                self.touchAll();
                self.cityQuery(c);
            }
        });
        
        //Random functionality:
        self.randomBtnVisible = ko.observable(true);
        setTimeout(() => {
            self.randomBtnVisible(false);
        }, 3500);
        self.randomGlow = ko.observable(false);
        setTimeout(() => {
            self.randomGlow(true);
        }, 5000);
        self.randomAnimate = ko.observable(false);
        setTimeout(() => {
            self.randomAnimate(true);
        }, 6000);
        self.randomChart = function() {
            self.auto(true);
            let randCity = () => {
                require(['dataStore/cities'], cities => {
                    let randCity = cities[Math.floor(Math.random()*cities.length)];
                    self.cityQuery(randCity);
                });
            };
            let rInt = (min,max) => Math.floor(Math.random() * (max - min) + min);
            let setRand = (name) => {
                let max = self[name]().length;
                let min = 0
                let val = rInt(min, max);
                return name === "years" ? val + 1900 :
                        name === "months" || name === "hours" ? val + 1 : val;
            }
            let time = 0;
            let rTime = 200;
            let interval = rTime/4;
            let waitTime = 100;
            self.touchAll();
            const randomize = window.setInterval(() => {
                time += interval;
                let delay = 50;
                setTimeout(() => {self.month(setRand("months"))}, delay);
                setTimeout(() => {self.day(setRand("days"))}, delay*2);
                setTimeout(() => {self.year(setRand("years"))}, delay*3);
                setTimeout(() => {self.hour(setRand("hours"))}, delay*4);
                setTimeout(() => {self.minute(setRand("minutes"))}, delay*5);
                setTimeout(() => {self.pmOffset(rInt(0,2)*12)}, delay*6);
                
                if (time > rTime) {
                    window.clearInterval(randomize);
                    let tryCity = () => {
                        if (self.cityResponseData().length === 0) {
                            console.log("trying city...");
                            randCity();
                        }
                    }
                    let sub = self.cityResponseData.subscribe(nv => {
                        if (!self.loadingGeoResults() && nv.length === 0) tryCity();
                        else sub.dispose();
                    });
                    tryCity();
                };
            }, interval);
        }
    }
});

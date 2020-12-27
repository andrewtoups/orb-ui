define([
    'ko',
    'utils/clean'
], function(ko){
    return function() {
        var self = this;
        // Loading:
        vm.loadComponent('suggestions');
        vm.loadComponent('addressResult');
        self.suggestionFieldsReady = ko.computed(() => vm.registry().includes('suggestions') && vm.registry().includes('addressResult'));
        
        // Location Data:
        self.currentLocationValue = ko.observable(null);
        self.coordinates = ko.computed(() => self.currentLocationValue() ? self.currentLocationValue().coordinates : null);
        self.coordinates.extend({deferred: true});
        
        // Time Data:
        self.timeObservables = ko.observableArray([
            {name: "month",     init: 1},
            {name: "day",       init: 1},
            {name: "year",      init: false},
            {name: "hour",      init: 1},
            {name: "minute",    init: 0},
            {name: "pmOffset",  init: 0}
        ]);
        self.timeObservables().forEach(({name, init}, index) => {
            self[name] = init !== false ? ko.observable(init) : ko.observable();
        });
        self.birthTimeTouched = function() {
            return self.timeObservables().every(({name}) => self[name].touched ? self[name].touched() : false);
        };
        
        self.milHour = ko.computed(() => parseInt(self.hour()) + parseInt(self.pmOffset()));
        self.rawDateReady = ko.computed(() => {
            if (self.year() !== null &&
            self.month() !== null &&
            self.day() !== null &&
            self.milHour() !== null &&
            self.minute() !== null &&
            self.birthTimeTouched()) {
                return true;
            }
        });
        self.rawDate = ko.observable();
        self.setRawDate = () => {
            if (!self.rawDate()) self.rawDate(new Date(self.year(), self.month() - 1, self.day(), self.milHour(), self.minute()));
            else if (new Date(self.year(), self.month() - 1, self.day(), self.milHour(), self.minute()).getTime() !== self.rawDate().getTime()) {
                self.rawDate(new Date(self.year(), self.month() - 1, self.day(), self.milHour(), self.minute()));
            }
        };
        document.querySelectorAll('select').forEach(node => {
            node.addEventListener('blur', event => {
                if (self.rawDateReady()) {
                    self.setRawDate();
                }
            });
        });
        self.UTCdate = ko.observable();
        
        // Webform properties:

        self.months = ko.observableArray();
        fetch('https://api.2psy.net/orbData/months')
        .then(response => response.json())
        .then(data => {
            self.months(data);
        });
        
        self.days = ko.computed(() => {
            if (self.months() && self.month() ? self.months().length === 12 : false) {
                let isLeapYear = ((self.year() % 4 == 0) && (self.year() % 100 != 0)) || (self.year() % 400 == 0);
                let length = self.months()[self.month() - 1].days;
                if (isLeapYear && self.month() === "2") length++;
                let days = [];
                for (let i = 0; i < length; i++) {
                    days[i] = i + 1;
                }
                return days;
            }
        });
        
        let years = [];
        const minYear = 1900;
        const maxYear = new Date().getFullYear();
        for (let i = 0; i <= maxYear - minYear; i++){
            years[i] = minYear + i;
        }
        self.years = ko.observableArray(years);
        self.defaultYear = ko.observable(maxYear - 18);
        self.year(self.defaultYear());
        
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

        self.timeFieldsReady = ko.computed(() => {
            return self.months ? self.months().length === 12 : false && self.days ? self.days().length === self.months()[self.month() - 1].days : false;
        });
        
        // Timezone offset Lookup:
        const azureKey = "zFm6zIHbxMFA9y-fM4rFv2HLSPw7UjBYulvrTTe2TeE";
        self.loadingTZ = ko.observable(false);
        self.lastRequest = ko.observable();
        self.tzLookup = function(rawDate, coordinates){
            if (rawDate instanceof Date && !isNaN(rawDate) && coordinates !== null){
                let coordString = `${coordinates[1]},${coordinates[0]}`;
                let refDate = rawDate.toISOString();
                let request = `https://atlas.microsoft.com/timezone/byCoordinates/json?subscription-key=${azureKey}&api-version=1.0&timestamp=${refDate}&query=${coordString}`;
                if (request !== self.lastRequest()){
                    vm.addRequest('azure');
                    self.lastRequest(request);
                    fetch(request)
                        .then(response => response.json())
                        .then(data => {
                            if (data.hasOwnProperty('TimeZones') ? data.TimeZones.length : false) {
                                let historicalOffset = parseInt(data.TimeZones[0].ReferenceTime.StandardOffset);
                                let DSTOffset = parseInt(data.TimeZones[0].ReferenceTime.DaylightSavings);
                                let UTCdate = new Date(rawDate);
                                UTCdate.setHours(UTCdate.getHours() - (historicalOffset + DSTOffset));
                                self.UTCdate(UTCdate);
                            } else {
                                self.UTCdate(null);
                            }
                            self.loadingTZ(false);
                        });
                }
            }
        }
        self.rawDate.subscribe(newValue => {
            if (newValue instanceof Date) {
                console.log("rawDate subscription");
                self.tzLookup(newValue, self.coordinates());
            }
        });
        self.coordinates.subscribe(newValue => {
            if (!self.rawDate() && self.rawDateReady()) {
                self.setRawDate();
            }
            console.log('coordinates subscription');
            self.tzLookup(self.rawDate(), newValue);
        });

        // Submit:
        self.submitReady = ko.computed(() => {
            let cond = (
                self.coordinates()
                && self.UTCdate()
                && self.citySelected()
                && self.birthTimeTouched()
            );
            return !!cond;
        });

        self.calculateChart = function(){
            let d = self.UTCdate();
            let coordinates = self.coordinates() ? self.coordinates() : [-92.0198427,30.2240897];
            let long = coordinates[0];
            let lat = coordinates[1];
            let location = self.currentLocationValue() ? self.currentLocationValue().address : {city: "Opelousas", state: "Louisiana", country: "United State of America"}
            let route = `calculateChart/${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}/${d.getHours()}/${d.getMinutes()}/${long}/${lat}`;
            
            fetch(`https://api.2psy.net/${route}`)
            .then(response => response.json())
            .then(data => {
                vm.changePage('poem', {birthChart: data, birthData: {date: d, location: location, coord: coordinates}})
                if (self.loadingRandom()) self.loadingRandom(false);
            });
        };

        // Geolocation lookup:
        self.loadingGeoResults = ko.observable(false);
        self.locationOptions = ko.observableArray([]);
        self.photonQueryStr = ko.pureComputed(() => self.coordinates() ? `&lat=${self.coordinates()[1]}&lon=${self.coordinates()[0]}` : '');
        self.geoLookupQuery = function(query, results, type){
            let locationString = self.locationOptions().length ? self.locationOptions().join('&') : '';
            locationString = locationString.length ? `${locationString}&${type}` : type;
            if (query.length > 2) {
                self.loadingGeoResults(true);
                vm.addRequest('photon');
                fetch(`https://photon.komoot.io/api/?q=${query}${self.photonQueryStr()}`)
                .then(response => response.json())
                .then(data => {
                    results(data.features.filter(r => {
                        let conditions = r.properties.type !== type ? false :
                                        self.countrySelected() && type !== 'country' ? r.properties.country === self.countrySelected() :
                                        self.stateSelected() && type !== 'state' ? r.properties.state === self.stateSelected() :
                                        self.citySelected() && type !== 'city' ? r.properties.city === self.citySelected() :
                                        true;
                        return conditions;
                    }).map(r => {
                        let p = r.properties;
                        let address = {};
                        switch (type) {
                            case 'city':
                                address.city = p.name;
                                address.state = p.state ? p.state : null;
                                address.country = p.country ? p.country : null;
                                break;
                            case 'state':
                                address.state = p.name;
                                address.country = p.country ? p.country : null;
                                break;
                            case 'country':
                                address.country = p.country;
                                break;
                            default:
                                break;
                        }
                        return {
                            address: address,
                            coordinates: r.geometry.coordinates
                        };
                    }));
                    self.loadingGeoResults(false);
                });
            } else {
                results([]);
            }
        };

        // Set up auto suggest fields:
        let suggestionFields = [
            'country',
            'state',
            'city'
        ];
        self.currentLocationValue.subscribe(newValue => {
            self.countrySelected(newValue.address.country ? newValue.address.country : null);
            self.stateSelected(newValue.address.state ? newValue.address.state : null);
            self.citySelected(newValue.address.city ? newValue.address.city : null);
            if (!newValue) self.coordinates(null);
        });
        
        self.suggestionsLoading = ko.observable(false);
        suggestionFields.forEach(type => {
            self[type+'Results'] = ko.observableArray([]);
            self[type+'Selected'] = ko.observable();
            self[type+'Selected'].subscribe(newValue => {
                if (newValue) self.locationOptions().push(`${type}=${newValue.replace(/\s+/g, '+').toLowerCase()}`);
                else self.locationOptions(self.locationOptions().filter(str => str.includes(type)));
            });

            self[type+'Input'] = ko.observable('');
            self[type+'Query'] = ko.computed(() => self[type+'Input']());
            self[type+'Query'].subscribe(newValue => { self.geoLookupQuery(newValue, self[type+'Results'], type) });
            self[type+'Query'].extend({rateLimit: 50});
            
            self[type+"resultsLoading"] = ko.observable(false);
            self[type+"resultsLoading"].subscribe(newValue => self.suggestionsLoading(newValue));
    
            self[type+'Params'] = {
                query: self[type+'Input'],
                results: self[type+'Results'],
                selected: self[type+'Selected'],
                value: self.currentLocationValue,
                type: type,
                status: self[type+"resultsLoading"]
            };
        });

        // Loading state:
        self.loadingRandom = ko.observable(false);
        self.isLoading = ko.computed(() => {
            if (self.months().length !== 12) return true;
            if (!self.suggestionFieldsReady()) return true;
            if (self.loadingTZ()) return true;
            if (self.loadingGeoResults()) return true;
            if (self.suggestionsLoading()) return true;
            if (self.loadingRandom()) return true;
            return false;
        });
        self.isLoading.subscribe(newValue => {
            vm.isLoading(newValue);
        });

        //Debug:
        self.randomChart = function(){
            self.loadingRandom(true);
            document.querySelectorAll('select').forEach(node => {
                node.focus();
                node.blur();
            });
            let rInt = (min,max) => Math.floor(Math.random() * (max - min) + min);
            let setRand = (name) => {
                let max = self[name]().length;
                let min = 0
                let val = rInt(min, max);
                return name === "years" ? val + 1900 :
                        name === "months" || name === "hours" ? val + 1 : val;
            }
            self.month(setRand("months"));
            self.day(setRand("days"));
            self.year(setRand("years"));
            self.hour(setRand("hours"));
            self.minute(setRand("minutes"));
            self.pmOffset(rInt(0,2)*12);
            self.setRawDate();
            self.UTCdate(new Date(self.rawDate()));
            self.calculateChart();
        }
    }
});

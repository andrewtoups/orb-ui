define(['ko'], function(ko){
    return function(params){
        let self = this;
        self.type = ko.observable(params.type);
        let a = params.address;

        self.city = ko.observable(a.city);
        self.state = ko.observable(a.state);
        self.country = ko.observable(a.country);
        self.county = ko.observable(a.county);
    };
});
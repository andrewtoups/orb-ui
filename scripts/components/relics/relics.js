define(['ko'], (ko) => {
    return function(){
        let self = this;

        self.ready = ko.observable(false);
        vm.modal.loadingComplete(false);
        params.closeCb(() => { self.ready(false) });
        self.ritePassed = ko.observable(false);
        self.sacredRite = ko.observable();
        self.sacredRite.subscribe(nv => {
            if (nv.length > 3) {
                try {
                    paypal.validateClergy(nv)
                    .then(response => {
                        if (response.status === 200) self.ritePassed(true)
                        else self.ritePassed(false);
                    });
                } catch {

                }
            }
        });
        
        self.ready.subscribe(nv => {
            vm.modal.modalLoading(!nv);
            if (nv) { vm.modal.loadingComplete(true); }
            console.log("paypal ready");
        });

        self.name = ko.observable();
        self.line1 = ko.observable();
        self.line2 = ko.observable("");
        self.city = ko.observable();
        self.state = ko.observable();
        self.stateCodes = ko.observableArray(paypal.stateCodes);
        self.zip = ko.observable();
        self.comments = ko.observable();

        self.valid = ko.computed(() => {
            return !!self.name() && !!self.line1() && !!self.city() && !!self.state() && !!self.zip();
        });

        self.addressStr = ko.computed(() => {
            return `${self.line1()}${self.line2() ? self.line2() : ` `}${self.city()}, ${self.state()} ${self.zip()}`;
        });

        self.address = ko.computed(() => {
            if (self.valid()) {
                let address = {};
                ['line1', 'line2', 'city', 'state', 'zip'].forEach(field => {
                    if (field) address[field] = self[field]()
                });
                address.country_code = "US";
                return address;
            }
        });

        self.ppAddress = ko.computed(() => {
            if (self.address()) {
                return {
                    address_line_1: self.address().line1,
                    address_line_2: self.address().line2,
                    admin_area_1: self.address().state,
                    admin_area_2: self.address().city,
                    postal_code: self.address().zip,
                    country_code: "US"
                };
            }
        })
        
        self.saveOrderData = () => {
            self.requestSent(true);
            let body = {
                orderName: self.name(),
                address: self.address(),
                natalChart: vm.poem.birthChart,
                birthInfo: `${vm.poem.birthDay()} ${vm.natalForm.rawDate()}`,
                poem: vm.poem.lines().map(i => i.line),
                comments: self.comments()
            };
            paypal.saveOrderData(body)
            .then(response => {
                console.log("response is:", response);
                vm.printScreenshot(`${api.hostName()}/prints/${response}.png`);
            });
        };

        self.ritePassed.subscribe(nv => {
            vm.modal.modalLoading(true);
            paypal.createButton({
                onApprove: self.saveOrderData,
                state: self.ready,
                address: self.ppAddress,
                name: self.name
            });           
        });

    }
});

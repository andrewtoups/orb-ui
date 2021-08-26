define(['ko', 'paypal', 'api'], (ko, paypal, api) => {
    return function(params){
        let self = this;

        self.buying = ko.observable(false);
        self.initiateOrder = () => { self.buying(true) };
        self.cancelOrder = () => { self.buying(false) };

        self.name = ko.observable("");
        self.email = ko.observable("");
        self.includePlacements = ko.observable();

        self.line1 = ko.observable("");
        self.line2 = ko.observable("");
        self.deliveryNotes = ko.observable("");
        self.city = ko.observable("");
        self.state = ko.observable("");
        self.stateCodes = ko.observableArray(paypal.stateCodes);
        self.zip = ko.observable("");
        self.comments = ko.observable("");

        self.rejectedAddress  = ko.observable({line1: "", line2: "", city: "", state: "", zip: ""});
        self.line1Placeholder = ko.computed(() => self.rejectedAddress().line1 || "Street Address");
        self.line2Placeholder = ko.computed(() => self.rejectedAddress().line2 || "Apt/Suite");
        self.cityPlaceholder  = ko.computed(() => self.rejectedAddress().city  || "City");
        self.statePlaceholder = ko.computed(() => self.rejectedAddress().state || "State");
        self.zipPlaceholder   = ko.computed(() => self.rejectedAddress().zip   || "Postal Code");
        self.unsetRejected = (d, e) => {
            const val = e.target.value;
            const field = e.target.id.replace("street-address-","");
            const p = field+"Placeholder";
            const hasRejected = self.rejectedAddress()[field].length;
            const changed = val !== self[p]();
            if (hasRejected && changed) self[p]("");
        };        

        self.valid = ko.computed(() => {
            return !!self.line1() && !!self.city() && !!self.state() && !!self.zip();
        });
        self.verified = ko.observable(false);
        self.verificationFailed = ko.observable(false);
        self.correctionDenied = ko.observable(false);
        self.readyToPay = ko.computed(() => {
            return  !!self.name() &&
                    !!self.email() &&
                    !!self.includePlacements() &&
                    self.valid() &&
                    self.verified() || self.verificationFailed()
        });

        self.addressStr = a => {
            if (a.line1 && a.city && a.state && a.zip) return `${a.line1}${a.line2 ? ` ${a.line2}` : ``} ${a.city}, ${a.state} ${a.zip}`;
            else return "";
        };

        self.address = ko.computed(() => {
            if (self.valid()) {
                let address = {};
                ['line1', 'line2', 'city', 'state', 'zip'].forEach(field => {
                    address[field] = self[field]()
                });
                return address;
            } else return "";
        });
        self.validationErrors = ko.observableArray();
        self.addressNotDeliverable = ko.observable(false);
        self.validationWarning = ko.observable(false);
        self.validating = ko.observable(false);
        self.applyingValidation = ko.observable(false);
        self.validatedAddress = ko.observable();

        const sanitize = s => s.toLowerCase().replace(".","");
        self.address.subscribe(nv => {
            if (self.valid() && !self.applyingValidation()) {
                self.verified(false);
                self.correctionDenied(false);
                self.validating(true);
                paypal.validateAddress(nv)
                .then(d => {
                    if (!d.deliverable) {
                        self.addressNotDeliverable(true);
                        if (d.errors) self.validationErrors(d.errors);
                    } else if (d.address && d.addressComplete) {
                        self.validatedAddress(d.address);
                        let diff = false;
                        for (i in nv) {
                            if (sanitize(nv[i]) !== sanitize(d.address[i])) diff = true;
                        }
                        if (diff && d.modified) {
                            self.validationWarning(true);
                        } else {
                            self.applyValidation();
                        }
                    } else {
                        self.verificationFailed(true);
                    }
                    self.validating(false);
                }, e => { self.verificationFailed(true) });
            }
        });
        self.applyValidation = () => {
            self.applyingValidation(true);
            self.rejectedAddress({line1: "", line2: "", city: "", state: "", zip: ""});
            const a = self.validatedAddress();
            self.line1(a.line1);
            self.line2(a.line2 || "");
            self.city(a.city);
            self.state(a.state);
            self.zip(a.zip+"-"+a.zipExt);
            self.verified(true);
            self.applyingValidation(false);
            if (self.validationWarning()) self.validationWarning(false);
        };
        self.dismissValidation = () => {
            self.validationWarning(false);
            self.verificationFailed(true);
            self.correctionDenied(true);
        };
        self.dismissError = () => {
            self.addressNotDeliverable(false);
            self.rejectedAddress(self.address());
            self.line1(""); self.line2(""); self.city(""); self.state(""); self.zip("");
        };

        self.ppAddress = ko.computed(() => {
            if (self.address()) {
                return {
                    address_line_1: self.address().line1,
                    address_line_2: self.address().line2,
                    admin_area_1:   self.address().state,
                    admin_area_2:   self.address().city,
                    postal_code:    self.address().zip,
                    country_code:   "US"
                };
            }
        });
        
        self.showMiniModal = ko.computed(() => self.addressNotDeliverable() || self.validationWarning() );
        self.mmContent = ko.observable(false);
        self.showMiniModal.subscribe(nv => {
            if (nv) {
                self.validationWarning() && self.mmContent("validationWarning");                
                self.addressNotDeliverable() && self.mmContent("notDeliverable");
            }
        })
        self.mmTransitioning = ko.observable(false);

        self.orderComplete = ko.observable(false);
        self.saveOrderData = data => {
            let body = {
                orderName:          self.name(),
                orderEmail:         self.email(),
                includePlacements:  self.includePlacements() === 'true',
                address:            self.addressStr(self.address()),
                correctionDenied:   self.correctionDenied(),
                validatedAddress:   self.addressStr(self.validatedAddress()),
                deliveryNotes:      self.deliveryNotes(),
                natalChart:         vm.poem.birthChart,
                birthInfo:          `${vm.natalForm.rawDate().toLocaleString()} ${vm.natalForm.locationSummary()}`,
                poem:               vm.poem.lines().map(i => i.line),
                comments:           self.comments(),
                paypalName:         `${data.payer.name.given_name} ${data.payer.name.surname}`,
                paypalOrderId:      data.id,
                paypalPayerId:      data.payer.payer_id,
                paypalEmail:        data.payer.email_address
            };
            paypal.saveOrderData(body)
            .then(response => {
                self.orderComplete(true);
                setTimeout(() => {document.querySelector('.x').click()}, 2500);
            });
        };

        paypal.createButton({
            onApprove: self.saveOrderData,
            state: self.ready,
            address: self.ppAddress,
            name: self.name
        });
    }
});

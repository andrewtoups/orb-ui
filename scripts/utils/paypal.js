define(['api'], api => {
    const sandbox_client_id = 'AelbqPdJ0y4EVqub7mTRrUXgxohk7S1pI4CS4FH6kVYQtCefij6mp1yg0FlQGLIg2thkk9ohLLQwpmjw';
    const client_id = 'AUOOZZESnKSLVFRDafVAl24ZJsP2cRSnHZuCWTQGN7fHcq0Qf94rm6V2Urx7-CbdJOOR58mMMMQ7NZYg';
    return {
        validateClergy: (str) => {
            return fetch(`${api.hostName()}/validateClergy/${str}`);
        },

        stateCodes: [
            { "label": "Alabama", "value": "AL" }, { "label": "Alaska", "value": "AK" },
            { "label": "Arizona", "value": "AZ" }, { "label": "Arkansas", "value": "AR" },
            { "label": "California", "value": "CA" },{ "label": "Colorado", "value": "CO" },
            { "label": "Connecticut", "value": "CT" }, { "label": "Delaware", "value": "DE" },
            { "label": "District of Columbia", "value": "DC" }, { "label": "Florida", "value": "FL" },
            { "label": "Georgia", "value": "GA" }, { "label": "Hawaii", "value": "HI" },
            { "label": "Idaho", "value": "ID" }, { "label": "Illinois", "value": "IL" },
            { "label": "Indiana", "value": "IN" }, { "label": "Iowa", "value": "IA" },
            { "label": "Kansas", "value": "KS" }, { "label": "Kentucky", "value": "KY" },
            { "label": "Louisiana", "value": "LA" }, { "label": "Maine", "value": "ME" },
            { "label": "Maryland", "value": "MD" }, { "label": "Massachusetts", "value": "MA" },
            { "label": "Michigan", "value": "MI" }, { "label": "Minnesota", "value": "MN" },
            { "label": "Mississippi", "value": "MS" }, { "label": "Missouri", "value": "MO" },
            { "label": "Montana", "value": "MT" }, { "label": "Nebraska", "value": "NE" },
            { "label": "Nevada", "value": "NV" }, { "label": "New Hampshire", "value": "NH" },
            { "label": "New Jersey", "value": "NJ" }, { "label": "New Mexico", "value": "NM" },
            { "label": "New York", "value": "NY" }, { "label": "North Carolina", "value": "NC" },
            { "label": "North Dakota", "value": "ND" }, { "label": "Ohio", "value": "OH" },
            { "label": "Oklahoma", "value": "OK" }, { "label": "Oregon", "value": "OR" },
            { "label": "Pennsylvania", "value": "PA" }, { "label": "Rhode Island", "value": "RI" },
            { "label": "South Carolina", "value": "SC" }, { "label": "South Dakota", "value": "SD" },
            { "label": "Tennessee", "value": "TN" }, { "label": "Texas", "value": "TX" },
            { "label": "Utah", "value": "UT" }, { "label": "Vermont", "value": "VT" },
            { "label": "Virginia", "value": "VA" }, { "label": "Washington", "value": "WA" },
            { "label": "West Virginia", "value": "WV" }, { "label": "Wisconsin", "value": "WI" },
            { "label": "Wyoming", "value": "WY" }, { "label": "American Samoa", "value": "AS" },
            { "label": "Guam", "value": "GU" }, { "label": "Northern Mariana Islands", "value": "MP" },
            { "label": "Puerto Rico", "value": "PR" }, { "label": "U.S. Virgin Islands", "value": "VI" },
            { "label": "Micronesia", "value": "FM" }, { "label": "Marshall Islands", "value": "MH" },
            { "label": "Palau", "value": "PW" }, { "label": "U.S. Armed Forces – Americas", "value": "AA" },
            { "label": "U.S. Armed Forces – Europe", "value": "AE" }, { "label": "U.S. Armed Forces – Pacific", "value": "AP" }
        ],

        createButton: (config) => {
            const paypalScript = `https://www.paypal.com/sdk/js?client-id=${client_id}&currency=USD`;
            const head = document.querySelector('head');
            let script = document.createElement('script');
            script.type = 'text/javascript';

            script.onload = () => {
                paypal.Buttons({
                    // Sets up the transaction when a payment button is clicked
                    createOrder: function(data, actions) {
                        config.inPaypal(true);
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    value: '20.00'
                                },
                                shipping: {
                                    type: "SHIPPING",
                                    name: {full_name: config.name()},
                                    address: config.address()
                                }
                            }],
                            application_context: {
                                shipping_preference: 'SET_PROVIDED_ADDRESS',
                                brand_name: "Orb.Church",
                                user_action: "PAY_NOW"
                            }
                        });
                    },

                    onCancel: function(data) {
                        config.inPaypal(false);
                    },

                    // Finalize the transaction after payer approval
                    onApprove: function(data, actions) {
                        return actions.order.capture().then(function(orderData) {
                            config.onApprove && config.onApprove(orderData);
                            var transaction = orderData.purchase_units[0].payments.captures[0];
                        });
                    }
                }).render('#paypal-button-container'); 
                config.state && config.state(!config.state());
            };

            script.src = paypalScript;
            head.appendChild(script);
        },

        saveOrderData: (params) => {
            const modes = {
                print: true
            };
            let paramObj = api.getChartParams(params.natalChart, modes);
            params.chartParams = new URLSearchParams(paramObj).toString();
            return fetch(`${api.hostName()}/saveOrderData`,
            {
                method: 'POST',
                mode: 'cors',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(params)
            })
            .then(response => response.text());
        },

        validateAddress: (address) => {
            return fetch(`${api.hostName()}/validateAddress`, {
                method: 'POST',
                mode: 'cors',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(address)
            }).then(response => response.text())
            .then(data => {
                let parser = new DOMParser();
                let xml = parser.parseFromString(data, "application/xml");
                const tags = {"Address2": "line1", "Address1": "line2", "City": "city", "State": "state", "Zip5": "zip", "Zip4": "zipExt"};
                const a = xml.querySelector('Address');

                const address = {};
                for (t in tags) {
                    address[tags[t]] = a.querySelector(t) ? a.querySelector(t).textContent : "";
                }
                const addressComplete = ["line1", "city", "state", "zip"].every(i => address[i].length);
                const deliverableCodes = ["Y","D","S"];
                const DPV = a.querySelector('DPVConfirmation');
                const deliverable = DPV ? deliverableCodes.includes(DPV.textContent) : false;

                const footNoteStr = a.querySelector("Footnotes") ? a.querySelector("Footnotes").textContent : "";
                const codes = footNoteStr.includes("LI") ? footNoteStr.replace("LI","").split("").push("LI").sort() : footNoteStr.split("");

                const errors = USPSErrorCodes.filter(c => codes.includes(c)).map(c => USPSNotes[c]);
                const notes = codes.filter(c => !USPSErrorCodes.includes(c)).map(c => USPSNotes[c]);

                if (a.querySelector("Error")) {
                    a.querySelectorAll("Error").forEach(el => {
                        if (el.querySelector("Description") && el.querySelector("Description").textContent) {
                            errors.push(el.querySelector("Description").textContent);
                        }
                    });
                }

                const modified = codes.some(c => USPSModificiationCodes.includes(c));

                return {
                    address:         address,
                    addressComplete: addressComplete,
                    deliverable:     deliverable,
                    errors:          errors,
                    notes:           notes,
                    modified:        modified
                };
            });
        }
    };
});

const USPSErrorCodes =         ["C", "F", "H", "I", "J", "R", "S", "T", "V", "W"];
const USPSModificiationCodes = ["A", "B", "L", "M", "N"];
const USPSNotes = {
    A:  "Zip Code Corrected",
    B:  "City / State Spelling Corrected",
    C:  "Invalid City / State / Zip",
    D:  "No ZIP+4 Assigned",
    E:  "Zip Code Assigned for Multiple Response",
    F:  "Address could not be found in the National Directory File Database",
    G:  "Information in Firm Line used for matching",
    H:  "Missing Secondary Number",
    I:  "Insufficient / Incorrect Address Data",
    J:  "Dual Address",
    K:  "Multiple Response due to Cardinal Rule",
    L:  "Address component changed",
    LI: "Match has been converted via LACS",
    M:  "Street Name changed",
    N:  "Address Standardized",
    O:  "Lowest +4 Tie-Breaker",
    P:  "Better address exists",
    Q:  "Unique Zip Code match",
    R:  "No match due to EWS",
    S:  "Incorrect Secondary Address",
    T:  "Multiple response due to Magnet Street Syndrome",
    U:  "Unofficial Post Office name",
    V:  "Unverifiable City / State",
    W:  "Invalid Delivery Address",
    X:  "No match due to out of range alias",
    Y:  "Military match",
    Z:  "Match made using the ZIPMOVE product data"
};

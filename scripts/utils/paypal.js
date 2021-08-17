define(['api'], api => {
    const client_id = 'AelbqPdJ0y4EVqub7mTRrUXgxohk7S1pI4CS4FH6kVYQtCefij6mp1yg0FlQGLIg2thkk9ohLLQwpmjw';
    const client_se = 'EIfBreGqJBaOM58gk2FCMp1ObG42aYeG-06Cs4I_6IfRBfkUNZD_Vwgp91h2OLMUErQLufHsiNGfWenz';    
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
                        config.createOrder && config.createOrder();
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    value: '15.00'
                                },
                                shipping: {
                                    type: "SHIPPING",
                                    name: {full_name: config.name()},
                                    address: config.address()
                                }
                            }],
                            application_context: {
                                shipping_preference: 'SET_PROVIDED_ADDRESS',
                                // shipping_preference: 'NO_SHIPPING',
                                brand_name: "Orb.Church",
                                user_action: "PAY_NOW"
                            }
                        });
                    },

                    // Finalize the transaction after payer approval
                    onApprove: function(data, actions) {
                        return actions.order.capture().then(function(orderData) {
                            config.onApprove && config.onApprove();
                            // Successful capture! For dev/demo purposes:
                            console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
                            var transaction = orderData.purchase_units[0].payments.captures[0];

                            // When ready to go live, remove the alert and show a success message within this page. For example:
                            // var element = document.getElementById('paypal-button-container');
                            // element.innerHTML = '';
                            // element.innerHTML = '<h3>Thank you for your payment!</h3>';
                            // Or go to another URL:  actions.redirect('thank_you.html');
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
                print: true,
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
        }

    };
});

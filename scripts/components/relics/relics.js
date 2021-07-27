define(['ko'], (ko) => {
    return function(){
        let self = this;
        let script = document.createElement('script');
        script.setAttribute("data-sdk-integration-source", "button-factory");
        script.onload = () => {
            console.log("script loaded");
            function initPayPalButton() {
                paypal.Buttons({
                    style: {
                        shape: 'rect',
                        color: 'white',
                        layout: 'vertical',
                        label: 'paypal',
                    },
        
                    createOrder: function(data, actions) {
                        return actions.order.create({
                        purchase_units: [{"description":"Broadside of your Orb Church poem (volume 1, copyright 2020)","amount":{"currency_code":"USD","value":15.99,"breakdown":{"item_total":{"currency_code":"USD","value":12},"shipping":{"currency_code":"USD","value":3},"tax_total":{"currency_code":"USD","value":0.99}}}}]
                        });
                    },
        
                    onApprove: function(data, actions) {
                        return actions.order.capture().then(function(details) {
                        alert('Transaction completed by ' + details.payer.name.given_name + '!');
                        });
                    },
        
                    onError: function(err) {
                        console.log(err);
                    }
                }).render('#paypal-button-container');
            }
            initPayPalButton();
            self.payPalLoaded(true);
        };
        script.src = "https://www.paypal.com/sdk/js?client-id=sb&currency=USD&disable-funding=credit";
        document.head.appendChild(script); 
    }
});

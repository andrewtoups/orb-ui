define(['ko', 'utils/mobileMsg'], (ko, mm) => {
    return function() {
        let self = this;
        const confettiCount = 200;
        const randItem = arr => arr[Math.floor(Math.random()*arr.length)];
        const randInt = val => Math.floor(Math.random()*val);
        const randRangeInt = (min, max) => Math.floor( (Math.random()*(max-min)) + min );
        const currency = ['$', '$', '$', '$', '$', '$', '$', '$', '$', '$', '$', '¢', '¢', '¢', '¢', '¢', '¢', '¢', '£', '¥', '€', '₽', '₿'];

        self.vBound = ko.observable();
        self.hBound = ko.observable();
        self.getBounds = () => {
            let container = document.querySelector('.confetti-container');
            document.documentElement.style.setProperty('--b-pos', Math.ceil(container.clientHeight) + 25 + 'px');
            self.hBound(container.clientWidth - 25);
        };
        window.addEventListener('resize', e => {
            self.getBounds();
        });

        let Confetti = function(index){
            this.currency = randItem(currency);
            this.cssClass = `currency-${index}`;
            this.confettiClass = () => this.cssClass;
            this.element = () => document.querySelector(`.${this.cssClass}`);
            this.styleVars = {
                '--s-pos': ko.observable(),
                '--e-pos': ko.observable(),
                '--angle': ko.observable(),
                '--delay': randInt(index*confettiCount/2)+'ms',
                '--duration': randRangeInt(1000,3000)+'ms'
            };
            this.active = ko.observable(false);
            this.randomize = () => {
                let start = randInt(self.hBound())+"px", end = randInt(self.hBound()*2)-(self.hBound()/2) +"px", angle = randInt(360)+"deg";
                this.styleVars['--s-pos'](start);
                this.styleVars['--e-pos'](end);
                this.styleVars['--angle'](angle);
                this.active(false);
                setTimeout(() => { this.active(true)}, 0);
                // Why is this above necessary? bc safari lol:
                // https://stackoverflow.com/questions/63158463/safari-ignoring-inline-styles-for-keyframe-animations
            };
            this.initialize = () => {
                this.active(true);
                this.element().addEventListener('animationiteration', this.randomize);
                this.randomize();
            };
        };

        self.confettis = ko.observableArray([]);
        for (let i = 1; i <= confettiCount; i++) {
            self.confettis.push(new Confetti(i));
        }
        self.initializeConfetti = () => {
            self.getBounds();   
            self.confettis().forEach(c => { c.initialize() });
            setTimeout(() => {window.open('https://paypal.com', '_blank')}, 3000);
        };
    }
});

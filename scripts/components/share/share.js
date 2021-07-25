define(["ko"], ko => {
    return function(params){
        let self = this;
        self.showPlacements = ko.observable(false);
        self.href = ko.computed(() =>  self.showPlacements() ? vm.screenshotPlacementsURI() : vm.screenshotURI() );
        let path = "/styles/png/";
        self.btnCls = ko.computed(() => vm.pointerMode() === "touch" ? "long-press" : "save-btn");
        self.btnEnabled = ko.computed(() => self.btnCls() !== "touch");

        let Minister = function(p) {
            this.name = p.name || null;
            this.bio = p.bio || null;
            this.link = `http://${p.link}` || null;
            this.pic = p.pic || '/styles/svg/eye-of-providence.svg';
            this.birthData = p.birthData || null;
            this.showPoem = birthData => {
                vm.closeModal();
                vm.hidePoem(true);
                vm.poemDataReady(false);
                vm.natalFormReady(false);
                vm.loadPage('natalForm', birthData);
            };
        };
        this.clergy = [
            new Minister({
                name: '2psy',
                bio: `<p>Just another thembo.</p>
                <p>It really grinds my gears when programmers call themselves a <em>code monkey</em>.</p>
                <p>I'm neither particularly dignified nor piteous. I'm just a person who writes code. Sheesh.</p>
                <p>I do make memes though. I guess that part is piteous. I still wouldn't call myself a <em>meme monkey</em> though.</p>`,
                link: 'www.instagram.com/andonuts',
                birthData: {
                    date: {
                        month: 1, day: 5, year: 1983,
                        hour: 3, minute: 15, pmOffset: 12
                    },
                    city: 'Opelousas, LA'
                }
            }),
            new Minister({
                name: 'Dylan Krieger',
                bio: `<p>Only the prettiest them in the whole world.</p>
                <p>Also the world's <em>best</em> poet.</p>
                <p>Words cannot say how much I love her</p>
                <p>She has a <em>wikipedia article</em>.</p>
                <p>This site would be nothing without her.</p>`,
                link: 'dylankrieger.com',
                birthData: {
                    date: {
                        month: 3, day: 6, year: 1990,
                        hour: 5, minute: 16, pmOffset: 12
                    },
                    city: 'South Bend, IN'
                }
            }),
            new Minister({
                name: 'Chris Payne',
                bio: `<p>Artist and designer.</p>
                <p>Sweet cancer bb.</p>
                <p>Do not cross him.</p>`,
                link: 'saltedteeth.com',
                birthData: {
                    date: {
                        month: 7, day: 11, year: 1985,
                        hour: 10, minute: 44, pmOffset: 12
                    },
                    city: 'Lodi, CA'
                }
            })
        ];
    }
})

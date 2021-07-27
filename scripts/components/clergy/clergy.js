define(['ko', 'api', 'utils/noOrphans'], (ko, api) => {
    return function() {
        let self = this;
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
                name: 'Dylan Krieger',
                bio: `<p>Dylan Krieger is the poet and High Priestess of The Orb.</p>
                <p>She is death rattle sun, crybaby moon, and brain-in-a-vat rising.</p>
                <p>Author of six books of poetry, including NYT-lauded <em>Giving Godhead</em> (Delete, 2017), she can be found at <a href="https://dylankrieger.com">dylankrieger.com</a>.</p>`,
                link: 'dylankrieger.com',
                pic: '/styles/jpg/dylan-krieger.jpg',
                birthData: {
                    date: {
                        month: 3, day: 6, year: 1990,
                        hour: 5, minute: 16, pmOffset: 12
                    },
                    city: 'South Bend Indiana'
                }
            }),
            new Minister({
                name: 'Christopher Payne',
                bio: `<p>Christopher Payne is the designer and Magician of The Orb.</p>
                <p>He is tender wound sun, homesick moon, and humble guru rising.</p>
                <p>Co-founder of literary and visual arts magazine Fine Print, he has worked with Vegetarian Alcoholic Press, Tilted House Review and Birdcoat Quarterly.</p>
                <p>He can be found at <a href="https://saltedteeth.com">saltedteeth.com</a>.</p>`,
                link: 'saltedteeth.com',
                pic: '/styles/jpg/christopher-payne.jpg',
                birthData: {
                    date: {
                        month: 7, day: 11, year: 1985,
                        hour: 10, minute: 44, pmOffset: 12
                    },
                    city: 'Lodi California'
                }
            }),
            new Minister({
                name: 'Andrew Toups',
                bio: `<p>Andrew Toups is the developer and Supreme Hierophant of The Orb.</p>
                <p>He is obsolete god sun, style maven moon, and mischievous wit rising.</p>
                <p>A musician in Grammy-nominated band Feufollet, he is taking applications for new orbiters on his <a href="www.instagram.com/andonuts">instagram page</a>.</p>`,
                link: 'www.instagram.com/andonuts',
                pic: '/styles/jpg/2ps.jpg',
                birthData: {
                    date: {
                        month: 1, day: 5, year: 1983,
                        hour: 3, minute: 15, pmOffset: 12
                    },
                    city: 'Opelousas Louisiana'
                }
            })            
        ];
    };
});

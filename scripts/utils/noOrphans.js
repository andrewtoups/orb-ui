define(['ko'], ko => {
    return (function(){
        ko.bindingHandlers.noOrphans = {
            init: (element, valueAccessor) => {
                console.log("initializing no orphans");
                const eliminateOrphans = el => {
                    let textArr = el.innerHTML.split(/ (?=[^>]*(?:<|$))/);
                    console.log("textArr:",textArr);
                    let lastTwo = [];
                    let searching = true;
                    for (let i = textArr.length - 1; i >= 0; i--) {
                        let last = textArr[i];
                        if (!last.includes("<") && !last.includes("</")) {
                            console.log("popping from textArr");
                            lastTwo.push(`${textArr.pop()}`);
                            console.log("lastTwo:",lastTwo);
                            if (lastTwo.length === 2) i=0;
                        }
                    }
                    if (lastTwo.length === 2) textArr.push(`${lastTwo[1]}&nbsp${lastTwo[0]}`)
                    el.innerHTML = textArr.join(" ");
                };
                let tags = ko.unwrap(valueAccessor());
                if (!tags) {
                    eliminateOrphans(element);
                } else {
                    tags.forEach(tag => {
                        let elList = element.querySelectorAll(tag);
                        elList.forEach(el => { eliminateOrphans(el)});
                    });
                }
            }
        }
    })();
});

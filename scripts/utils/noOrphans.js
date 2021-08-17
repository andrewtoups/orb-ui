define(['ko'], ko => {
    return (function(){
        ko.bindingHandlers.noOrphans = {
            init: (element, valueAccessor) => {
                const eliminateOrphans = el => {
                    let textArr = el.innerHTML.trim().split(/ (?=[^>]*(?:<|$))/);
                    let lastTwo = [];
                    let searching = true;
                    for (let i = textArr.length - 1; i >= 0; i--) {
                        let last = textArr[i];
                        if (!last.includes("<") && !last.includes("</")) {
                            lastTwo.push(`${textArr.pop()}`);
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

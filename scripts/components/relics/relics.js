define(['ko', 'api'], (ko, api) => {
    return function(){
        let self = this;
        if (!vm.printScreenshot()) {
            api.screenshot(vm.poem.birthChart, {print: true})
            .then(data => {
                vm.printScreenshot(`${api.hostName()}/${data}/print.png`);
            });
        }
    }
});

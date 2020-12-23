var vm;
fetch('https://api.2psy.net/updatePoemData').then(response => response.text()).then(data => {console.log(data)});
DomReady.ready(function(){
    define(['ko', 'components/pager/pager'], function(ko, Pager){
        vm = new Pager();
        vm.ko = ko;

        ko.applyBindings(vm, document.querySelector('html'));
    });
});
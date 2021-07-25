var vm;
DomReady.ready(function(){
    define(['ko', 'components/pager/pager'], function(ko, Pager){
        vm = new Pager();
        vm.ko = ko;

        ko.applyBindings(vm, document.querySelector('html'));
    });
});

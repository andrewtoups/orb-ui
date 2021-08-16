requirejs.config({
    baseUrl: 'scripts',
    paths: {
        'ko': 'vendor/knockout',
        'text': 'vendor/text',
        'api': 'utils/api',
        'paypal': 'utils/paypal',
        'clean': 'utils/clean',
        'inputMode': 'utils/inputModeSwitcher',
        'optionsPlaceholder': 'utils/optionsPlaceholder',
        'transitionState': 'utils/transitionState'
    }
});

requirejs(['main']);

requirejs.config({
    baseUrl: '../scripts',
    paths: {
        'ko': 'vendor/knockout',
        'text': 'vendor/text',
        'api': 'utils/api',
        'transitionState': 'utils/transitionState'
    }
});

requirejs(['main']);

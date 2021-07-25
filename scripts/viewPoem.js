requirejs.config({
    baseUrl: '../scripts',
    paths: {
        'ko': 'vendor/knockout',
        'text': 'vendor/text',
        'api': 'api',
        'transitionState': 'utils/transitionState'
    }
});

requirejs(['main']);

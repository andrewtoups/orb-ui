requirejs.config({
    baseUrl: 'scripts',
    paths: {
        'ko': 'vendor/knockout',
        'text': 'vendor/text',
        'api': 'utils/api'
    }
});

requirejs(['main']);
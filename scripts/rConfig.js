requirejs.config({
    baseUrl: 'scripts',
    paths: {
        'ko': 'vendor/knockout',
        'text': 'vendor/text'
    }
});

requirejs(['main']);
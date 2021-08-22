const version = 0;
requirejs.config({
    baseUrl: '../scripts',
    paths: {
        'ko': 'vendor/knockout',
        'text': 'vendor/text',
        'api': 'utils/api',
        'transitionState': 'utils/transitionState'
    },
    urlArgs: "v=" +  version
});

requirejs(['main']);

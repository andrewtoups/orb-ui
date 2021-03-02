define([], () => {
    let hostName = () => {
        const name = window.location.hostname;
        const apiPort = 3000;
        if (['localhost', '0.0.0.0', '127.0.0.1'].includes(name)) {
            return `http://${name}:${apiPort}`;
        } else {
            return 'https://api.2psy.net';
        }
    };
    let poem = () => {
        return fetch(`${hostName()}/getData/poem`)
        .then(response => response.json());
    };
    let birthChart = (params) => {
        const d = params.date,      long = params.coordinates[0],       lat = params.coordinates[1];
        const route = `calculateChart/${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}/${d.getHours()}/${d.getMinutes()}/${long}/${lat}`;
        return fetch(`${hostName()}/${route}`)
            .then(response => response.json());
    };
    let api = {
        hostName: hostName,
        poem: poem,
        birthChart: birthChart
    };
    return api;
});

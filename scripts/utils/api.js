define([], () => {
    let hostName = () => {
        const name = window.location.hostname;
        const apiPort = 3000;
        if (['localhost', '0.0.0.0', '127.0.0.1'].includes(name)) {
            return `http://${name}:${apiPort}`;
        } else {
            return 'https://orb-api.2psy.net';
        }
    };
    let poem = () => {
        return fetch(`${hostName()}/getData/poem`)
        .then(response => response.json());
    };
    let updatePoemData = () => {
        return fetch(`${hostName()}/updatePoemData`)
        .then(response => response.text());
    };
    let months = () => {
	return fetch(`${hostName()}/getData/months`)
	.then(response => response.json());
    };
    let birthChart = (params) => {
        const d = params.date,      long = params.coordinates[0],       lat = params.coordinates[1];
	let hours = d.getHours() < 9 ? `0${d.getHours()}` : d.getHours();
	let minutes = d.getMinutes() < 9 ? `0${d.getMinutes()}` : d.getMinutes();
        const route = `calculateChart/${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}/${hours}/${minutes}/${long}/${lat}`;
        return fetch(`${hostName()}/${route}`)
            .then(response => response.json());
    };
    let screenshot = (params, placementsMode) => {
        const paramObj = {};
        for (p in params) {
            paramObj[`${p}Sign`] = params[p].sign;
            paramObj[`${p}Element`] = params[p].element;
        }
        if (placementsMode) paramObj.placements = true;
        const paramStr = new URLSearchParams(paramObj).toString();
        const route = `screenshot/?${paramStr}`;
        return fetch(`${hostName()}/${route}`)
            .then(response => response.text());
    };
    let api = {
        hostName: hostName,
        poem: poem,
        updatePoemData: updatePoemData,
	    months: months,
        birthChart: birthChart,
        screenshot: screenshot
    };
    return api;
});

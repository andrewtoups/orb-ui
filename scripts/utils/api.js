define([], () => {
    const hostName = () => {
        const name = window.location.hostname;
        const apiPort = 3000;
        if (['localhost', '0.0.0.0', '127.0.0.1'].includes(name)) {
            return `http://${name}:${apiPort}`;
        } else {
            return 'https://orb-api.2psy.net';
        }
    };
    const poem = () => {
        return fetch(`${hostName()}/getData/poem`)
        .then(response => response.json());
    };
    const updatePoemData = () => {
        return fetch(`${hostName()}/updatePoemData`)
        .then(response => response.text());
    };
    const months = () => {
        return fetch(`${hostName()}/getData/months`)
        .then(response => response.json());
    };
    const birthChart = (params) => {
        const d = params.date,      long = params.coordinates[0],       lat = params.coordinates[1];
        const route = `calculateChart/${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}/${d.getHours()}/${d.getMinutes()}/${long}/${lat}`;
        return fetch(`${hostName()}/${route}`)
            .then(response => response.json());
    };
    const getChartParams = (params, modes) => {
        const paramObj = {};
        for (p in params) {
            paramObj[`${p}Sign`] = params[p].sign;
            paramObj[`${p}Element`] = params[p].element;
        }
        for (mode in modes) paramObj[mode] = modes[mode];
        return paramObj;
    }
        const paramStr = new URLSearchParams(paramObj).toString();
        const route = `screenshot/?${paramStr}`;
        return fetch(`${hostName()}/${route}`)
            .then(response => response.text());
    };
    
    const api = {
        hostName: hostName,
        poem: poem,
        updatePoemData: updatePoemData,
	    months: months,
        birthChart: birthChart,
        screenshot: screenshot,
        getChartParams: getChartParams
    };
    return api;
});

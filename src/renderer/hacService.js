export function checkOnline({ url, user, password }) {
    return new Promise((res) => {
        const request = new XMLHttpRequest();
        request.open('GET', `${url}/platform/about`, true);
        request.timeout = 2000;
        request.setRequestHeader('Authorization', `Basic ${btoa(`${user}:${password}`)}`);
        request.setRequestHeader('Accept', 'application/json');
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    res(true);
                } else {
                    res(false);
                }
            }
        };
        request.onerror = () => res(false);
        request.send();
    });
}

export function getHacConfig({ url, user, password }) {
    return new Promise((res) => {
        const request = new XMLHttpRequest();
        request.open('GET', `${url}/platform/config`, true);
        request.setRequestHeader('Authorization', `Basic ${btoa(`${user}:${password}`)}`);
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(request.responseText, 'text/html');
                    const inputs = doc.querySelectorAll('tr[id] input');
                    // eslint-disable-next-line no-unused-vars

                    const result = [];
                    // eslint-disable-next-line no-plusplus
                    for (let i = 0; i < inputs.length; i++) {
                        result.push({ name: inputs[i].name, value: inputs[i].value });
                    }
                    res({ config: result });
                }
            }
        };
        request.send();
    });
}

export function changeProperty({ url, user, password, key, value, csrf }) {
    return new Promise((res) => {
        const request = new XMLHttpRequest();
        request.open('POST', `${url}/platform/config/configstore`, true);
        request.setRequestHeader('Authorization', `Basic ${btoa(`${user}:${password}`)}`);
        request.setRequestHeader('Accept', 'application/json');
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setRequestHeader('X-CSRF-TOKEN', csrf);
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    res(request.response);
                } else {
                    res(request.response);
                }
            }
        };
        request.send(`key=${key}&val=${value}`);
    });
}

export function getJobList({ url, user, password }) {
    return new Promise((res) => {
        const request = new XMLHttpRequest();
        request.open('GET', `${url}/monitoring/cronjobs/data`, true);
        request.setRequestHeader('Authorization', `Basic ${btoa(`${user}:${password}`)}`);
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    res(JSON.parse(request.responseText));
                }
            }
        };
        request.send();
    });
}

export function getLogList({ url, user, password }) {
    return new Promise((res) => {
        const request = new XMLHttpRequest();
        request.open('GET', `${url}/platform/support/data`, true);
        request.setRequestHeader('Authorization', `Basic ${btoa(`${user}:${password}`)}`);
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    res(JSON.parse(request.responseText));
                }
            }
        };
        request.send();
    });
}

export function prepareLogZip({ url, user, password, filePath, csrf }) {
    return new Promise((res) => {
        const request = new XMLHttpRequest();
        request.open('POST', `${url}/platform/support/zip`, true);
        request.setRequestHeader('Authorization', `Basic ${btoa(`${user}:${password}`)}`);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setRequestHeader('X-CSRF-TOKEN', csrf);
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    res(JSON.parse(request.responseText));
                }
            }
        };
        request.send(`files=${filePath}`);
    });
}

export function getCsrfToken({ url, user, password }) {
    return new Promise((res, rej) => {
        const request = new XMLHttpRequest();
        request.open('GET', `${url}`, true);
        request.setRequestHeader('Authorization', `Basic ${btoa(`${user}:${password}`)}`);
        request.timeout = 5000;
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(request.responseText, 'text/html');
                    const csrf = doc.querySelector('meta[name="_csrf"]').content;
                    res(csrf);
                }
            }
        };
        request.ontimeout = () => rej('CSRF token acquirement timeout error');
        request.send();
    });
}

export function downloadLogZip({ url, user, password, csrf }) {
    return new Promise((res) => {
        const request = new XMLHttpRequest();
        request.open('GET', `${url}/platform/support/zip/download`, true);
        request.setRequestHeader('Authorization', `Basic ${btoa(`${user}:${password}`)}`);
        request.setRequestHeader('X-CSRF-TOKEN', csrf);
        request.responseType = 'blob';
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    res(new Blob([request.response], { type: 'application/zip' }));
                }
            }
        };
        request.send();
    });
}

export function startUpdate({ url, user, password, csrf, payload }) {
    return new Promise((res) => {
        const request = new XMLHttpRequest();
        request.open('POST', `${url}/platform/init/execute`, true);
        request.setRequestHeader('Authorization', `Basic ${btoa(`${user}:${password}`)}`);
        request.setRequestHeader('X-CSRF-TOKEN', csrf);
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    res(true);
                }
            }
        };
        request.send(JSON.stringify(payload));
    });
}

export function executeFlexibleSearch({ url, user, password, csrf, payload }) {
    return new Promise((res) => {
        const request = new XMLHttpRequest();
        request.open('POST', `${url}/console/flexsearch/execute`, true);
        request.setRequestHeader('Authorization', `Basic ${btoa(`${user}:${password}`)}`);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setRequestHeader('X-CSRF-TOKEN', csrf);
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    res(JSON.parse(request.responseText));
                }
            }
        };
        const data = Object.keys(payload)
            .map(key => `${key}=${encodeURIComponent(payload[key])}`)
            .join('&');
        request.send(data);
    });
}

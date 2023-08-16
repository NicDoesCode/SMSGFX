window.addEventListener('load', () => {
    if (window.location !== window.parent.location) {
        document.querySelectorAll('[data-smsgfx-hide-when-iframe]').forEach((element) => {
            element.classList.add('visually-hidden');
        });
    }
});

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if (urlParams.has('smsgfxTheme')) {
    document.querySelector('html').setAttribute('data-bs-theme', urlParams.get('smsgfxTheme'));
}

export function loadConfigAsync() {
    const url = `../config/config.json?v=a${Math.round(Math.random() * 1000000)}`;
    return new Promise((resolve, reject) => {
        fetch(url).then((resp) => {
            if (resp.ok) {
                resp.text().then((text) => {
                    resolve(JSON.parse(text));
                }).catch(() => {
                    resolve({});
                });
            } else {
                resolve({});
            }
        }).catch(() => {
            resolve({});
        });
    });
}

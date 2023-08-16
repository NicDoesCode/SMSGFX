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

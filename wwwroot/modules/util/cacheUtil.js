export default class CacheUtil {

    /**
     * Gets the cache buster URL component.
     * @returns {string}
     */
    static getCacheBuster() {
        console.log(cacheBuster);
        if (typeof cacheBuster === 'undefined') {
            cacheBuster = null;
            const scriptTag = document.querySelector(`script[src*=${CSS.escape('/main.js?v=')}]`);
            if (scriptTag) {
                const query = scriptTag.getAttribute('src').split('?');
                if (query.length > 1) {
                    const param = new URLSearchParams(query[1]);
                    if (param.has('v')) {
                        cacheBuster = `?v=${encodeURIComponent(param.get('v'))}`;
                    }
                }
            }
        }
        console.log(cacheBuster);
        return cacheBuster;
    }

}

let cacheBuster;
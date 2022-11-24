export default class TemplateUtil {

    /**
     * Loads a URL into an element.
     * @param {string} url - URL to load.
     * @param {HTMLElement} element - Element to load the content into (note, element will be emptied).
     */
    static async loadURLIntoAsync(url, element) {

        let tempElement = document.createElement('div');
        let resp = await fetch(url);
        let content = await resp.text();
        tempElement.innerHTML = content;

        while (element.hasChildNodes()) {
            element.childNodes[0].remove();
        }

        tempElement.childNodes.forEach(n => {
            element.appendChild(n);
        });

    }

}
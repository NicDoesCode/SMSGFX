export default class Templating {


    static registerHelpers() {
        Templating.#registerAttrEscHelper();
    }

    static #registerAttrEscHelper() {
        Handlebars.registerHelper('attr_escape', function (value) {
            return ('' + value) /* Forces the conversion to string. */
                .replace(/\\/g, '\\\\') /* This MUST be the 1st replacement. */
                .replace(/\t/g, ' ') /* These 2 replacements protect whitespaces. */
                .replace(/\n/g, '')
                .replace(/\r/g, '')
                .replace(/\u00A0/g, '') /* Useful but not absolutely necessary. */
                // .replace(/&/g, '') /* These 5 replacements protect from HTML/XML. */
                .replace(/'/g, '')
                .replace(/"/g, '')
                .replace(/</g, '')
                .replace(/>/g, '');
        });
    }


}

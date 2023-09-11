/**
 * Provides a bunch of general utility functions.
 */
export default class GeneralUtil {


    /**
     * Generates a random string.
     * @param {number} length - Length of the string to generate.
     */
    static generateRandomString(length) {
        if (length < 0) throw new Error('Length must be greater than 0.');
        const result = [];
        for (let i = 0; i < length; i++) {
            result.push(Math.round(Math.random() * 15).toString(16));
        }
        return result.join('');
    }


    /**
     * Escapes a string to be safe to use as a HTML attribute value.
     * @param {string} value - Value to escape.
     * @param {{removeNewLines: boolean}} options - Options to control how the string is escaped.
     * @returns {string}
     */
    static escapeHtmlAttribute(value, options) {
        if (!value || typeof value !== 'string') {
            return '';
        } else {
            let result = ('' + value) /* Forces the conversion to string. */
                .replace(/\\/g, '\\\\') /* This MUST be the 1st replacement. */
                .replace(/\t/g, '  ') /* These 2 replacements protect whitespaces. */
                ;
            const removeNewLine = options?.removeNewLines ?? false;
            if (removeNewLine) {
                result = result
                    .replace(/\n/g, '')
                    .replace(/\r/g, '');
            }
            return result
                .replace(/\u00A0/g, '') /* Useful but not absolutely necessary. */
                // .replace(/&/g, '') /* These 5 replacements protect from HTML/XML. */
                .replace(/'/g, '')
                .replace(/"/g, '')
                .replace(/</g, '')
                .replace(/>/g, '');
        }
    }


}
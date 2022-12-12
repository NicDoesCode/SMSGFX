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

}
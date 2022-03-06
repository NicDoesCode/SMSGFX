export default class AssemblyUtility {

    /**
     * Reads the contents of a WLA-DX assembly string as a string of bytes. 
     * Supports .db, .dw, .dl, .dd.
     * @param {string} content WLA-DX assembly content containing the bytes.
     * @returns {string} String of hexadecimal characters.
     */
    static #readToHexString(content) {

        // Split the content into individual lines
        const contentLines = content.trim().toLowerCase().replace('\r', '').split('\n');

        // Concatenate the array into one big HEX string
        let hexString = '';
        contentLines.forEach(line => {

            line = line.trim().toLowerCase();
            if (/^\s*\.[d][blwd]\s+/.test(line)) {

                let dataLength = 0;
                if (line.startsWith('.db ')) dataLength = 2
                if (line.startsWith('.dw ')) dataLength = 4
                if (line.startsWith('.dl ')) dataLength = 6
                if (line.startsWith('.dd ')) dataLength = 8

                const byteStrings = line.split(/,| /).filter(value => value.trim().length > 0);
                byteStrings.forEach(byteString => {

                    let byteHex = null;
                    if (byteString.startsWith('$')) {
                        // Create HEX string
                        byteHex = parseInt(byteString.substring(1), 16).toString(16);
                    } else if (byteString.startsWith('%')) {
                        // Create BINARY string
                        byteHex = parseInt(byteString.substring(1), 2).toString(16);
                    } else if (/^[\d]+$/.test(byteString)) {
                        // Create numeric string
                        byteHex = parseInt(byteString).toString(16);
                    }

                    // Add HEX to the concatenated string
                    if (byteHex !== null) {
                        while (byteHex.length % dataLength !== 0) {
                            byteHex = '0' + byteHex;
                        }
                        hexString += byteHex;
                    }

                });

            }

        });

        return hexString;
    }

    /**
     * Reads the contents of a WLA-DX assembly string as a Uint8ClampedArray. 
     * Supports .db, .dw, .dl, .dd.
     * @param {string} content WLA-DX assembly content containing the bytes.
     * @returns {Uint8ClampedArray} Array containing the data.
     */
    static readAsUint8ClampedArray(content) {

        const hexContent = AssemblyUtility.#readToHexString(content);
        const result = new Uint8ClampedArray(hexContent.length / 2);
        for (let i = 0; i < result.length; i++) {
            result[i] = parseInt(hexContent.substring(i * 2, i * 2 + 2), 16);
        }
        return result;
    }

    /**
     * Reads the contents of a WLA-DX assembly string as a Uint8Array. 
     * Supports .db, .dw, .dl, .dd.
     * @param {string} content WLA-DX assembly content containing the bytes.
     * @returns {Uint8Array} Array containing the data.
     */
    static readAsUint8Array(content) {

        const hexContent = AssemblyUtility.#readToHexString(content);
        const result = new Uint8Array(hexContent.length / 2);
        for (let i = 0; i < result.length; i++) {
            result[i] = parseInt(hexContent.substring(i * 2, i * 2 + 2), 16);
        }
        return result;
    }

    /**
     * Reads the contents of a WLA-DX assembly string as a Uint16Array. 
     * Supports .db, .dw, .dl, .dd.
     * @param {string} content WLA-DX assembly content containing the bytes.
     * @returns {Uint16Array} Array containing the data.
     */
    static readAsUint16Array(content) {

        const hexContent = AssemblyUtility.#readToHexString(content);
        const result = new Uint16Array(hexContent.length / 4);
        for (let i = 0; i < result.length; i++) {
            result[i] = parseInt(hexContent.substring(i * 4, i * 4 + 4), 16);
        }
        return result;
    }

    /**
     * Reads the contents of a WLA-DX assembly string as a Uint32Array. 
     * Supports .db, .dw, .dl, .dd.
     * @param {string} content WLA-DX assembly content containing the bytes.
     * @returns {Uint32Array} Array containing the data.
     */
    static readAsUint32Array(content) {

        const hexContent = AssemblyUtility.#readToHexString(content);
        const result = new Uint32Array(hexContent.length / 8);
        for (let i = 0; i < result.length; i++) {
            result[i] = parseInt(hexContent.substring(i * 8, i * 8 + 8), 16);
        }
        return result;
    }

    /**
     * Reads the contents of a WLA-DX assembly string as an array of numbers. 
     * Supports .db, .dw, .dl, .dd.
     * @param {string} content WLA-DX assembly content containing the bytes.
     * @returns {Array<number>} Array containing the data.
     */
    static readAsArray(content) {

        /** @type {Array<number>} */
        const result = [];

        // Split the content into individual lines
        const contentLines = content.trim().toLowerCase().replace('\r', '').split('\n');
        contentLines.forEach(line => {

            // Split the line into individual items if it starts with .db, .dw, .dl, .dd
            if (/^\s*\.[d][blwd]\s+/.test(line)) {
                const byteStrings = line.split(/,| /).filter(value => value.trim().length > 0);
                byteStrings.forEach(byteString => {
                    if (byteString.startsWith('$')) {
                        // Add HEX string
                        result.push(parseInt(byteString.substring(1), 16));
                    } else if (byteString.startsWith('%')) {
                        // Add BINARY string
                        result.push(parseInt(byteString.substring(1), 2));

                    } else if (/^[\d]+$/.test(byteString)) {
                        // Add numeric string
                        result.push(parseInt(byteString));
                    }
                });
            }

        });

        return result;
    }

}
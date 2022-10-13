import PaletteList from "../paletteList.js";
import TileSetList from "../tileSetList.js";

export default class ProjectFile {

    constructor() {
    }

    /**
     * 
     * @param {TileSetList} tileSetList 
     * @param {PaletteList} paletteList 
     */
    static saveToFile(tileSetList, paletteList) {
        const theDate = new Date();
        const fileDate = moment(theDate).format('YYYY-MM-DD-HHmmss');
        const exportData = {
            info: `Exported at ${theDate.toISOString()}`,
            tiles: tileSetList.serialise(),
            palettes: paletteList.serialise()
        };
        const serialisedData = JSON.stringify(exportData, null, '  ');
        const file = new File([serialisedData], `smsgfx-${fileDate}.json`, {type: 'application/json'});
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smsgfx-${fileDate}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * 
     * @param {Blob} blob - The input file.
     */
    static async loadFromFile(blob) {
        const buf = await blob.arrayBuffer();
        const data = String.fromCharCode.apply(null, new Uint8Array(buf));
        const object = JSON.parse(data);
        return object;
    }

}
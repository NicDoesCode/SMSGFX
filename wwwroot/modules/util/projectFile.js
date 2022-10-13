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
            tiles: JSON.parse(tileSetList.serialise()),
            palettes: JSON.parse(paletteList.serialise())
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

}
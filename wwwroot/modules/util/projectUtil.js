import PaletteList from "../models/paletteList.js";
import PaletteJsonSerialiser from "../serialisers/paletteJsonSerialiser.js";
import TileSet from "../models/tileSet.js";
import TileSetJsonSerialiser from "../serialisers/tileSetJsonSerialiser.js";

export default class ProjectUtil {


    /**
     * Saves an export JSON file containing the tiles and palettes to the user's computer.
     * @param {TileSet} tileSet - The tile set to export.
     * @param {PaletteList} paletteList - List of palettes to export.
     */
    static saveToFile(tileSet, paletteList) {
        const theDate = new Date();
        const fileDate = moment(theDate).format('YYYY-MM-DD-HHmmss');
        
        const info = `Exported at ${theDate.toISOString()}`;
        const tiles = TileSetJsonSerialiser.serialise(tileSet);
        const palettes = PaletteJsonSerialiser.serialise(paletteList.getPalettes());
        const exportData = { info, tiles, palettes };

        const serialisedData = JSON.stringify(exportData, null, '  ');

        const file = new File([serialisedData], `smsgfx-${fileDate}.json`, { type: 'application/json' });
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
import TileSetBinarySerialiser from "../serialisers/tileSetBinarySerialiser.js";
import SmsggTileSetBinarySerialiser from "../serialisers/smsgg/smsggTileSetBinarySerialiser.js";
import GameBoyTileSetBinarySerialiser from "../serialisers/gameBoy/gameBoyTileSetBinarySerialiser.js";
import TileMapTileBinarySerialiser from "../serialisers/tileMapTileBinarySerialiser.js";
import MasterSystemTileMapTileBinarySerialiser from "../serialisers/smsgg/smsggTileMapTileBinarySerialiser.js";
import GameBoyTileMapTileBinarySerialiser from "../serialisers/gameBoy/gameBoyTileMapTileBinarySerialiser.js";
import TileMapBinarySerialiser from "../serialisers/tileMapBinarySerialiser.js";
import MasterSystemTileMapBinarySerialiser from "../serialisers/smsgg/smsggTileMapBinarySerialiser.js";
import GameBoyTileMapBinarySerialiser from "../serialisers/gameBoy/gameBoyTileMapBinarySerialiser.js";

export default class SerialisationUtil {


    /**
     * @param {string} systemType - System type to get the serialiser for.
     * @returns {typeof TileSetBinarySerialiser}
     */
    static getTileSetBinarySerialiser(systemType) {
        switch (systemType) {
            case 'gb':
                return GameBoyTileSetBinarySerialiser;
            case 'nes':
                // TODO 
                throw new Error('Not implemented!');
            case 'smsgg': default:
                return SmsggTileSetBinarySerialiser;
        }
    }

    /**
     * @param {string} systemType - System type to get the serialiser for.
     * @returns {typeof TileMapTileBinarySerialiser}
     */
    static getTileMapTileBinarySerialiser(systemType) {
        switch (systemType) {
            case 'gb':
                return GameBoyTileMapTileBinarySerialiser;
            case 'nes':
                // TODO 
                throw new Error('Not implemented!');
            case 'smsgg': default:
                return MasterSystemTileMapTileBinarySerialiser;
        }
    }

    /**
     * @param {string} systemType - System type to get the serialiser for.
     * @returns {typeof TileMapBinarySerialiser}
     */
    static getTileMapBinarySerialiser(systemType) {
        switch (systemType) {
            case 'gb':
                return GameBoyTileMapBinarySerialiser;
            case 'nes':
                // TODO 
                throw new Error('Not implemented!');
            case 'smsgg': default:
                return MasterSystemTileMapBinarySerialiser;
        }
    }


}

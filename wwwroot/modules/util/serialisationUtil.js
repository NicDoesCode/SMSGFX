import TileSetBinarySerialiser from "../serialisers/tileSetBinarySerialiser.js";
import SmsggTileSetBinarySerialiser from "../serialisers/smsgg/smsggTileSetBinarySerialiser.js";
import GameBoyTileSetBinarySerialiser from "../serialisers/gameBoy/gameBoyTileSetBinarySerialiser.js";
import NesTileSetBinarySerialiser from "../serialisers/nes/nesTileSetBinarySerialiser.js";
import TileMapTileBinarySerialiser from "../serialisers/tileMapTileBinarySerialiser.js";
import SmsggTileMapTileBinarySerialiser from "../serialisers/smsgg/smsggTileMapTileBinarySerialiser.js";
import GameBoyTileMapTileBinarySerialiser from "../serialisers/gameBoy/gameBoyTileMapTileBinarySerialiser.js";
import NesTileMapTileBinarySerialiser from "../serialisers/nes/nesTileMapTileBinarySerialiser.js";
import TileMapBinarySerialiser from "../serialisers/tileMapBinarySerialiser.js";
import SmsggTileMapBinarySerialiser from "../serialisers/smsgg/smsggTileMapBinarySerialiser.js";
import GameBoyTileMapBinarySerialiser from "../serialisers/gameBoy/gameBoyTileMapBinarySerialiser.js";
import NesTileMapBinarySerialiser from "../serialisers/nes/nesTileMapBinarySerialiser.js";
import TileAttributeBinarySerialiser from "../serialisers/tileAttributeBinarySerialiser.js";
import SmsggTileAttributeBinarySerialiser from "../serialisers/smsgg/smsggTileAttributeBinarySerialiser.js";
import GameBoyTileAttributeBinarySerialiser from "../serialisers/gameBoy/gameBoyTileAttributeBinarySerialiser.js";
import NesTileAttributeBinarySerialiser from "../serialisers/nes/nesTileAttributeBinarySerialiser.js";
import ProjectAssemblySerialiser from "../serialisers/projectAssemblySerialiser.js";
import SmsggAssemblySerialiser from "../serialisers/smsgg/smsggAssemblySerialiser.js";
import GameBoyAssemblySerialiser from "../serialisers/gameBoy/gameBoyAssemblySerialiser.js";
import NesAssemblySerialiser from "../serialisers/nes/nesAssemblySerialiser.js";

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
                return NesTileSetBinarySerialiser;
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
                return NesTileMapTileBinarySerialiser;
            case 'smsgg': default:
                return SmsggTileMapTileBinarySerialiser;
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
                return NesTileMapBinarySerialiser;
            case 'smsgg': default:
                return SmsggTileMapBinarySerialiser;
        }
    }

    /**
     * @param {string} systemType - System type to get the serialiser for.
     * @returns {typeof TileAttributeBinarySerialiser}
     */
    static getTileAttributeBinarySerialiser(systemType) {
        switch (systemType) {
            case 'gb':
                return GameBoyTileAttributeBinarySerialiser;
            case 'nes':
                return NesTileAttributeBinarySerialiser;
            case 'smsgg': default:
                return SmsggTileAttributeBinarySerialiser;
        }
    }

    /**
     * @param {string} systemType - System type to get the serialiser for.
     * @returns {typeof ProjectAssemblySerialiser}
     */
    static getProjectAssemblySerialiser(systemType) {
        switch (systemType) {
            case 'gb':
                return GameBoyAssemblySerialiser;
            case 'nes':
                return NesAssemblySerialiser;
            case 'smsgg': default:
                return SmsggAssemblySerialiser;
        }
    }


}

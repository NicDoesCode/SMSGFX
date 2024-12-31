'use strict';


const DIRECTION = Object.seal({
    'UP': 'UP',
    'DOWN': 'DOWN',
    'LEFT': 'LEFT',
    'RIGHT': 'RIGHT'
});


export default class Graph {


    #tileMatrix = [];
    #pathCoords = [];
    #width = 0;
    #height = 0;


    constructor() {
    }


    /**
     * @param {number} x 
     * @param {number} y 
     */
    setTile(x, y) {
        this.#tileMatrix[y][x] = 1;
        this.#pathCoords = [];
    }

    /**
     * @param {TileCoordinate[]} tileCoordinates 
     */
    setTiles(tileCoordinates) {
        if (Array.isArray(tileCoordinates)) {
            for (let tileCoordinate of tileCoordinates) {
                this.#tileMatrix[tileCoordinate.y][tileCoordinate.x] = 1;
            }
        }
        this.#pathCoords = [];
    }

    /**
     * @param {number} x 
     * @param {number} y 
     */
    clearTile(x, y) {
        this.#tileMatrix[y][x] = 0;
        this.#pathCoords = [];
    }

    /**
     * @param {TileCoordinate[]} tileCoordinates 
     */
    clearTiles(tileCoordinates) {
        if (Array.isArray(tileCoordinates)) {
            for (let tileCoordinate of tileCoordinates) {
                this.#tileMatrix[tileCoordinate.y][tileCoordinate.x] = 1;
            }
        }
        this.#pathCoords = [];
    }

    isSet(x, y) {
        return this.#tileMatrix[y][x] !== 0;
    }


    /**
     * @param {number} width 
     * @param {number} height 
     */
    reinitialiseMatrix(width, height) {
        const tileMatrix = new Array(height);
        for (let row = 0; row < height; row++) {
            const matrixRow = new Array(width);
            matrixRow.fill(0);
            tileMatrix[row] = matrixRow;
        }
        this.#tileMatrix = tileMatrix;
        this.#pathCoords = [];
        this.#width = width;
        this.#height = height;
    }

    clearMatrix() {
        for (let matrixRow of this.#tileMatrix) {
            matrixRow.fill(0);
        }
        this.#pathCoords = [];
    }


    #tracePath() {
        // Find first tile coord
        /** @type {TileCoordinate?} */
        const coord = null;
        for (let row = 0; row < this.#height; row++) {
            for (let col = 0; col < this.#width; col++) {
                if (this.isSet(col, row)) {
                    coord = { x: col, y: row };
                }
            }
        }

        // Now trace it
        /** @type {TileCoordinate} */
        const path = [];
        if (coord) {

            const thisCoord = { x: coord.x, y: coord.y };

            // Start from the highest tile above
            while (thisCoord.y > 0 && this.isSet(thisCoord.x, thisCoord.y)) {
                thisCoord.y--;
            }
            path.push({ x: thisCoord.x, y: thisCoord.y });

            const startCoord = { x: thisCoord.x, y: thisCoord.y };
            while (thisCoord.x !== startCoord.x && thisCoord.y !== startCoord.y) {

                const walkStartCoord = { x: thisCoord.x, y: thisCoord.y };

                // Walk right
                while (thisCoord.x < this.#width && this.isSet(thisCoord.x + 1, thisCoord.y)) {
                    thisCoord.x++;
                }
                // Walk down
                if (isSameCoord(thisCoord, walkStartCoord)) {
                    while (thisCoord.y < this.#height && this.isSet(thisCoord.x, thisCoord.y + 1)) {
                        thisCoord.y++;
                    }
                } else {

                }
                // Walk left
                if (isSameCoord(thisCoord, walkStartCoord)) {
                    while (thisCoord.y < this.#height && this.isSet(thisCoord.x, thisCoord.y + 1)) {
                        thisCoord.y++;
                    }
                }

            }



            const lastCoord = { x: coord.x, y: coord.y };

            // Move right

            // Check above

            // Check right

            // Check down

            // Check left

            if (coord.x < this.#width) {

            }
        }
    }


}


/**
 * @param {TileCoordinate} a 
 * @param {TileCoordinate} b 
 */
function isSameCoord(a, b) {
    return a.x === b.x && a.y === b.y;
}


/**
 * @typedef {Object} TileCoordinate
 * @property {number} x
 * @property {number} y
 */
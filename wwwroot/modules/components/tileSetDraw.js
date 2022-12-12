export default class TileSetDraw {


    fn(tileSet, brushSize) {

        updatedTiles();

        const size = instanceState.pencilSize;
        if (size === 1) {
            tileSet.setPixelAt(imageX, imageY, colourIndex);
            updatedTiles.push(tileSet.getTileIndexByCoordinate(imageX, imageY));
        } else {
            const startX = imageX - Math.floor(size / 2);
            const startY = imageY - Math.floor(size / 2);
            const endX = imageX + Math.ceil(size / 2);
            const endY = imageY + Math.ceil(size / 2);
            for (let yPx = startY; yPx < endY; yPx++) {
                const xLeft = (size > 3 && (yPx === startY || yPx === endY - 1)) ? startX + 1 : startX;
                const xRight = (size > 3 && (yPx === startY || yPx === endY - 1)) ? endX - 1 : endX;
                for (let xPx = xLeft; xPx < xRight; xPx++) {
                    tileSet.setPixelAt(xPx, yPx, colourIndex);
                    const tileIndex = tileSet.getTileIndexByCoordinate(imageX, imageY);
                    if (!updatedTiles.includes(tileIndex)) updatedTiles.push(tileIndex);
                }
            }
        }

    }

}
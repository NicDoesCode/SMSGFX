# Tile editor

## Working with the tile editor
The tile editor is where you create and manage the tile library that's used in your game. 

### About tiles
Tiles are the fundamental building blocks for graphics on the Sega Master System and Game Gear. A tile is an 8x8 block of pixels. 

### How tiles work with palettes
Rather than store a specific colour, each pixel within a tile instead stores a reference to a specific palette slot number.

In essence you're painting by numbers, you can change what those numbers mean, without needing to change your tile.

For example; if you choose pallette colour #4 for a  particular pixel, and in the current palette colour #4 is red, if you were to swap palettes, and now colour #4 in the new palette referrs to green, now that same pixel will render as green instead of red.

### Working with the viewport (zoom, grid, moving around etc)
The viewport area contains a graphical preview of the tiles within your tile set and is the area where you can modify the tiles.

#### Zoom
Use the zoom function to change the scale of display for your tiles. The higher the scale, the easier it is to draw onto tiles. The lower the scale, the better it is to evaluate your work as a whole.

#### Grid
There are two types of grid; the 'pixel grid' and the 'tile grid'.

When the pixel grid is activated, a box is drawn around each pixel of the tiles in your tile set.

When the tile gris is activated, a box is drawn around each tile (8x8 pixel block) in your tile set.

#### Moving the viewport
Its likely that the zoom level that you're working with will result in parts of your tile set being displayed outside the screen. 

You can navigate around your graphic by:
* Using the scrollbars in the viewport.
* Using the mouse wheel.
* By clicking and dragging with the middle mouse button.

#### Tile width
The tile width refers to the maximum amount of tiles that are shown per line in the viewport.

The default value is 8, which means that 8 tiles will be shown per line, and any additional tiles will be rendered underneath.

Changing the tile width changes the viewport display only, your actual tile set is not modified.

### Creating tiles
Now that you are familular with the concept of tiles, palettes and the viewport, you're probably interested in creating some tiles and graphics. 

By default, a new project is automatically created with 8 x 8 (64 in total) tiles. 

#### Add a new tile to your tile set
You can create a new tile in your tile-set by clicking the 'Add new tile' button on the tile editor toolbar. 

The new tile is added at the end of the tile set.

#### Insert a tile in the tile set
If you would like to insert a tile at a specific point in the tile set, you can do the following:
* Right click the on the tile viewport and choose the "Insert tile before/after" option.
* Select a tile using the tile select tool and then click the "Insert tile before/after" context toolbar button.

#### Delete a tile from a tile set
You can delete a tile in the tile set by:
* Right click the tile in the tile viewport and choose the "Delete tile" option.
* Select a tile using the tile select tool and then click the "Delete tile" context toolbar button.
* Select a tile using the tile select tool and then press the "Delete" key on your keyboard.

#### Clone a tile in a tile set
Create an identical copy of a tile by:
* Right click the tile in the tile viewport and select the "Clone" tile option.
* Select the tile using the tile select tool and choose the "Clone tile" context toolbar option.

#### Cut, copy and paste tiles
You can copy tiles into the clipboard and then paste them from the clipboard. You can paste a tile into the same window or another window.

To cut or copy a tile:


### Import tiles from code

  * Drawing onto tiles (pencil and fill tools)
  * Choosing colours (eyedropper tool)
  * Selecting, moving, inserting, mirroring tiles (select tool)
  * Using a reference image
  * Tile width

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

* Select a tile using the tile select tool and then click the "Cut" or "Copy" button on the context toolbar.

To paste a tile: 

* Select the insertion point using the tile select tool, and then click the "Paste" context toolbar option.
* Select the insertion point using the tile select tool, and then press `Ctrl` + `V` on the keyboard.

#### Mirror of flip a tile
Tiles can be flipped horizontally or vertically, useful for when you need to create a mirrored direction for a sprite tile, etc.

To mirror or flip a tile: 

* Select a tile using the tile select tool and then click the "Mirror" or "Flip" button on the context toolbar.
* Right click the tile in the tile viewport and select the "Mirror" or "Flip" tile option.

#### Move the tile within the tile set
You can change the position of a tile within the tileset, moving it left, right, or to the line above or below. 

How to move a tile: 

* Select a tile using the tile select tool and then click the "Move left" or "Move right" button on the context toolbar.
* Select a tile using the tile select tool and hold down the `Ctrl` key on the keyboard and press the arrow keys to move the tile.


### Drawing onto tiles (pencil and fill tools)

We support rudimentary drawing and editing functions with the "Pencil" and "Fill" tools. 

#### To draw onto tiles
* Select the "Pencil" tool from the toolbar.
* Optionally select a brush size from the context toolbar.
* Optionally select a colour from the palette toolbox.
* Click onto the tile set image in the viewport and those pixels will change to the colour index that is selected in the palette toolbox.

The keyboard shortcut key is `P`.

#### To fill an area with a colour
* Select the "Fill" tool from the toolbar.
* Optionally select a colour from the palette toolbox.
* Click onto the tile set image in the viewport and those pixels as well as any adjacent pixels of the same colour index will change to the colour index that is selected in the palette toolbox.

The keyboard shortcut key is `F` or `B`.

#### Choosing colours (eyedropper tool)
The eyedropper tool is useful if you would like to select the palette colour index that is associated with a specific pixel in the tile editor.

Simple select the "eyedropper" tool from the toolbar and then click with the primary mouse button onto the pixel that you could like to obtain the colour from.

The keyboard shortcut key is `I`.

### Import tiles from assembly code

SMSGFX has the ability to turn WLA-DX compatible code snippets into tiles (and palettes) for use in your project.

To import tiles:

* Copy the tile definition lines from your source files into the clipboard, the lines will look similar to the following:
```
.db $00 $00 $00 $00 $00 $00 ...
.db $00 $00 $00 $00 $00 $00 ...
.db $00 $00 $00 $00 $00 $00 ...
.db $00 $00 $00 $00 $00 $00 ...
``` 
<small>*NOTE: You can include comments in your pasted code, SMSGFX will ignore these.*</small>

* Click the "**Import tiles form your code**" toolbar button.
* Paste the code into the box provided.
* If you would like to completely replace all the tiles in your project with the ones here, then choose the "*Replace existing tiles in project with these*" option, if this is un-checked then the tiles will be appended to the end of your project.
* Click the "Import tiles" button.


### Create tiles from an image file or the clipboard
You can convert an image file on your disk or in your clipboard into a tile map, this function is explained here: 

(TODO: Link to import image function documentation)


### Using a reference image
A reference image can be placed into the background of the tile editor to assist with the creation of your tile map. 

The image can be resized, and you can choose whether to overlay the image over your current image (make it transparent) or you can draw the image in the place of another colour index. 

To set a reference image: 

* Select the "Reference image" toolbar button.
* Click the "Select a new reference image" context toolbar button.
* Choose your image using the file picker.
* When you confirm the file picker, the image will appear centred in the middle of the tile editor. 

To move and resize the reference image using the context toolbar: 

* Select the "Reference image" toolbar button.
* On the context toolbar modify the "X", "Y", "W" and "H" values.
* You can maintain or ignore aspect ratio by clicking the "Maintain aspect" button on the context toolbar.

To move the reference image using the mouse:

* Select the "Reference image" toolbar button.
* To move the image, position the mouse inside the reference image in the tile editor viewport, the mouse cursor will change to a move icon.
* Click and drag using the primary button.

To resize the reference image using the mouse:

* Select the "Reference image" toolbar button.
* To move the image, position the mouse inside the desired edge of the reference image in the tile editor viewport, the mouse cursor will change to a resize icon.
* Click and drag using the primary button.
* If you would like to maintain the aspect ratio, hold the `Ctrl` key.

To remove a reference image:

* Select the "Reference image" toolbar button.
* Click on the "Remove the reference image" button on the context toolbar.

To revert the reference image to it's original dimensions:

* Select the "Reference image" toolbar button.
* Click on the "Revert proportions" button on the context toolbar.
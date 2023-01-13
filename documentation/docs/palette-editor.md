# Palette editor

## About palettes

Palettes are a list of 16 individual colours that may be used to colour the pixels within a tile map. 

You define a colour value for each of the 16 colour slots within the palette.

### Palette limitations

* The Sega Master System gives you a selection or 64 colours in total that you can use (6-bit colour).
* The Sega Game Gear gives you a selection or 4096 colours in total that you can use (12-bit colour).


## Working with palettes

The palette editor section of the window is where you work with palettes. 

In summary you can perform the following functions: 

* Define new palettes.
* Clone existing palettes.
* Import palettes from assembly code.
* Remove palettes.
* Choose colours in the palette.
* Change the order of colours within the palette.
* Replace colours on your image.

These functions will be expanded on below.

### Defining a palette system
Because the Sega Master System and Game Gear define their palettes differently you will need to select the system that the palette is designed for.

To change the system click on the icon for the desired system in the palette editor. 

Changing systems will affect how the palette is exported and also how the colours are displayed in the tile editor. 


## Palette management functions

### Moving between palettes
You can define more than one palette in your project, and at times you would probably want to swap between these different palettes.

To move between palettes click the drop down arror next to the palette's name at the top of the palette editor, and then select the palette that you would like to work with. 

Keyboard shortcut: `Ctrl` and `Up` or `Down` arrow.

### Create a new palette
To create a new palette click on the "Create a new palette" button on the palette toolbar.

A new palette will be added to your project with a generic selection of colours.

Keyboard shortcut: `Ctrl` + `Alt` + `P`.

### Clone a palette
If you are creating a multi-platform game then you may want to clone a palette. For example, you may create a palette that targets the Master System and then create a Game Gear version.

To clone a palette, in the palette editor click the "Clone" button.

### Remove a palette
To remove a palette, in the palette editor click the "Remove button" button.
If you accidentally remove a palette, the action can be undone by clicking the "Undo" button.

### Naming a palette
You can assign a friendly name to your palette, this doesn't affect the palette itself, but will cause SMSGFX to automatically generate a code comment with the palette name when you export your project as code.

To name your palette, in the palette editor, click into the textbox above the palette, and type a new name. 
Changes are automatically saved.

### Emulate system colours
Enabling this function will show your palette colours and render your tile set colours to look similar to how they would look on the target system. 

For the Master System this may have a profound impact on how your image looks, however it will give you an accurate preview of the final image. 
For the Game Gear this may not make a large difference to your image because of the expanded colour palette that the Game Gear is capable of rendering.

### Import a palette from code
SMSGFX has the ability to turn WLA-DX compatible code snippets into palettes (and tiles) for use in your project.

To import a palette:

* Copy the palette definition lines from your source files into the clipboard, the lines will look similar to the following:
```
.dw $fdb $a00 $0a0 $0f0 $500 $f00 $005 $ff0 $00a $00f $055 $0ff $050 $f0f $555 $fdb
``` 
<small>*NOTE: You can include comments in your pasted code, SMSGFX will ignore these.*</small>

* Click the "**Import a palette form your assembly code**" toolbar button.
* Choose the target system from the "Select the system" box (selecting the wrong system will have odd results).
* Paste the assembly code into the box provided.
* Click the "Import palette" button.


## Palette colour management

### Selecting a colour
You can select a colour by clicking on it's respective icon within the palette editor. 
The selected colour will have a dark box drawn around it.

### Choosing a colour
There are two ways that you can choose a colour:

* Using the colour picker dialogue.
* Using the colour selector below the palette editor. 

#### Using the colour picker dialogue
The colour picker dialogue gives you the most options when choosing a colour, to bring up the colour picker dialogue, with a palette colour index already selected, click it again and the colour picker dialogue will appear. 

* Individual red, green and blue values can be adjusted using the sliders or entering their numeric values. 
* The "Select colour" button will display the system's native colour picker for you to use.
* The "Hex" box allows you to choose a colour using a hex value.

The preview area displays two previews: 
* Selected: the absolute value of the colour as selected.
* Native: an approximation of how the colour will appear natively on the selected system.

When you're done click the "Save changes" button.

#### Using the colour selector
The colour selector gives you a convenient inline colour editing ability without needing to display a distracting dialogue.

* Individual red, green and blue values can be adjusted using the sliders or entering their numeric values. 
* The "Hex" box allows you to choose a colour using a hex value.
* Clicking the colour preview box will display the system's native colour picker for you to use.
* The "SMS colours" tab will display the entire colour palette from the Sega Master System, click on a colour to use that colour. 

### Re-ordering colours
It is possible that you may want to shift the colour from one index to another. For example, you may want to swap colour #3 with colour #4. 

SMSGFX profides a colour swap function that can swap the values of a particular colour index, it will also update your tile set, updating all colour references to match the new colour index. 

To swap colour positions: 

* In the palette editor click on a colour using the secondard button (or right button).
* Under the "Swap position with colour" heading, choose the colour that you want to swap with. 
* Click the "Swap" button. 

The colour positions are now swapped and references to each colour are also updated in your tile map. 

### Replace all instances of a colour
You may wish to change all instances of one colour to anothe colour, for example, you may want to change all references to colour #15 to colour #1.

Performing this function does not affect your palette, it modifies the tile set.

To set all instances of one colour to another:

* In the palette editor click on a colour using the secondard button (or right button).
* Under the "Set all instances to colour" heading, choose the colour that you want to set to. 
* Click the "Set" button. 

All instances of that colour will now be replaced with the selected colour.
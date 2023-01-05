# Interface

## Interface tour

### Main interface 

The SMSGFX interface can be split into three main areas:

![UI overview.](assets/images/ui-overview.png)

1. **Project toolbar** - Manage your projects, import and export files.
1. **Palette editor** - Create and manage colour palettes.
1. **Tile editor** - Create and edit your graphics tiles.

These areas can be further divided as below.

### Project toolbar

The project toolbar allows you to manage your projects, load and save project files, export code and image previews.

![Project toolbar.](assets/images/project-toolbar.png)

1. Show the **project menu** (see below).
2. **Project name** - Displays the project name, click and type in this field to change the project name.
3. **Export code** - Converts the entire project to assembly code and displays it in a window so that you can download it.
3. **Export image** - Download the displayed tile set as a PNG image.

The project menu is where you manage your loaded projects.

![Project menu.](assets/images/project-menu.png)

1. **Project name** - Displays the project name, click and type in this field to change the project name.
2. Save the current project as a JSON file.
3. **Project list** - Shows all of the projects that are in browser memory, click the title of a project to load it instantly.
4. Remove/delete a project from browser memory (this can not be undone, please save your project as JSON first!).
5. Create a new project in browser memory, the newly created project is loaded instantly.
6. Load a project from a previously exported JSON file.
7. Click the project menu (you can also click outside the project menu or press the `ESC` key.)

### Palette editor

The palette editor is where you create and manage your colour palettes.

![Palette editor.](assets/images/palette-editor.png)

1. Add a new palette with default colours and system selection.
2. Import a colour palette from assembly code.
3. Palette friendly name, click and type into this field to edit.
4. Palette selector drop-down.
5. System selection, choose between Sega Master System and Game Gear. Changing this option will affect the exported palette code and also how colours appear in the tile editor.
6. Palette colour slots.
     - Single click a colour slot to select that colour. 
     - Double click a colour slot to display the colour editor window.
     - Currently selected colour is highlighted with a dark outline. 
     - As you move the mouse over the tile editor, the colour index that appears underneath the cursor is given a lighter outline.
7. Enable "Emulate system colours" if you would like to snap colour display to the closest compatible colour for the given system, otherwise the colour will be rendered in the exact R, G, B values you entered.
8. Clones the currently displayed palette as a new palette.
9. Removes/deletes the currently displayed colour palette.
10. With a colour selected, you can adjust the values here to modify the selected colour index, or click the "SMS colours" tab to pick from the entire SMS palette of 64 colours.


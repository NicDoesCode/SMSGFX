# Home

**Welcome to SMSGFX!** 

This documentation will assist you with performing simple tasks associated with the product.

## What is SMSGFX?

SMSGFX is a browser based tile editor that allows you to make graphics for Sega Master System and Sega Game Gear.

You can import graphics from image files, the clipboard, assembly code or simply draw something from scratch, and when you're done you can export the graphics in a format that the Sega Master System and Game Gear understands.

Projects are automatically saved in your browser as you work, you can load and save projects from files.

## Quick overview

The following is a quick video overview of the key features of SMSGFX.

## Keyboard shortcuts

### General
| Key | Function | 
| --- | -------- |
| Ctrl + Shift + S | Save project to a JSON file. |
| Ctrl + Shift + O | Open a project JSON file. |
| Ctrl + Shift + E | Export project to assembly. |
| Ctrl + Shift + N | Create a new blank project. |

### Viewport and editor
| Key | Function | 
| --- | -------- |
| Ctrl + X | Cut selected tile. | 
| Ctrl + C | Copy selected tile. | 
| Ctrl + V | Paste tile or import image from clipboard. | 
| Ctrl + D | Clone / duplicate selected tile. | 
| Ctrl + Z | Undo last change. | 
| Ctrl + Y | Redo last change. | 
| F or B | Change to fill / bucket tool. |
| S | Change to select tool. |
| P | Change to pencil tool. |
| I | Change to colour select tool. |
| Alt + plus (+) | Increase image scale / zoom. |
| Alt + minus (-) | Decrease image scale / zoom. |

### Pencil tool
| Key | Function | 
| --- | -------- |
| Ctrl + 1 - 5 | Set pencil size. |
| Ctrl + left click | While the pencil tool is selected this will change to the current colour that the mouse is hovering over. |

### Palette
| Key | Function | 
| --- | -------- |
| Ctrl + Alt + P | Add palette. |
| Ctrl + Up arrow | Move up one palette. |
| Ctrl + Down arrow | Move down one palette. |
| Ctrl + Left arrow | Select lower palette colour. |
| Ctrl + Right arrow | Select higher palette colour. |

### Tiles
| Key | Function | 
| --- | -------- |
| Ctrl + Alt + E | Add tile. |
| Delete | Delete the selected tile. | 
| Up arrow | Select tile directly above. |
| Down arrow | Select tile directly below. |
| Left arrow | Select tile directly left. |
| Right arrow | Select tile directly right. |
| Ctrl + [ | Mirror selected tile horizontally. | 
| Ctrl + ] | Mirror selected tile vertically. | 
| Ctrl + Left arrow | Move the selected tile to the left. | 
| Ctrl + Right arrow | Move the selected tile to the right. | 
| Ctrl + Up arrow | Move the selected tile to the row above. | 
| Ctrl + Down arrow | Move the selected tile to the row below. | 


## Commands

* `mkdocs new [dir-name]` - Create a new project.
* `mkdocs serve` - Start the live-reloading docs server.
* `mkdocs build` - Build the documentation site.
* `mkdocs -h` - Print help message and exit.

## Project layout

    mkdocs.yml    # The configuration file.
    docs/
        index.md  # The documentation homepage.
        ...       # Other markdown pages, images and other files.

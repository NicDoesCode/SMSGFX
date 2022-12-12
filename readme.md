# SMSGFX
A browser based tile editor for Sega Master System and Sega Game Gear.

## Key features: 
* Tile editor.
* Colour palette editor.
* Import palettes and tiles directly from Sega Master System and Sega Game Gear compatible [WLA-DX](https://github.com/vhelin/wla-dx) assembly code.
* Export tiles and palettes to Sega Master System and Sega Game Gear compatible [WLA-DX](https://github.com/vhelin/wla-dx) assembly code.
* Supports multiple colour palettes with colour picker to customise colours.
* Supports saving and loading of project files in simple JSON format.
* Project data is saved locally within browser local storage.
* Runs completely within a modern web browser, no tool installation required or cloud dependencies.
* Written in pure ES6.

## Dependencies: 
If you have your own server then there are no dependencies, all required files are included in the `/wwwroot` directory or loaded via CDN.

To use the Configuration for a local Node.js Express based server the following is required:
* [Node.js](https://nodejs.org/en/)


# How to run

## Option 1
1. Copy the files from `/wwwroot` to your own server. 
2. Open `index.html`. 

## Option 2
1. Run the following from a terminal from the project root folder:<br />`node app.js`
2. Browse to http://localhost:8080/index.html.

## To host a local HTTPS server
For this you will require OpenSSL to be installed. 
1. Navigate to the project root folder in a terminal window.
2. Run the command '`openssl req -nodes -new -x509 -keyout cert/server.key -out cert/server.cert`' to create the certificate.
   * Make sure you set the common name to '`localhost`'.
3. The files '`cert/server.key` and `cert/server.cert` will be created, the `app.js` file will detect these files and automatically create a HTTPS server for you next time that you run it.


# Keyboard shortcuts

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


# Some frameworks being investigated for future use with the project

### Handlebars
* https://handlebarsjs.com/

### Semantic UI
* https://semantic-ui.com/introduction/getting-started.html

### MUI 
* https://mui.com/getting-started/installation/

### Base Web
* https://baseweb.design


# Credits 

Event dispatcher class is based off:
* https://blog.k.io/atech/creating-a-simple-custom-event-system-in-javascript


# Licence

 ## GNU General Public License v3 (GPL-3).
 https://www.gnu.org/licenses/gpl-3.0.en.html
# Concepts

## Projects

SMSGFX works with objects called "Projects", a project is a container for the colour palettes and graphics tiles that you've defined.

## Palette

The Sega Master System and Game Gear use palettes with 16 colour slots per palette. Each slot contains the RGB value for a colour. You can use the same colour in multiple slots.

When you paint an image it is important to note that each 'pixel' does not store a colour, but instead it stores the slot number of the colour used from 1 to 16. You will notice that as you change colour palettes the colours in your image will also update to reflect the colour palette used.

## Colours

The Sega Master System uses 6-bit colour, this gives you a total count of 64 colours that you can use with your graphics, this limited amount of colours gives Master System games their signature bright and cartoony look.

The Sega Game Gear uses 12-bit colour, this gives you a total count of 4096 colours that you can use with your graphics, this expanded range of colours allows you to pick more complementary colours than the Master System.

Despite the total colours available to you remember that you may only use 16 of these colours per palette meaning that each tile may show a maximum of 16 colours.

## Tiles

The Sega Master System and Game Gear construct their graphics using a mosaic of 8x8 pixel tiles.

To construct a scene we lay out these tiles out in a 'tile map'. You can not draw on individual pixels on these systems, your scene is constructed from these tiles.

In almost all games a single tile is repeated multiple times.

## Tile map

This is a grid constructed of individual 8x8 graphics tiles that you define. Each tile may be repeated any number of times. Each entry in a tile map also tells the system which colour palette to use and whether the tile is to be flipped horizontally or vertically, or appear on-top of or behind sprites.

You cannot place a tile anywhere on the screen, each tile must be placed into a tile map.

## Sprite

A sprite is a single 8x8 tile from your tile set, unlike a tile map, a sprite may be moved to any position onto the screen.

In a game, usually the player's character is a sprite, depending on the size of the player's character, several tiles and sprites may be used to act as one large sprite.

There are limitations on sprites, with only 64 allowed at once, and no more than 8 can appear side by side, if there are more than 8 side by side you will experience flickering graphics.

## Tile set

A tile set is a concept used by SMSGFX which refers to the entire collection of tiles for your project regardless of the tile map that they're used on.
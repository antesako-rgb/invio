# Public album demo

The theme template route uses the same DigitalAlbumViewer as published albums.
Only its inputs differ: a deterministic 20-page document and local WebP photos.
No database, authentication, editor or starter factory is involved.
All themes share the content and photos; only document.theme changes.
Names and date are fictional; stock subjects are not identified as those people.

## Photo sources

Downloaded as WebP (1400px width, quality 82) to `public/digital-albums/demo/`.
The viewer serves these local assets, never the source URLs.
Originals are provided under the [Unsplash License](https://unsplash.com/license).

| File | Photographer | Original |
| --- | --- | --- |
| sunset.webp | Jaakko Perälä | https://unsplash.com/photos/7Hy6grhmRLQ |
| bouquet.webp | Thomas AE | https://unsplash.com/photos/295NLwGdrKM |
| embrace.webp | freestocks | https://unsplash.com/photos/U4Zo8x0cSGw |
| details.webp | Stacie Ong | https://unsplash.com/photos/gTrfIjppVQc |
| reception.webp | Jennifer Kalenberg | https://unsplash.com/photos/ROOE-zHpZYU |

Replace images or adjust photo assignments in this folder to curate the demo.
The production `createDefaultDigitalAlbumDocument` must keep empty photo slots.

The demo showcases all 19 registered layouts, with cover repeated as the back cover.
Text-led spreads alternate with full photos, framed portraits and multi-photo sequences.

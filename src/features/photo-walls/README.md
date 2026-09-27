# Photo Wall Materials

Materials are documents owned by a Photo Wall. They have no public identity or publishing lifecycle. The QR destination always comes from the parent wall.

- `editor/`: product state, content/design/QR panels, save state and responsive composition of `features/editor` primitives.
- `content/`: supported content fields and initial values.
- `renderer/`: one render path for `edit` and `export`, JSON parsing and locale-aware display data. Templates have no editor context or database imports.
- `cards/templates/`: independent compositions and their physical formats, variants and supported fields.
- `cards/registry/photoWallMaterialTemplateConfigs.ts`: serializable metadata used by server validation and controls.
- `cards/registry/photoWallMaterialTemplateRegistry.ts`: the corresponding React components, used only for rendering.
- `actions/materials/`, `repositories/materials/`, `validation/`: validated owner-authorized writes to the existing table, with timestamp conflict protection on update.
- `preview/`, `components/template-picker/`: catalog samples using the same renderer. An unbound sample shows a QR placeholder, never a fake destination.

To add a design, add its component, CSS Module and configuration; register its metadata and component; add HR/EN labels. The editor reads its fields, variants and dimensions without per-template editor code. Preserve existing content when switching designs.

Future PNG/PDF output must load the material and its parent through an authorized server path, use `buildPhotoWallMaterialRenderData`, render `PhotoWallMaterialRenderer` with `mode="export"`, and take physical dimensions from the template config. Wait for fonts and verify overflow before capture. There is no download endpoint in this version.

Run `node --test scripts/test-photo-wall-materials.mjs` from the repository root. See [the audit and implementation report](../../../docs/photo-wall-materials-editor.md) for verification limits, deleted files and deployment requirements.

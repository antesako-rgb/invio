# Shared editor UI

Invitation, digital album and seating compose the same editor components:

| Component | Purpose |
| --- | --- |
| EditorShell / EditorHeader / EditorSaveStatus | Fullscreen frame, header and persistence feedback |
| EditorWorkspace | Desktop tool rail, collapsible sidebar and canvas |
| EditorToolRail | Controlled tool navigation, active item and sidebar toggle |
| EditorSidebar | Panel title and scrollable content |
| EditorMobileNavigation / EditorMobilePanel | Mobile tools and drawer with snap points |

EditorToolRail uses the existing UI SideNavigation in rail appearance and the shared IconButton. Editors provide their items, active ID, collapsed state and handlers. Navigation opens the corresponding panel and expands its sidebar. The optional disabled state blocks interaction during a pending operation. Localized sidebar toggle labels use Navigation.dashboard.

Invitation supplies pages/photos/templates/theme directly. DigitalAlbumEditorToolRail adapts the album navigation items and step handler. Seating supplies guests/tables/settings. Seating settings use SeatingPlanSettingsPanel and the existing plan RPC/confirmation handlers; their controlled draft stays in SeatingWorkspace across panel changes and mobile/desktop layouts.

Domain data, draft validation, save operations and preview/canvas rendering remain owned by each feature. Shared components do not call RPCs or mutate editor documents.

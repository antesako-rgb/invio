import type {
  DigitalAlbumDocument,
  DigitalAlbumPageLayout,
} from "../../../types/digitalAlbumDocument.types";
import {
  changeDigitalAlbumPageLayout,
  duplicateDigitalAlbumPage,
  moveDigitalAlbumPage,
} from "../../../utils/digitalAlbumDocumentOperations";
interface Options {
  getDocument: () => DigitalAlbumDocument;
  commit: (
    update: (document: DigitalAlbumDocument) => DigitalAlbumDocument,
  ) => void;
  activePageId: string | null;
  selectPage: (id: string) => void;
}
export default function useDigitalAlbumPageActions({
  getDocument,
  commit,
  activePageId,
  selectPage,
}: Options) {
  async function addPage(layout: DigitalAlbumPageLayout) {
    const id = crypto.randomUUID();
    const page = changeDigitalAlbumPageLayout(
      { id, layout: "story", photos: [], content: {} },
      layout,
    );
    commit((document) => {
      const pages = [...document.pages];
      const active = pages.findIndex((p) => p.id === activePageId);
      // Keep an existing back cover at the end.
      const index =
        pages.length > 1
          ? Math.min(Math.max(1, active + 1), pages.length - 1)
          : pages.length;
      pages.splice(index, 0, page);
      return { ...document, pages };
    });
    selectPage(id);
    return id;
  }
  async function changePageLayout(id: string, layout: DigitalAlbumPageLayout) {
    commit((document) => ({
      ...document,
      pages: document.pages.map((p) =>
        p.id === id ? changeDigitalAlbumPageLayout(p, layout) : p,
      ),
    }));
    selectPage(id);
  }
  async function duplicatePage(id: string) {
    const source = getDocument().pages.find((p) => p.id === id);
    if (!source) return;
    const page = duplicateDigitalAlbumPage(source);
    commit((document) => {
      const pages = [...document.pages];
      const index = pages.findIndex((p) => p.id === id);
      pages.splice(
        pages.length > 1 ? Math.min(index + 1, pages.length - 1) : 1,
        0,
        page,
      );
      return { ...document, pages };
    });
    selectPage(page.id);
  }
  async function swapPages(source: string, target: string) {
    commit((document) =>
      moveDigitalAlbumPage(
        document,
        document.pages.findIndex((p) => p.id === source),
        document.pages.findIndex((p) => p.id === target),
      ),
    );
    selectPage(source);
  }
  async function deletePage(id: string) {
    const document = getDocument();
    if (document.pages.length <= 1) return;
    const index = document.pages.findIndex((p) => p.id === id);
    commit((current) => ({
      ...current,
      pages: current.pages.filter((p) => p.id !== id),
    }));
    if (id === activePageId)
      selectPage(
        getDocument().pages[Math.min(index, getDocument().pages.length - 1)].id,
      );
  }
  return { addPage, changePageLayout, duplicatePage, swapPages, deletePage };
}

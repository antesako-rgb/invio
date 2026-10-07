import "server-only";
import { deleteDigitalAlbum } from "../repositories/album/deleteDigitalAlbum";

export async function deleteDigitalAlbumWithStorage(albumId: string): Promise<void> {
  // Existing owner-only RPC removes the album. The durable ledger/sweep handles
  // unreferenced objects, including deletions made directly through that RPC.
  await deleteDigitalAlbum(albumId);
}

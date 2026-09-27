import {
  assertDigitalAlbumRevision,
  DigitalAlbumSaveConflict,
} from "../../utils/digitalAlbumRevision";

import type {
  DigitalAlbumDocument,
} from "../../types/digitalAlbumDocument.types";

import {
  albumDocumentsEqual,
} from "../../utils/digitalAlbumDocumentOperations";


/* ==========================================================================
   Types
========================================================================== */

export type AlbumSaveStatus =
  | "saved"
  | "saving"
  | "error";


export interface DigitalAlbumSessionSnapshot {
  document:
    DigitalAlbumDocument;

  status:
    AlbumSaveStatus;

  canUndo:
    boolean;

  canRedo:
    boolean;

  conflict:
    boolean;
}


type Save = (
  document:
    DigitalAlbumDocument,
  version:
    number,
  revision:
    number
) => Promise<{
  document:
    DigitalAlbumDocument;

  version:
    number;

  revision:
    number;
}>;


/* ==========================================================================
   Digital Album Session
========================================================================== */

export class DigitalAlbumSession {

  private history:
    DigitalAlbumDocument[] =
      [];

  private future:
    DigitalAlbumDocument[] =
      [];

  private listeners =
    new Set<() => void>();

  private pending =
    false;

  private running:
    Promise<boolean> | null =
      null;

  private editSequence =
    0;

  private snapshot:
    DigitalAlbumSessionSnapshot;


  constructor(
    document:
      DigitalAlbumDocument,
    private version:
      number,
    private documentRevision:
      number,
    private save:
      Save
  ) {

    assertDigitalAlbumRevision(
      documentRevision
    );


    this.snapshot = {
      document,

      status:
        "saved",

      canUndo:
        false,

      canRedo:
        false,

      conflict:
        false,
    };

  }


  /* ==========================================================================
     Snapshot
  ========================================================================== */

  getSnapshot =
    (): DigitalAlbumSessionSnapshot =>
      this.snapshot;


  /* ==========================================================================
     Subscribe
  ========================================================================== */

  subscribe =
    (
      listener:
        () => void
    ) => {

      this.listeners.add(
        listener
      );


      return () => {
        this.listeners.delete(
          listener
        );
      };

    };


  /* ==========================================================================
     Emit
  ========================================================================== */

  private emit(
    status =
      this.snapshot.status
  ) {

    this.snapshot = {
      ...this.snapshot,

      status,

      canUndo:
        this.history.length >
        0,

      canRedo:
        this.future.length >
        0,
    };


    this.listeners.forEach(
      (
        listener
      ) =>
        listener()
    );

  }


  /* ==========================================================================
     Commit
  ========================================================================== */

  commit =
    (
      update:
        (
          document:
            DigitalAlbumDocument
        ) =>
          DigitalAlbumDocument
    ) => {

      const next =
        update(
          this.snapshot.document
        );


      if (
        albumDocumentsEqual(
          next,
          this.snapshot.document
        )
      ) {
        return;
      }


      this.future =
        [];


      this.history.push(
        this.snapshot.document
      );


      if (
        this.history.length >
        50
      ) {
        this.history.shift();
      }


      this.snapshot = {
        ...this.snapshot,
        document:
          next,
      };


      this.editSequence++;

      this.pending =
        true;


      this.emit(
        this.snapshot.status ===
          "error"
          ? "error"
          : "saving"
      );


      if (
        this.snapshot.status !==
        "error"
      ) {
        void this.flush();
      }

    };


  /* ==========================================================================
     Undo
  ========================================================================== */

  undo =
    () => {

      const previous =
        this.history.pop();


      if (
        !previous
      ) {
        return;
      }


      this.future.push(
        this.snapshot.document
      );


      this.snapshot = {
        ...this.snapshot,
        document:
          previous,
      };


      this.editSequence++;

      this.pending =
        true;


      this.emit(
        this.snapshot.status ===
          "error"
          ? "error"
          : "saving"
      );


      if (
        this.snapshot.status !==
        "error"
      ) {
        void this.flush();
      }

    };


  /* ==========================================================================
     Redo
  ========================================================================== */

  redo =
    () => {

      const next =
        this.future.pop();


      if (
        !next
      ) {
        return;
      }


      this.history.push(
        this.snapshot.document
      );


      if (
        this.history.length >
        50
      ) {
        this.history.shift();
      }


      this.snapshot = {
        ...this.snapshot,
        document:
          next,
      };


      this.editSequence++;

      this.pending =
        true;


      this.emit(
        this.snapshot.status ===
          "error"
          ? "error"
          : "saving"
      );


      if (
        this.snapshot.status !==
        "error"
      ) {
        void this.flush();
      }

    };


  /* ==========================================================================
     Clear History
  ========================================================================== */

  clearHistory =
    () => {

      this.history =
        [];

      this.future =
        [];

      this.emit();

    };


  /* ==========================================================================
     Flush
  ========================================================================== */

  flush =
    (): Promise<boolean> => {

      if (
        this.snapshot.conflict
      ) {
        return Promise.resolve(
          false
        );
      }


      if (
        this.running
      ) {
        return this.running;
      }


      if (
        !this.pending
      ) {
        return Promise.resolve(
          this.snapshot.status ===
            "saved"
        );
      }


      this.emit(
        "saving"
      );


      this.running =
        this.drain()
          .then(
            (
              saved
            ) => {

              this.running =
                null;


              return (
                saved &&
                this.pending
              )
                ? this.flush()
                : saved;

            }
          );


      return this.running;

    };


  /* ==========================================================================
     Drain
  ========================================================================== */

  private async drain() {

    while (
      this.pending
    ) {

      const document =
        this.snapshot.document;

      const revision =
        this.editSequence;


      try {

        const result =
          await this.save(
            document,
            this.version,
            this.documentRevision
          );


        if (
          !albumDocumentsEqual(
            result.document,
            document
          )
        ) {
          throw new Error(
            "Document round-trip mismatch"
          );
        }


        assertDigitalAlbumRevision(
          result.revision
        );


        if (
          result.revision !==
          this.documentRevision +
            1
        ) {
          throw new Error(
            "Unexpected document revision"
          );
        }


        this.documentRevision =
          result.revision;


        this.version =
          result.version;


        if (
          revision ===
          this.editSequence
        ) {
          this.pending =
            false;
        }

      } catch (
        error
      ) {

        if (
          error instanceof
          DigitalAlbumSaveConflict
        ) {
          this.snapshot = {
            ...this.snapshot,
            conflict:
              true,
          };
        }


        this.emit(
          "error"
        );


        return false;

      }

    }


    this.emit(
      "saved"
    );


    return true;

  }

}
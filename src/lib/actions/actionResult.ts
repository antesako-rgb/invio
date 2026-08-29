/* ==========================================================================
   Action Result
========================================================================== */

export type ActionSuccess<T = undefined> =
  T extends undefined
    ? {
        success: true;
      }
    : {
        success: true;
        data: T;
      };

export type ActionError = {
  success: false;
  message: string;
};

export type ActionResult<T = undefined> =
  | ActionSuccess<T>
  | ActionError;
import type {
  ActionErrorCode,
} from "./actionErrorCodes";

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

export type ActionError<Code extends ActionErrorCode = ActionErrorCode> = {
  success: false;
  code: Code;
};

export type ActionResult<T = undefined, Code extends ActionErrorCode = ActionErrorCode> =
  | ActionSuccess<T>
  | ActionError<Code>;
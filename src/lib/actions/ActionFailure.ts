import type { ActionErrorCode } from "./actionErrorCodes";

// Client-side adapter for existing callback APIs that signal failure by throwing.
export class ActionFailure extends Error {
  constructor(readonly code: ActionErrorCode) {
    super(code);
    this.name = "ActionFailure";
  }
}

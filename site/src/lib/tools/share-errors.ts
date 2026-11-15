/**
 * The Web Share API rejects with AbortError when the user cancels the share
 * sheet. Cancellation is not a clipboard-copy request.
 *
 * Some browsers expose a DOMException and others return an Error-like object.
 * Checking the name avoids dependence on the DOMException constructor.
 */
export function isShareCancelled(error: unknown): boolean {
  return error !== null
    && typeof error === "object"
    && "name" in error
    && error.name === "AbortError";
}

import * as Y from "yjs";

/* ═══════════════════════════════════════════════════════════════════════
   Yjs client helpers: transaction origins, binary normalization, a
   textarea ↔ Y.Text binding with caret preservation, and a user colour.

   The Y.Text holding the body is addressed by this exact name everywhere —
   server, browser, and the backfill script. Diverge from it and the two
   sides edit different shared types that never converge.
   ═══════════════════════════════════════════════════════════════════════ */
export const CONTENT_TEXT_NAME = "content";

// Origin tags on Yjs transactions let us distinguish edits the local user made
// (which the DOM already reflects, but which must be sent to the server) from
// edits the server applied (which must be written into the DOM, but must NOT be
// echoed back). Without this split you get infinite update loops.
export const LOCAL_ORIGIN = "local";
export const SERVER_ORIGIN = "server";

/**
 * Socket.IO delivers binary as an ArrayBuffer in the browser. Yjs wants a
 * Uint8Array. Normalize either shape (and pass Uint8Array through untouched).
 */
export function toUint8Array(bytes) {
    if (bytes instanceof Uint8Array) return bytes;
    return new Uint8Array(bytes);
}

/**
 * A Yjs update encoding "no changes" is a 2-byte header. Skip sending those so
 * an already-synced client doesn't spam the socket.
 */
export function isEmptyUpdate(update) {
    return !update || update.length <= 2;
}

/**
 * Find the single contiguous region that differs between two strings, as
 * { index, removed, inserted }: at `index`, `removed` chars were replaced by
 * the `inserted` substring. Computed from the common prefix and suffix, which
 * exactly describes any normal edit (type, delete, paste, wrap-selection) and
 * degrades gracefully to a whole-region replace for multi-cursor remote merges.
 */
export function diffStrings(oldStr, newStr) {
    if (oldStr === newStr) return { index: 0, removed: 0, inserted: "" };

    const maxPrefix = Math.min(oldStr.length, newStr.length);
    let prefix = 0;
    while (prefix < maxPrefix && oldStr[prefix] === newStr[prefix]) prefix += 1;

    let suffix = 0;
    const maxSuffix = Math.min(oldStr.length - prefix, newStr.length - prefix);
    while (
        suffix < maxSuffix &&
        oldStr[oldStr.length - 1 - suffix] === newStr[newStr.length - 1 - suffix]
    ) {
        suffix += 1;
    }

    return {
        index: prefix,
        removed: oldStr.length - prefix - suffix,
        inserted: newStr.slice(prefix, newStr.length - suffix),
    };
}

/**
 * Map a caret offset in `oldStr` to the equivalent offset after a change, so a
 * remote edit doesn't throw the local user's cursor to the end of the document.
 */
function mapCaret(caret, { index, removed, inserted }) {
    if (caret <= index) return caret;
    if (caret >= index + removed) return caret - removed + inserted.length;
    // Caret was inside the replaced region — clamp to the end of the insert.
    return index + inserted.length;
}

/**
 * Two-way bind a <textarea> to a Y.Text.
 *
 * Local input → diffed into a Y.Text insert/delete under LOCAL_ORIGIN (so it is
 * broadcast but not re-applied to our own DOM). Remote changes (any non-local
 * origin) → written back into the textarea with the caret preserved.
 *
 * Returns an imperative handle: destroy() to tear down, and wrapSelection() for
 * the formatting toolbar (which must edit the shared type, not just the DOM).
 */
export function bindTextareaToYText(textarea, ytext) {
    // Seed the DOM from the shared type (the initial synced state).
    textarea.value = ytext.toString();

    // DOM → Y.Text
    const onInput = () => {
        const next = textarea.value;
        const current = ytext.toString();
        if (next === current) return;

        const { index, removed, inserted } = diffStrings(current, next);
        ytext.doc.transact(() => {
            if (removed > 0) ytext.delete(index, removed);
            if (inserted) ytext.insert(index, inserted);
        }, LOCAL_ORIGIN);
    };
    textarea.addEventListener("input", onInput);

    // Y.Text → DOM (remote edits only; our own LOCAL edits are already in the DOM)
    const observer = (_event, transaction) => {
        if (transaction.origin === LOCAL_ORIGIN) return;

        const oldValue = textarea.value;
        const newValue = ytext.toString();
        if (oldValue === newValue) return;

        const change = diffStrings(oldValue, newValue);
        const start = mapCaret(textarea.selectionStart, change);
        const end = mapCaret(textarea.selectionEnd, change);

        textarea.value = newValue;
        // Only restore the caret if this textarea is focused; otherwise leave it.
        if (document.activeElement === textarea) {
            textarea.setSelectionRange(start, end);
        }
    };
    ytext.observe(observer);

    return {
        destroy() {
            textarea.removeEventListener("input", onInput);
            ytext.unobserve(observer);
        },

        /**
         * Wrap the current selection in `before`/`after` markers. Edits the
         * shared type (so peers see it) and updates the DOM + caret directly,
         * because LOCAL_ORIGIN edits are intentionally ignored by the observer.
         */
        wrapSelection(before, after) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            ytext.doc.transact(() => {
                // Insert the trailing marker first so the leading insert doesn't
                // shift the index we computed for it.
                ytext.insert(end, after);
                ytext.insert(start, before);
            }, LOCAL_ORIGIN);

            textarea.value = ytext.toString();
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        },
    };
}

/**
 * Deterministic avatar colour from a user id, so the same person is the same
 * colour for everyone.
 */
export function colorFromId(id = "") {
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) {
        hash = (hash * 31 + id.charCodeAt(i)) % 360;
    }
    return `hsl(${hash}, 65%, 55%)`;
}

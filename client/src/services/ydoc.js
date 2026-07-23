/* ═══════════════════════════════════════════════════════════════════════
   Yjs client helpers: the shared-type contract, transaction origins, binary
   normalization, and a deterministic user colour.

   The document body lives in a Y.XmlFragment (the ProseMirror/Tiptap document
   tree) addressed by the name below. This is a system-wide contract — the
   Tiptap Collaboration extension, the server's plaintext projection, and the
   backfill script must all use this exact name, or they operate on different
   shared types that never converge.

   (Before the Tiptap migration this was a Y.Text named "content". A Y.Text and
   a Y.XmlFragment are different root types, so the rename is deliberate: it
   makes an unmigrated document fail loudly rather than silently load blank.)
   ═══════════════════════════════════════════════════════════════════════ */
export const CONTENT_FRAGMENT_NAME = "default";

// Origin tag for updates the server sent us. The relay in
// useCollaborativeDocument must not echo these back, or two clients ping-pong
// the same delta forever. Local edits carry Tiptap's own (non-string) origin,
// so `origin !== SERVER_ORIGIN` cleanly means "ours, send it".
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
 * Deterministic avatar/caret colour from a user id, so the same person is the
 * same colour for everyone.
 */
export function colorFromId(id = "") {
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) {
        hash = (hash * 31 + id.charCodeAt(i)) % 360;
    }
    return `hsl(${hash}, 65%, 55%)`;
}

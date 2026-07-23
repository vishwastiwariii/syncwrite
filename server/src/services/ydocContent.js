import * as Y from "yjs"

/**
 * The name of the Y.XmlFragment shared type holding the document body.
 *
 * This is a system-wide contract: the browser's Tiptap Collaboration extension,
 * this module, and the backfill script must all address this exact name, or
 * they operate on different shared types that never converge.
 *
 * Before the Tiptap migration the body was a Y.Text named "content". A Y.Text
 * and a Y.XmlFragment are different root types, so the rename is deliberate —
 * an unmigrated document fails loudly (empty body) rather than silently
 * half-working.
 */
export const CONTENT_FRAGMENT_NAME = "default"

/**
 * ProseMirror inline nodes that occupy a position in the tree but carry no
 * text. A hard break ends the visual line, so it becomes a newline in the
 * projection; anything else inline contributes nothing.
 */
const INLINE_ELEMENTS = new Set(["hardBreak", "hard_break"])

/**
 * Normalize a Mongo Buffer or a browser-relayed ArrayBuffer into a standalone
 * Uint8Array. Buffers from the driver can be slices of a shared pool carrying
 * a non-zero byteOffset; constructing a fresh view copies the bytes and
 * respects the offset, so Yjs never reads neighbouring memory.
 *
 * @param {Uint8Array|Buffer|ArrayBuffer} bytes
 * @returns {Uint8Array}
 */
export function toUint8Array(bytes) {
    if (bytes instanceof Uint8Array) {
        return new Uint8Array(bytes)
    }

    // Mongoose `.lean()` skips casting, so a Buffer field comes back as a raw
    // BSON Binary (the driver leaves subtype-0 binary un-promoted) rather than a
    // Node Buffer. Its `length` is a method, so the Buffer.from() fallback below
    // would silently yield an empty array and Yjs would fail to decode. Read the
    // bytes off its backing Buffer, bounded by the Binary's real length.
    if (bytes && bytes._bsontype === "Binary") {
        const buf = bytes.buffer
        return new Uint8Array(buf.buffer, buf.byteOffset, bytes.length())
    }

    return new Uint8Array(Buffer.from(bytes))
}

/**
 * True when a persisted state already carries a Tiptap document — i.e. the
 * "default" Y.XmlFragment has at least one child node.
 *
 * This is what distinguishes a migrated document from a pre-Tiptap one: the old
 * format put the body in a Y.Text named "content", which leaves the "default"
 * fragment empty. Undecodable state is reported as "not migrated" rather than
 * throwing, so one corrupt row can't halt a backfill.
 *
 * @param {Uint8Array|Buffer|null|undefined} state
 * @returns {boolean}
 */
export function hasTiptapFragment(state) {
    if (!state) return false

    try {
        const doc = new Y.Doc()
        Y.applyUpdate(doc, toUint8Array(state))
        return doc.getXmlFragment(CONTENT_FRAGMENT_NAME).length > 0
    } catch {
        return false
    }
}

/**
 * The plain string content of a Y.XmlText, ignoring formatting marks.
 * toDelta() yields [{ insert, attributes? }] runs; we want only the inserts.
 */
function textOfXmlText(node) {
    return node
        .toDelta()
        .map((op) => (typeof op.insert === "string" ? op.insert : ""))
        .join("")
}

/**
 * Flatten a node of the ProseMirror tree into block-level lines.
 *
 * A node whose children are all inline (a paragraph, a heading) yields one
 * line; a node with block children (the doc fragment, a blockquote, a list)
 * yields one line per descendant block. That mirrors how the document reads,
 * which is all the plaintext projection is for.
 *
 * @param {Y.XmlFragment|Y.XmlElement|Y.XmlText} node
 * @returns {string[]}
 */
function blockLines(node) {
    if (node instanceof Y.XmlText) {
        return [textOfXmlText(node)]
    }

    if (!(node instanceof Y.XmlElement || node instanceof Y.XmlFragment)) {
        return [""]
    }

    const children = node.toArray()

    if (children.length === 0) {
        return [""]
    }

    const hasBlockChildren = children.some(
        (child) => child instanceof Y.XmlElement && !INLINE_ELEMENTS.has(child.nodeName)
    )

    if (hasBlockChildren) {
        return children.flatMap(blockLines)
    }

    // Inline content: concatenate the runs, breaking a line on each hard break.
    const lines = [""]

    for (const child of children) {
        if (child instanceof Y.XmlElement && INLINE_ELEMENTS.has(child.nodeName)) {
            lines.push("")
        } else if (child instanceof Y.XmlText) {
            lines[lines.length - 1] += textOfXmlText(child)
        }
    }

    return lines
}

/**
 * Derive the plaintext projection of a document's body.
 *
 * The Yjs state is authoritative; this string exists so the dashboard, search,
 * and any other non-editor reader keep working without loading ProseMirror.
 * It is lossy by design — marks and node types are dropped, text is kept.
 *
 * @param {Y.Doc} doc
 * @returns {string}
 */
export function docToPlainText(doc) {
    const fragment = doc.getXmlFragment(CONTENT_FRAGMENT_NAME)
    return blockLines(fragment).join("\n").trim()
}

/**
 * Encode a plaintext string as a ProseMirror-shaped Y.XmlFragment: one
 * `paragraph` element per line, each holding a single Y.XmlText run.
 *
 * This is the exact shape Tiptap's Collaboration extension expects, so a
 * document encoded here opens in the editor as ordinary paragraphs. Used by the
 * backfill script and by document creation.
 *
 * @param {string} text
 * @returns {Buffer} encoded Yjs state
 */
export function encodeTextAsState(text) {
    const doc = new Y.Doc()
    const fragment = doc.getXmlFragment(CONTENT_FRAGMENT_NAME)

    const lines = String(text ?? "").split(/\r?\n/)

    // A trailing newline would otherwise add a stray empty paragraph at the end.
    while (lines.length > 1 && lines[lines.length - 1] === "") {
        lines.pop()
    }

    const paragraphs = lines.map((line) => {
        const paragraph = new Y.XmlElement("paragraph")
        // An empty paragraph must stay genuinely empty — inserting a zero-length
        // Y.XmlText would give ProseMirror an empty text node, which is invalid.
        if (line) {
            paragraph.insert(0, [new Y.XmlText(line)])
        }
        return paragraph
    })

    fragment.insert(0, paragraphs)

    return Buffer.from(Y.encodeStateAsUpdate(doc))
}

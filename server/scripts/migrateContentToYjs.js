import dotenv from "dotenv";
import mongoose from "mongoose";
import Document from "../src/models/Document.js";
import { encodeTextAsState, hasTiptapFragment } from "../src/services/ydocContent.js";

dotenv.config();

/* ═══════════════════════════════════════════════════════════════════════
   Backfill `Document.state` with a ProseMirror-shaped Yjs document.

   Two populations need encoding:

   1. Documents with no `state` at all (never migrated).
   2. Documents whose `state` holds the pre-Tiptap Y.Text named "content".
      Tiptap binds to a Y.XmlFragment named "default" — a different root type —
      so that state would open as a blank editor. These are re-encoded from
      their plaintext `content` projection into paragraphs.

   Both cases are detected by *decoding* the stored state and checking whether
   the "default" fragment has any content, so the script is idempotent: a
   document already carrying a Tiptap fragment is skipped, and re-running is a
   no-op. Dry-run by default; pass --write to persist.
   ═══════════════════════════════════════════════════════════════════════ */

const DEFAULT_BATCH_SIZE = 100;

function parseArgs(argv) {
    const options = {
        write: false,
        batchSize: DEFAULT_BATCH_SIZE,
    };

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];

        if (arg === "--write") {
            options.write = true;
            continue;
        }

        if (arg === "--dry-run") {
            options.write = false;
            continue;
        }

        if (arg === "--batch-size") {
            const value = Number(argv[index + 1]);
            if (!Number.isInteger(value) || value <= 0) {
                throw new Error("--batch-size must be a positive integer");
            }
            options.batchSize = value;
            index += 1;
            continue;
        }

        throw new Error(`Unknown argument: ${arg}`);
    }

    return options;
}

async function migrate({ write, batchSize }) {
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) {
        throw new Error("Missing required env variable: MONGO_URL");
    }

    await mongoose.connect(mongoUrl);

    let scanned = 0;
    let migrated = 0;
    let skipped = 0;

    // Every document is examined: the pre-Tiptap population has a non-null
    // `state`, so filtering on its absence (as the original backfill did) would
    // miss exactly the rows that need converting.
    const cursor = Document.find({})
        .select({ _id: 1, content: 1, state: 1 })
        .lean()
        .cursor();

    for await (const document of cursor) {
        scanned += 1;

        if (hasTiptapFragment(document.state)) {
            skipped += 1;
            continue;
        }

        const state = encodeTextAsState(document.content || "");

        if (write) {
            const result = await Document.updateOne(
                { _id: document._id },
                { $set: { state } }
            );
            migrated += result.modifiedCount;
        } else {
            migrated += 1;
        }

        if (scanned % batchSize === 0) {
            console.log(`Scanned ${scanned} documents...`);
        }
    }

    console.log(
        `${write ? "Migrated" : "Would migrate"} ${migrated} documents ` +
        `(${skipped} already on the Tiptap fragment, ${scanned} scanned).`
    );
}

async function main() {
    const options = parseArgs(process.argv.slice(2));

    try {
        await migrate(options);
    } finally {
        await mongoose.disconnect();
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});

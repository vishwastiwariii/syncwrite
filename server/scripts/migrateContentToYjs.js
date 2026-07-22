import dotenv from "dotenv";
import mongoose from "mongoose";
import * as Y from "yjs";
import Document from "../src/models/Document.js";

dotenv.config();

const CONTENT_TEXT_NAME = "content";
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

function encodeContentAsYjsState(content) {
    const doc = new Y.Doc();
    const text = doc.getText(CONTENT_TEXT_NAME);

    if (content) {
        text.insert(0, content);
    }

    return Buffer.from(Y.encodeStateAsUpdate(doc));
}

async function migrate({ write, batchSize }) {
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) {
        throw new Error("Missing required env variable: MONGO_URL");
    }

    await mongoose.connect(mongoUrl);

    const filter = {
        $or: [
            { state: { $exists: false } },
            { state: null },
        ],
    };

    let scanned = 0;
    let migrated = 0;

    const cursor = Document.find(filter)
        .select({ _id: 1, content: 1 })
        .lean()
        .cursor();

    for await (const document of cursor) {
        scanned += 1;
        const state = encodeContentAsYjsState(document.content || "");

        if (write) {
            const result = await Document.updateOne(
                {
                    _id: document._id,
                    $or: [
                        { state: { $exists: false } },
                        { state: null },
                    ],
                },
                { $set: { state } }
            );

            migrated += result.modifiedCount;
        } else {
            migrated += 1;
        }

        if (scanned % batchSize === 0) {
            console.log(`${write ? "Migrated" : "Would migrate"} ${scanned} documents...`);
        }
    }

    console.log(`${write ? "Migrated" : "Would migrate"} ${migrated} documents.`);
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

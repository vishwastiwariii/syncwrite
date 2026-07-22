import { useEffect, useState } from "react";
import * as Y from "yjs";
import {
    Awareness,
    encodeAwarenessUpdate,
    applyAwarenessUpdate,
} from "y-protocols/awareness";
import { createSocket } from "../services/socket";
import {
    CONTENT_TEXT_NAME,
    SERVER_ORIGIN,
    toUint8Array,
    isEmptyUpdate,
    colorFromId,
} from "../services/ydoc";

/* ═══════════════════════════════════════════════════════════════════════
   useCollaborativeDocument

   Owns the client Y.Doc for one document and keeps it in sync with the server
   over Socket.IO. Replaces the old snapshot flow (DOCUMENT_UPDATE / _UPDATED /
   VERSION_ACK / VERSION_CONFLICT) and the old PRESENCE_UPDATE list.

   Returns { doc, ytext, users, status } where `ytext` is the shared body the
   editor binds its textarea to, and `users` is the deduped presence list.
   ═══════════════════════════════════════════════════════════════════════ */
export function useCollaborativeDocument(documentId, user) {
    const [status, setStatus] = useState("connecting"); // connecting → synced
    const [users, setUsers] = useState([]);
    // Exposed as state (not a ref) so the editor's bind effect re-runs the
    // moment the shared type is ready.
    const [ytext, setYtext] = useState(null);

    useEffect(() => {
        if (!documentId || !user?.id) return;

        const socket = createSocket();

        const doc = new Y.Doc();
        const sharedText = doc.getText(CONTENT_TEXT_NAME);
        const awareness = new Awareness(doc);

        // The Y.Doc is an external resource created here (in the effect) so its
        // lifecycle matches the subscription — publishing its shared type to
        // React state is the sanctioned "subscribe to an external system" case,
        // and lets the editor's bind effect run once the doc is ready.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setYtext(sharedText);

        // Publish who we are so peers can render our avatar and (later) cursor.
        awareness.setLocalStateField("user", {
            id: user.id,
            name: user.name,
            color: colorFromId(user.id),
        });

        /* ── Presence list, deduped by user id (one avatar per person, not per
              tab), recomputed whenever anyone's awareness changes. ── */
        const computeUsers = () => {
            const byId = new Map();
            awareness.getStates().forEach((state) => {
                const u = state?.user;
                if (u?.id && !byId.has(u.id)) {
                    byId.set(u.id, { userId: u.id, username: u.name, color: u.color });
                }
            });
            setUsers(Array.from(byId.values()));
        };
        awareness.on("change", computeUsers);

        /* ── Outbound: local doc edits → server. Server-origin changes are the
              ones we just received, so we must not echo them back. ── */
        const onDocUpdate = (update, origin) => {
            if (origin === SERVER_ORIGIN) return;
            socket.emit("Y_UPDATE", { documentId, update });
        };
        doc.on("update", onDocUpdate);

        /* ── Outbound: local awareness (cursor/presence) → server. ── */
        const onAwarenessUpdate = ({ added, updated, removed }, origin) => {
            if (origin === SERVER_ORIGIN) return;
            const changed = [...added, ...updated, ...removed];
            const update = encodeAwarenessUpdate(awareness, changed);
            socket.emit("Y_AWARENESS", { documentId, update });
        };
        awareness.on("update", onAwarenessUpdate);

        /* ── The sync handshake: announce our state vector; the server replies
              with the delta we're missing (plus its own vector). ── */
        const join = () => {
            socket.emit("Y_JOIN", {
                documentId,
                stateVector: Y.encodeStateVector(doc),
            });
        };

        const onSync = ({ documentId: id, update, stateVector }) => {
            if (id !== documentId) return;

            Y.applyUpdate(doc, toUint8Array(update), SERVER_ORIGIN);

            // Push anything the server is missing (our offline edits, if any).
            const reply = Y.encodeStateAsUpdate(doc, toUint8Array(stateVector));
            if (!isEmptyUpdate(reply)) {
                socket.emit("Y_UPDATE", { documentId, update: reply });
            }

            setStatus("synced");
        };

        const onRemoteUpdate = ({ documentId: id, update }) => {
            if (id !== documentId) return;
            Y.applyUpdate(doc, toUint8Array(update), SERVER_ORIGIN);
        };

        const onRemoteAwareness = ({ documentId: id, update }) => {
            if (id !== documentId) return;
            applyAwarenessUpdate(awareness, toUint8Array(update), SERVER_ORIGIN);
        };

        // The room was evicted server-side (everyone had left) between our edit
        // and its arrival — re-run the handshake to reload state.
        const onResync = ({ documentId: id }) => {
            if (id !== documentId) return;
            join();
        };

        const onError = ({ message }) => {
            console.error("[Yjs socket]", message);
        };

        socket.on("Y_SYNC", onSync);
        socket.on("Y_UPDATE", onRemoteUpdate);
        socket.on("Y_AWARENESS", onRemoteAwareness);
        socket.on("Y_RESYNC", onResync);
        socket.on("ERROR", onError);
        socket.on("connect", join);

        // Already connected (socket singleton reused across navigations)? Join now.
        if (socket.connected) join();

        return () => {
            // Broadcast our departure, then tear down local listeners. We leave
            // the socket singleton connected — it's reused, not owned here.
            socket.emit("Y_LEAVE", { documentId });
            awareness.setLocalState(null);

            socket.off("Y_SYNC", onSync);
            socket.off("Y_UPDATE", onRemoteUpdate);
            socket.off("Y_AWARENESS", onRemoteAwareness);
            socket.off("Y_RESYNC", onResync);
            socket.off("ERROR", onError);
            socket.off("connect", join);

            awareness.off("change", computeUsers);
            awareness.off("update", onAwarenessUpdate);
            doc.off("update", onDocUpdate);

            awareness.destroy();
            doc.destroy();

            setYtext(null);
        };
    }, [documentId, user?.id, user?.name]);

    return { ytext, users, status };
}

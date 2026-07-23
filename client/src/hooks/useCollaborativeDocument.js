import { useEffect, useState } from "react";
import * as Y from "yjs";
import {
    Awareness,
    encodeAwarenessUpdate,
    applyAwarenessUpdate,
} from "y-protocols/awareness";
import { createSocket } from "../services/socket";
import {
    SERVER_ORIGIN,
    toUint8Array,
    isEmptyUpdate,
    colorFromId,
} from "../services/ydoc";

/* ═══════════════════════════════════════════════════════════════════════
   useCollaborativeDocument

   Owns the client Y.Doc + Awareness for one document and keeps them in sync
   with the server over Socket.IO. The transport is deliberately editor-
   agnostic: it relays opaque binary CRDT updates and never inspects the shared
   type. The body now lives in a Y.XmlFragment (Tiptap/ProseMirror) rather than
   a Y.Text, but nothing in this file changes for that — the handshake and relay
   are byte-for-byte the same.

   Returns { doc, awareness, users, status }:
     - `doc` / `awareness` are handed to the Tiptap Collaboration +
       CollaborationCaret extensions, which bind the editor to them.
     - `users` is the presence list, deduped by user id (one avatar per person).
     - `status` is "connecting" → "synced".
   ═══════════════════════════════════════════════════════════════════════ */
export function useCollaborativeDocument(documentId, user) {
    const [status, setStatus] = useState("connecting"); // connecting → synced
    const [users, setUsers] = useState([]);
    // Exposed as state (not refs) so the editor mounts the moment the doc +
    // awareness are ready.
    const [doc, setDoc] = useState(null);
    const [awareness, setAwareness] = useState(null);

    useEffect(() => {
        if (!documentId || !user?.id) return;

        const socket = createSocket();

        const ydoc = new Y.Doc();
        const awarenessInstance = new Awareness(ydoc);

        // The Y.Doc + Awareness are external resources created here (in the
        // effect) so their lifecycle matches the subscription — publishing them
        // to React state is the sanctioned "subscribe to an external system"
        // case, and lets the editor mount once they're ready.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDoc(ydoc);
        setAwareness(awarenessInstance);

        // Publish who we are so peers can render our avatar and caret. Tiptap's
        // CollaborationCaret also writes this same `user` field (from its `user`
        // option); setting it here too keeps the presence list populated even
        // before the editor mounts, and the values are identical so there's no
        // fight.
        awarenessInstance.setLocalStateField("user", {
            id: user.id,
            name: user.name,
            color: colorFromId(user.id),
        });

        /* ── Presence list, deduped by user id (one avatar per person, not per
              tab), recomputed whenever anyone's awareness changes. ── */
        const computeUsers = () => {
            const byId = new Map();
            awarenessInstance.getStates().forEach((state) => {
                const u = state?.user;
                if (u?.id && !byId.has(u.id)) {
                    byId.set(u.id, { userId: u.id, username: u.name, color: u.color });
                }
            });
            setUsers(Array.from(byId.values()));
        };
        awarenessInstance.on("change", computeUsers);

        /* ── Outbound: local doc edits → server. Server-origin changes are the
              ones we just received, so we must not echo them back. ── */
        const onDocUpdate = (update, origin) => {
            if (origin === SERVER_ORIGIN) return;
            socket.emit("Y_UPDATE", { documentId, update });
        };
        ydoc.on("update", onDocUpdate);

        /* ── Outbound: local awareness (cursor/presence) → server. ── */
        const onAwarenessUpdate = ({ added, updated, removed }, origin) => {
            if (origin === SERVER_ORIGIN) return;
            const changed = [...added, ...updated, ...removed];
            const update = encodeAwarenessUpdate(awarenessInstance, changed);
            socket.emit("Y_AWARENESS", { documentId, update });
        };
        awarenessInstance.on("update", onAwarenessUpdate);

        /* ── The sync handshake: announce our state vector; the server replies
              with the delta we're missing (plus its own vector). ── */
        const join = () => {
            socket.emit("Y_JOIN", {
                documentId,
                stateVector: Y.encodeStateVector(ydoc),
            });
        };

        const onSync = ({ documentId: id, update, stateVector }) => {
            if (id !== documentId) return;

            Y.applyUpdate(ydoc, toUint8Array(update), SERVER_ORIGIN);

            // Push anything the server is missing (our offline edits, if any).
            const reply = Y.encodeStateAsUpdate(ydoc, toUint8Array(stateVector));
            if (!isEmptyUpdate(reply)) {
                socket.emit("Y_UPDATE", { documentId, update: reply });
            }

            setStatus("synced");
        };

        const onRemoteUpdate = ({ documentId: id, update }) => {
            if (id !== documentId) return;
            Y.applyUpdate(ydoc, toUint8Array(update), SERVER_ORIGIN);
        };

        const onRemoteAwareness = ({ documentId: id, update }) => {
            if (id !== documentId) return;
            applyAwarenessUpdate(awarenessInstance, toUint8Array(update), SERVER_ORIGIN);
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
            awarenessInstance.setLocalState(null);

            socket.off("Y_SYNC", onSync);
            socket.off("Y_UPDATE", onRemoteUpdate);
            socket.off("Y_AWARENESS", onRemoteAwareness);
            socket.off("Y_RESYNC", onResync);
            socket.off("ERROR", onError);
            socket.off("connect", join);

            awarenessInstance.off("change", computeUsers);
            awarenessInstance.off("update", onAwarenessUpdate);
            ydoc.off("update", onDocUpdate);

            awarenessInstance.destroy();
            ydoc.destroy();

            setDoc(null);
            setAwareness(null);
        };
    }, [documentId, user?.id, user?.name]);

    return { doc, awareness, users, status };
}

import { useEffect, useRef, useCallback } from "react";
import { createSocket, disconnectSocket } from "../services/socket";

/**
 * useSocket Hook
 * 
 * Provides a clean abstraction for socket communication.
 * Handles connection, disconnection, and event management.
 * 
 * @param {string} documentId - The ID of the document to join.
 * @returns {Object} - { emit, on }
 */
export const useSocket = (documentId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!documentId) return;

    const socket = createSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      socket.emit("JOIN_DOCUMENT", { documentId });
      console.log("[useSocket] Joined document room:", documentId);
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);

    return () => {
      console.log("[useSocket] Cleaning up socket for document:", documentId);
      socket.off("connect", handleConnect);
      disconnectSocket();
      socketRef.current = null;
    };
  }, [documentId]);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`[useSocket] Cannot emit ${event}, socket not connected`);
    }
  }, []);

  const on = useCallback((event, callback) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    socket.on(event, callback);
    return () => socket.off(event, callback);
  }, []);

  return { emit, on };
};

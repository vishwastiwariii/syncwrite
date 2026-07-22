import React from "react";
import { colorFor, initialOf } from "../../utils/presence";

/* Overlapping avatar stack for everyone currently in the document.
   Fed by Yjs awareness state (deduped by user id, one avatar per person). */
export default function PresenceStack({ users = [], max = 3 }) {
  if (!users.length) return null;

  return (
    <div className="flex items-center" title={`${users.length} editing now`}>
      {users.slice(0, max).map((u, i) => (
        <span
          key={u.userId || i}
          title={u.username || "Anonymous"}
          className="grid h-[30px] w-[30px] place-items-center rounded-full border-2 border-white text-[11px] font-semibold text-white"
          style={{ background: colorFor(i), marginLeft: i ? -9 : 0, zIndex: 10 - i }}
        >
          {initialOf(u.username)}
        </span>
      ))}
      {users.length > max && (
        <span
          className="grid h-[30px] w-[30px] place-items-center rounded-full border-2 border-white bg-sw-violet-2 text-[10px] font-semibold text-sw-muted"
          style={{ marginLeft: -9 }}
        >
          +{users.length - max}
        </span>
      )}
    </div>
  );
}

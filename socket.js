import { io } from "socket.io-client";

// Backend URL
const SOCKET_SERVER_URL = "http://localhost:5000";

export const socket = io(SOCKET_SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"]
});

// BroadcastChannel fallback for cross-tab sync in same browser session
export const broadcastChannel = typeof window !== "undefined" && window.BroadcastChannel
  ? new BroadcastChannel("smart_campus_sync")
  : null;

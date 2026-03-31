import { io } from "socket.io-client";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";


let socket = null 


export const createSocket = () => {
  if(socket) return socket; 
  const token = localStorage.getItem("token");

  socket = io(SOCKET_URL, {
    auth: { token },
  });

  return socket;
};


export const getSocket = () => {
  if(!socket){
    throw new Error("Socket not initialized")
  }

  return socket
}


export const disconnectSocket = () => {
  if(socket) {
    socket.disconnect();
    socket = null;
  }
}
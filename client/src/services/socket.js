import { io } from "socket.io-client";
const SOCKET_URL = "http://localhost:5000";


const createSocket = () => {
  const token = localStorage.getItem("token");

  return io(SOCKET_URL, {
    auth: { token },
  });
};

export default createSocket
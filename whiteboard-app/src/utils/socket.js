import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // change when deployed
export default socket;




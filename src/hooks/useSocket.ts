import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		console.log("Initializing socket connection...");

		const newSocket = io(process.env.NEXT_PUBLIC_APP_URL || "http://hitster.dataupload.xyz/", {
			path: "/socket.io",
			transports: ["websocket", "polling"],
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			autoConnect: true,
		});

		newSocket.on("connect", () => {
			console.log("Socket connected with ID:", newSocket.id);
			setSocket(newSocket);
		});

		newSocket.on("connect_error", (error) => {
			console.error("Socket connection error:", error);
			setSocket(null);
		});

		newSocket.on("disconnect", (reason) => {
			console.log("Socket disconnected:", reason);
			setSocket(null);
		});

		newSocket.onAny((eventName, ...args) => {
			console.log(`Event received on client: ${eventName}`, args);
		});

		return () => {
			console.log("Cleaning up socket connection...");
			newSocket.disconnect();
			setSocket(null);
		};
	}, []);

	return socket;
}

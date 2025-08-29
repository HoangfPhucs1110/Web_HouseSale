import { io } from 'socket.io-client';

const ORIGIN =
  (import.meta.env.VITE_SOCKET_ORIGIN || '').trim() ||
  (typeof window !== 'undefined' ? window.location.origin : '');

export const socket = io(ORIGIN, {
  withCredentials: true,
  transports: ['websocket'],
});

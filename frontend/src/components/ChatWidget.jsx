import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

export default function ChatWidget({ listingId }) {
  const { currentUser } = useSelector((s) => s.user);
  const me = currentUser?.rest?._id || currentUser?._id || null;

  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [seller, setSeller] = useState(null); // { id, username, email }

  const API_BASE = import.meta.env.VITE_API_BASE || '/api';
  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_SOCKET_ORIGIN || 'http://localhost:3000', {
        withCredentials: true,
      }),
    []
  );

  const boxRef = useRef(null);

  // Identify user (để server gom theo user room, nhận thông báo inbox/new & pending)
  useEffect(() => {
    const uid = me;
    if (uid) socket.emit('identify', uid);
  }, [socket, me]);

  // Mở widget -> tạo/lấy conversation + nạp lịch sử
  useEffect(() => {
    if (!open) return;
    (async () => {
      const r = await fetch(`${API_BASE}/chat/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ listingId }),
      });
      if (r.status === 401) {
        alert('Bạn cần đăng nhập để nhắn với người bán.');
        return;
      }
      const d = await r.json();
      if (!r.ok) {
        alert(d?.message || 'Không tạo được cuộc trò chuyện');
        return;
      }
      setConversationId(d.conversationId);
      setSeller(d.seller || null);

      const r2 = await fetch(`${API_BASE}/chat/messages/${d.conversationId}`, {
        credentials: 'include',
      });
      const d2 = await r2.json();
      setMessages(d2?.items || []);
      socket.emit('join', d.conversationId);

      // đánh dấu đã đọc toàn bộ tin nhắn đến
      await fetch(`${API_BASE}/chat/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ conversationId: d.conversationId }),
      });
    })();
  }, [open]);

  // Realtime nhận tin mới trong cùng conversation
  useEffect(() => {
    function onNew({ conversationId: cid, message }) {
      if (cid === conversationId) setMessages((prev) => [...prev, message]);
    }
    socket.on('message:new', onNew);
    return () => socket.off('message:new', onNew);
  }, [socket, conversationId]);

  // Tự cuộn xuống cuối
  useEffect(() => {
    if (!boxRef.current) return;
    boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages, open]);

  async function send() {
    if (!text.trim() || !conversationId) return;
    const r = await fetch(`${API_BASE}/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ conversationId, text }),
    });
    const d = await r.json();
    if (d?.message) {
      // push local; server sẽ phát cho người còn lại (không bị nhân đôi)
      setMessages((prev) => [...prev, d.message]);
      socket.emit('message:send', { conversationId, message: d.message });
      setText('');
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-slate-900 text-white px-4 py-3 shadow-lg hover:opacity-90"
      >
        {open ? 'Đóng chat' : 'Chat với người bán'}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-40 w-80 max-w-[90vw] rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="px-4 py-3 border-b text-sm font-semibold">
            Trao đổi với người bán
            {seller?.email ? (
              <div className="text-xs font-normal text-slate-500 mt-1">
                Email: <a href={`mailto:${seller.email}`} className="underline">{seller.email}</a>
              </div>
            ) : (
              <div className="text-xs font-normal text-slate-400 mt-1">
                Email: (không có)
              </div>
            )}
          </div>

          <div ref={boxRef} className="h-72 overflow-y-auto px-3 py-2 space-y-2">
            {messages.map((m) => {
              const isMine = me && String(m.sender) === String(me);
              return (
                <div key={m._id} className={`text-sm flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`px-3 py-2 rounded-lg max-w-[85%] break-words ${
                      isMine ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
                    }`}
                    title={new Date(m.createdAt).toLocaleString()}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 p-3 border-t">
            <input
              className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
              placeholder="Nhập tin nhắn…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button onClick={send} className="rounded-lg bg-slate-900 text-white px-3 py-2 text-sm">
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}

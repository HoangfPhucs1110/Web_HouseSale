import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const fmtTime = (d) => new Date(d).toLocaleString();

export default function GlobalChat() {
  const { currentUser } = useSelector((s) => s.user);
  const me = currentUser?.rest?._id || currentUser?._id || null;

  const API = import.meta.env.VITE_API_BASE || '/api';
  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_SOCKET_ORIGIN || 'http://localhost:3000', {
        withCredentials: true,
      }),
    []
  );

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('list'); // list | chat
  const [convos, setConvos] = useState([]); // [{ _id, listingId, lastMessage, updatedAt, peer:{email,username,id}}]
  const [unreadMap, setUnreadMap] = useState({}); // {conversationId: count}
  const [active, setActive] = useState(null); // conversationId
  const [activePeer, setActivePeer] = useState(null); // {email, username}
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const boxRef = useRef(null);

  // Set chống trùng theo message._id
  const seenIdsRef = useRef(new Set());

  // Identify user ngay khi đăng nhập
  useEffect(() => {
    if (me) socket.emit('identify', me);
  }, [socket, me]);

  // Load danh sách hội thoại (chỉ các convo đã có tin nhắn) + badge chưa đọc
  async function loadInbox() {
    if (!me) return;
    const r1 = await fetch(`${API}/chat/conversations`, { credentials: 'include' });
    const d1 = await r1.json();
    if (r1.ok) setConvos(d1.items || []);

    const r2 = await fetch(`${API}/chat/pending`, { credentials: 'include' });
    const d2 = await r2.json();
    if (r2.ok) {
      const map = {};
      (d2.items || []).forEach((i) => {
        map[i.conversationId] = i.unread;
      });
      setUnreadMap(map);
    }
  }

  // Mở widget -> nạp inbox
  useEffect(() => {
    if (open) loadInbox();
  }, [open]);

  // Realtime: chỉ cập nhật danh sách/badge khi có inbox:new (KHÔNG thêm vào messages để tránh lặp)
  useEffect(() => {
    function onInbox({ conversationId, message }) {
      setConvos((prev) => {
        const next = [...prev];
        const idx = next.findIndex((c) => c._id === conversationId);
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            lastMessage: message?.text || next[idx].lastMessage,
            updatedAt: message?.createdAt || next[idx].updatedAt,
          };
          const [item] = next.splice(idx, 1);
          next.unshift(item);
        } else {
          next.unshift({
            _id: conversationId,
            lastMessage: message?.text || '',
            updatedAt: message?.createdAt || new Date().toISOString(),
            peer: null,
          });
        }
        return next;
      });
      setUnreadMap((m) => ({
        ...m,
        [conversationId]: (m[conversationId] || 0) + (active === conversationId ? 0 : 1),
      }));
      // ⛔ KHÔNG chạm vào messages ở đây
    }
    socket.on('inbox:new', onInbox);
    return () => socket.off('inbox:new', onInbox);
  }, [socket, active]);

  // Realtime: nhận tin nhắn thực của đoạn đang mở (message:new) + chống trùng
  useEffect(() => {
    function onNew({ conversationId: cid, message }) {
      if (cid !== active) return;
      const id = String(message._id);
      if (seenIdsRef.current.has(id)) return; // đã có -> bỏ qua
      seenIdsRef.current.add(id);
      setMessages((prev) => [...prev, message]);
    }
    socket.on('message:new', onNew);
    return () => socket.off('message:new', onNew);
  }, [socket, active]);

  // Autoscroll
  useEffect(() => {
    if (!boxRef.current) return;
    boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages, tab]);

  // Mở một hội thoại: join room + load lịch sử + reset seenIds + đánh dấu đã đọc
  async function openConversation(conversationId, peerFromList = null) {
    setActive(conversationId);
    setActivePeer(peerFromList || null);
    setTab('chat');
    socket.emit('join', conversationId);

    const r = await fetch(`${API}/chat/messages/${conversationId}`, { credentials: 'include' });
    const d = await r.json();
    if (r.ok) {
      const items = d.items || [];
      seenIdsRef.current = new Set(items.map((m) => String(m._id))); // reset dấu vết
      setMessages(items);
    }

    await fetch(`${API}/chat/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ conversationId }),
    });
    setUnreadMap((m) => ({ ...m, [conversationId]: 0 }));
  }

  // Cho phép trang chi tiết bắn sự kiện để mở chat theo listingId
  useEffect(() => {
    async function handler(e) {
      const listingId = e?.detail?.listingId;
      if (!listingId) return;
      setOpen(true);
      const r = await fetch(`${API}/chat/conversations`, {
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

      // cập nhật người kia (seller) từ server (để hiển thị gmail trên header)
      if (d?.seller) setActivePeer({ email: d.seller.email, username: d.seller.username });

      await openConversation(d.conversationId);
      // Sau khi mở xong, refresh inbox để có peer/email đầy đủ trong list
      loadInbox();
    }
    window.addEventListener('open-chat-with-listing', handler);
    return () => window.removeEventListener('open-chat-with-listing', handler);
  }, []);

  // Gửi tin: push local 1 lần (đánh dấu chống trùng) + emit socket
  async function send() {
    if (!text.trim() || !active) return;
    const r = await fetch(`${API}/chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ conversationId: active, text }),
    });
    const d = await r.json();
    if (d?.message) {
      const id = String(d.message._id);
      if (!seenIdsRef.current.has(id)) {
        seenIdsRef.current.add(id);
        setMessages((prev) => [...prev, d.message]); // push local 1 lần
      }
      socket.emit('message:send', { conversationId: active, message: d.message });
      setText('');

      // cập nhật preview danh sách + move lên đầu
      setConvos((lst) => {
        const next = [...lst];
        const idx = next.findIndex((c) => c._id === active);
        if (idx >= 0) {
          next[idx] = { ...next[idx], lastMessage: d.message.text, updatedAt: d.message.createdAt };
          const [item] = next.splice(idx, 1);
          next.unshift(item);
        }
        return next;
      });
    }
  }

  const unreadTotal = Object.values(unreadMap).reduce((a, b) => a + (b || 0), 0);
  const headerPeer = activePeer || convos.find((c) => c._id === active)?.peer || null;

  return (
    <>
      {me && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="fixed bottom-5 right-5 z-50 rounded-full bg-slate-900 text-white px-4 py-3 shadow-xl hover:opacity-90"
        >
          Messages{' '}
          {unreadTotal > 0 && (
            <span className="ml-2 inline-flex items-center justify-center text-xs rounded-full bg-red-500 text-white w-5 h-5">
              {unreadTotal > 9 ? '9+' : unreadTotal}
            </span>
          )}
        </button>
      )}

      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-[360px] max-w-[92vw] bg-white rounded-2xl shadow-2xl border">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="font-semibold">Messages</div>
            <button className="text-slate-500 hover:text-slate-900" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <div className="px-3 pt-2 flex gap-2">
            <button
              className={`px-3 py-2 rounded-lg text-sm ${tab === 'list' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}
              onClick={() => setTab('list')}
            >
              Hộp thư
            </button>
            <button
              className={`px-3 py-2 rounded-lg text-sm ${tab === 'chat' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}
              onClick={() => active && setTab('chat')}
            >
              Đoạn chat
            </button>
          </div>

          {tab === 'list' ? (
            <div className="max-h-[420px] overflow-y-auto">
              {convos.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">Chưa có hội thoại.</div>
              ) : (
                convos.map((c) => {
                  const unread = unreadMap[c._id] || 0;
                  const title = c.peer?.email || c.peer?.username || 'Đoạn chat';
                  return (
                    <button
                      key={c._id}
                      onClick={() => openConversation(c._id, c.peer || null)}
                      className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 border-b"
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                        💬
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium truncate">{title}</div>
                          <div className="text-xs text-slate-500">{c.updatedAt ? fmtTime(c.updatedAt) : ''}</div>
                        </div>
                        <div className="text-sm text-slate-600 truncate">
                          {c.lastMessage || 'Bắt đầu cuộc trò chuyện'}
                        </div>
                      </div>
                      {unread > 0 && (
                        <span className="ml-2 mt-1 inline-flex items-center justify-center text-[10px] rounded-full bg-red-500 text-white w-4 h-4">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="px-4 py-2 border-b text-sm text-slate-600">
                {headerPeer?.email || headerPeer?.username || 'Đoạn chat'}
              </div>

              <div ref={boxRef} className="px-3 py-2 max-h-[360px] min-h-[240px] overflow-y-auto space-y-2">
                {messages.map((m) => {
                  const mine = me && String(m.sender) === String(me);
                  return (
                    <div key={m._id} className={`text-sm flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`px-3 py-2 rounded-lg max-w-[85%] break-words ${
                          mine ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
                        }`}
                        title={fmtTime(m.createdAt)}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <div className="text-center text-sm text-slate-500 py-8">Chưa có tin nhắn.</div>
                )}
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
        </div>
      )}
    </>
  );
}

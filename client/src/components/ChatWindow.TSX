import { useEffect, useRef, useState } from "react";
import API from "../api/User";
import MessageInput from "./MessageInput";

export default function ChatWindow({ selectedChat, user }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // FETCH MESSAGES
  useEffect(() => {
    if (!selectedChat?._id) return;

    const fetchMessages = async () => {
      const res = await API.get(`/messages/${selectedChat._id}`);
      setMessages(res.data.data || []);
    };

    fetchMessages();
  }, [selectedChat]);

  // AUTO SCROLL
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const res = await API.post("/messages", {
      requestId: selectedChat._id,
      text,
    });

    setMessages((prev) => [...prev, res.data.data]);
  };

  if (!selectedChat) {
    return <div className="flex-1 flex items-center justify-center">Select chat</div>;
  }

  return (
    <div className="flex-1 flex flex-col">

      {/* HEADER */}
      <div className="p-4 border-b font-bold">
        {selectedChat.styleId?.title}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.senderId === user._id ? "justify-end" : "justify-start"
            }`}
          >
            <div className={`p-3 rounded ${
              m.senderId === user._id
                ? "bg-black text-white"
                : "bg-gray-200"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* INPUT */}
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
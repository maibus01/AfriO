export default function ChatSidebar({
  conversations,
  selectedChat,
  setSelectedChat,
  isTailor,
}: any) {
  const getName = (chat: any) =>
    isTailor
      ? chat.customerId?.name
      : chat.businessId?.name || chat.tailorId?.name;

  return (
    <div className="w-[350px] border-r bg-white overflow-y-auto">
      {conversations.map((chat: any) => (
        <div
          key={chat._id}
          onClick={() => setSelectedChat(chat)}
          className={`p-4 cursor-pointer ${
            selectedChat?._id === chat._id ? "bg-orange-100" : ""
          }`}
        >
          <h4 className="font-bold">{getName(chat)}</h4>
          <p className="text-xs text-gray-400">
            {chat.styleId?.title}
          </p>
        </div>
      ))}
    </div>
  );
}
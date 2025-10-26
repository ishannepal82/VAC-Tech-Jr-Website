import { useState } from "react";
import {
  ArrowBigRightDash,
  Bell,
  FolderGit2,
  CalendarClock,
  CheckCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const initialNotifications = [
  {
    id: 1,
    type: "project",
    title: "New Pull Request in 'Club-Website-V2'",
    description: "User 'alex_dev' submitted a PR for the new auth flow.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    isRead: false,
  },
  {
    id: 2,
    type: "event",
    title: "Reminder: 'Intro to Docker' workshop tomorrow",
    description: "The workshop starts at 2 PM. Don't forget to register!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    isRead: false,
  },
  {
    id: 3,
    type: "system",
    title: "Your project 'AI Chatbot' has been approved!",
    description: "You can now start assembling your team and resources.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true,
  },
  {
    id: 4,
    type: "project",
    title: "Comment on your issue in 'Data-Visualizer'",
    description:
      "'jane_doe' replied: 'I think I have a fix for this. Pushing now.'",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    isRead: true,
  },
  {
    id: 5,
    type: "event",
    title: "Feedback requested for 'CodeFest 2024'",
    description: "Please share your thoughts on the event to help us improve.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    isRead: false,
  },
  {
    id: 6,
    type: "project",
    title: "Comment on your issue in 'Data-Visualizer'",
    description:
      "'jane_doe' replied: 'I think I have a fix for this. Pushing now.'",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    isRead: true,
  },
];

// --- Helper to get an icon based on notification type ---
const getIconForType = (type: any) => {
  switch (type) {
    case "project":
      return <FolderGit2 className="text-blue-300" size={24} />;
    case "event":
      return <CalendarClock className="text-green-300" size={24} />;
    case "system":
      return <Bell className="text-yellow-300" size={24} />;
    default:
      return <Bell className="text-gray-400" size={24} />;
  }
};

const NotificationItem = ({ notification, onClick }: any) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-start p-4 border-b border-[#254b80] last:border-b-0 cursor-pointer transition-colors duration-200 ${
        notification.isRead
          ? "hover:bg-[#112244]"
          : "bg-[#112244]/50 hover:bg-[#112244]"
      }`}
    >
      <div className="relative flex-shrink-0 mr-4 mt-1">
        {getIconForType(notification.type)}
        {!notification.isRead && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        )}
      </div>
      <div className="flex-grow">
        <p
          className={`font-semibold ${
            notification.isRead ? "text-gray-300" : "text-white"
          }`}
        >
          {notification.title}
        </p>
        <p className="text-sm text-gray-400 mt-1">{notification.description}</p>
        <p className="text-xs text-blue-300/70 mt-2">
          {formatDistanceToNow(new Date(notification.timestamp), {
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  );
};

// --- The Main Notification Component ---
const Notification = ({ onClose }: any) => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleNotificationClick = (id: any) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <>
      <div className="fixed inset-0 w-full h-screen flex items-center justify-center m-auto bg-black/50 backdrop-blur-sm z-50 p-4">
        <div className="w-full max-w-4xl h-[80vh] max-h-[700px] bg-[#1a2f55] rounded-3xl flex flex-col shadow-2xl">
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#254b80]">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-300">
              Mail Box
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 text-sm text-blue-300 hover:text-white transition-colors duration-200"
                title="Mark all as read"
              >
                <CheckCheck size={20} />
                <span className="hidden sm:inline">Mark All as Read</span>
              </button>
              <button onClick={onClose} className="transition" title="Close">
                <ArrowBigRightDash
                  size={30}
                  className="text-blue-300 hover:text-blue-400 hover:scale-110 transition-transform"
                />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-grow w-full bg-[#0a1a33] rounded-b-3xl overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="p-4">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
                <Bell size={48} className="mb-4" />
                <h3 className="text-xl font-semibold text-gray-400">
                  All caught up!
                </h3>
                <p>You have no new notifications.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notification;

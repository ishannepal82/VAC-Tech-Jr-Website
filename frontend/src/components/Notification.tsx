import { useState, useEffect } from "react";
import {
  ArrowBigRightDash,
  Bell,
  FolderGit2,
  CircleX,
  CalendarClock,
  CheckCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Match your backend response structure
interface NotificationItem {
  title: string;
  message: string;
  type: string;
  to_email: string;
  project_id: string;
  from_email: string;
  read_status: boolean;
  created_at: string; // Firestore timestamp
}

const getIconForType = (type: string) => {
  switch (type) {
    case "project":
    case "approval":
      return <FolderGit2 className="text-blue-300" size={24} />;
    case "event":
    case "admin":
      return <CalendarClock className="text-green-300" size={24} />;
    case "info":
    default:
      return <Bell className="text-yellow-300" size={24} />;
  }
};

const NotificationItem = ({
  notification,
  onRead,
}: {
  notification: NotificationItem;
  onRead: () => void;
}) => {
  const timestamp = new Date(notification.created_at);

  return (
    <div
      onClick={onRead}
      className={`flex items-start p-4 border-b border-[#254b80] last:border-b-0 cursor-pointer transition-colors duration-200 ${
        notification.read_status
          ? "hover:bg-[#112244]"
          : "bg-[#112244]/50 hover:bg-[#112244]"
      }`}
    >
      <div className="relative flex-shrink-0 mr-4 mt-1">
        {getIconForType(notification.type)}
        {!notification.read_status && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        )}
      </div>
      <div className="flex-grow">
        <p
          className={`font-semibold ${
            notification.read_status ? "text-gray-300" : "text-white"
          }`}
        >
          {notification.title}
        </p>
        <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
        <p className="text-xs text-blue-300/70 mt-2">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </p>
      </div>
      {notification.type === "approval" && (
        <div className="flex gap-4 items-center">
          <button className="text-white bg-green-800 hover:bg-green-700 p-2 rounded">
            <CheckCheck size={24} />
          </button>
          <button className="text-white bg-red-800 hover:bg-red-600 p-2 rounded">
            <CircleX size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

const Notification = ({ onClose }: { onClose: () => void }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const baseUrl = import.meta.env.DEV ? "http://127.0.0.1:5000" : "";
      const res = await fetch(
        `${baseUrl}/api/notifications/get-notifications`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // For now, just mark as read in UI (you can add PUT request later if needed)
  const handleNotificationClick = (index: number) => {
    const updated = [...notifications];
    updated[index] = { ...updated[index], read_status: true };
    setNotifications(updated);
    // TODO: Optionally call PUT /mark-read/:id
  };

  const handleMarkAllAsRead = () => {
    setNotifications((notifs) =>
      notifs.map((n) => ({ ...n, read_status: true }))
    );
    // TODO: Optionally call POST /mark-all-read
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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

          <div className="flex-grow w-full bg-[#0a1a33] rounded-b-3xl overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full text-white">
                Loading notifications...
              </div>
            ) : notifications.length > 0 ? (
              <div className="p-4">
                {notifications.map((notif, idx) => (
                  <NotificationItem
                    key={idx}
                    notification={notif}
                    onRead={() => handleNotificationClick(idx)}
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

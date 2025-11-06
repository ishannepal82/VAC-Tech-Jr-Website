import { useState, useEffect } from "react";
import {
  ArrowBigRightDash,
  Bell,
  FolderGit2,
  CalendarClock,
  CheckCheck,
  Loader2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

// ✅ Updated: uid instead of user_id
interface NotificationItem {
  id?: string;
  title: string;
  message: string;
  type: string;
  to_email: string;
  project_id: string;
  from_email: string;
  uid?: string;
  read_status: boolean;
  created_at: string;
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
  onApprove,
  onDecline,
  isProcessing,
}: {
  notification: NotificationItem;
  onRead: () => void;
  onApprove?: () => void;
  onDecline?: () => void;
  isProcessing?: boolean;
}) => {
  const timestamp = new Date(notification.created_at);
  const isApprovalType = notification.type === "approval";

  console.log("Notification:", {
    type: notification.type,
    uid: notification.uid,
    project_id: notification.project_id,
    hasApprove: !!onApprove,
    hasDecline: !!onDecline,
    isApprovalType,
  });

  return (
    <div
      className={`flex flex-col p-4 border-b border-[#254b80] last:border-b-0 transition-colors duration-200 ${
        notification.read_status
          ? "hover:bg-[#112244]"
          : "bg-[#112244]/50 hover:bg-[#112244]"
      }`}
    >
      <div className="flex items-start">
        <div className="relative flex-shrink-0 mr-4 mt-1">
          {getIconForType(notification.type)}
          {!notification.read_status && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          )}
        </div>
        <div
          className="flex-grow cursor-pointer"
          onClick={!isApprovalType ? onRead : undefined}
        >
          <p
            className={`font-semibold ${
              notification.read_status ? "text-gray-300" : "text-white"
            }`}
          >
            {notification.title}
          </p>
          <p className="text-sm text-gray-400 mt-1">{notification.message}</p>

          {/* ✅ Updated debug info */}
          <p className="text-xs text-orange-400 mt-1">
            Type: {notification.type} | UID: {notification.uid || "missing"} | Project:{" "}
            {notification.project_id}
          </p>

          <p className="text-xs text-blue-300/70 mt-2">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>

      {(isApprovalType || notification.title.toLowerCase().includes("request")) && (
        <div className="flex gap-3 mt-4 pt-3 border-t border-[#254b80]">
          {isProcessing ? (
            <div className="flex items-center justify-center w-full py-2 text-blue-400">
              <Loader2 className="animate-spin mr-2" size={20} />
              <span className="text-sm">Processing...</span>
            </div>
          ) : (
            <>
              <button
                onClick={onApprove || (() => toast.error("No uid found in notification"))}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing || !onApprove}
              >
                <ThumbsUp size={18} />
                <span>Approve</span>
              </button>
              <button
                onClick={onDecline || (() => toast.error("No uid found in notification"))}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing || !onDecline}
              >
                <ThumbsDown size={18} />
                <span>Decline</span>
              </button>
            </>
          )}
        </div>
      )}

      {isApprovalType && !notification.uid && (
        <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-600/50 rounded text-yellow-200 text-xs">
          ⚠️ This is an approval notification but uid is missing from the backend
        </div>
      )}
    </div>
  );
};

const Notification = ({ onClose }: { onClose: () => void }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const baseUrl = import.meta.env.DEV ? "http://127.0.0.1:5000" : "";

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/notifications/get-notifications`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      console.log("Fetched notifications:", data.notifications);
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (index: number) => {
    const updated = [...notifications];
    updated[index] = { ...updated[index], read_status: true };
    setNotifications(updated);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((notifs) =>
      notifs.map((n) => ({ ...n, read_status: true }))
    );
  };

  const handleApproveUser = async (
    projectId: string,
    uid: string,
    notificationIndex: number
  ) => {
    if (!uid) {
      toast.error("UID is missing from notification");
      return;
    }

    const notifId = notifications[notificationIndex].id || `${projectId}-${uid}`;
    setProcessingIds((prev) => new Set(prev).add(notifId));

    try {
      console.log(`Approving user ${uid} for project ${projectId}`);

      const res = await fetch(
        `${baseUrl}/api/projects/approve_user/${projectId}/${uid}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.msg || "Failed to approve user");
      }

      toast.success("User approved successfully!");
      setNotifications((prev) => prev.filter((_, idx) => idx !== notificationIndex));
    } catch (err: any) {
      console.error("Approval error:", err);
      toast.error(err.message || "Failed to approve user");
    } finally {
      setProcessingIds((prev) => {
        const updated = new Set(prev);
        updated.delete(notifId);
        return updated;
      });
    }
  };

  const handleDeclineUser = async (
    projectId: string,
    uid: string,
    notificationIndex: number
  ) => {
    if (!uid) {
      toast.error("UID is missing from notification");
      return;
    }

    const notifId = notifications[notificationIndex].id || `${projectId}-${uid}`;
    setProcessingIds((prev) => new Set(prev).add(notifId));

    try {
      console.log(`Declining user ${uid} for project ${projectId}`);

      const res = await fetch(
        `${baseUrl}/api/projects/decline_user/${projectId}/${uid}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.msg || "Failed to decline user");
      }

      toast.success("User declined successfully!");
      setNotifications((prev) => prev.filter((_, idx) => idx !== notificationIndex));
    } catch (err: any) {
      console.error("Decline error:", err);
      toast.error(err.message || "Failed to decline user");
    } finally {
      setProcessingIds((prev) => {
        const updated = new Set(prev);
        updated.delete(notifId);
        return updated;
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="fixed inset-0 w-full h-screen flex items-center justify-center m-auto bg-black/50 backdrop-blur-sm z-50 p-4">
      <div className="w-full max-w-4xl h-[80vh] max-h-[700px] bg-[#1a2f55] rounded-3xl flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#254b80]">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-300">Mail Box</h1>
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
              <Loader2 className="animate-spin mr-2" size={32} />
              Loading notifications...
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-[#254b80]">
              {notifications.map((notif, idx) => {
                const notifId = notif.id || `${notif.project_id}-${notif.uid}`;
                const isProcessing = processingIds.has(notifId);

                return (
                  <NotificationItem
                    key={idx}
                    notification={notif}
                    onRead={() => handleNotificationClick(idx)}
                    onApprove={
                      notif.uid && notif.project_id
                        ? () => handleApproveUser(notif.project_id, notif.uid!, idx)
                        : undefined
                    }
                    onDecline={
                      notif.uid && notif.project_id
                        ? () => handleDeclineUser(notif.project_id, notif.uid!, idx)
                        : undefined
                    }
                    isProcessing={isProcessing}
                  />
                );
              })}
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
  );
};

export default Notification;
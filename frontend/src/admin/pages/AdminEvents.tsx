import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Star,
} from "lucide-react";
import Tabs from "../components/Tabs";
import Modal from "../components/Modal";
import PageLoader from "../../components/common/PageLoader";
import { usePageStatus } from "../../hooks/usePageStatus";
import { toast } from "sonner";

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const { isLoading, setLoading, handleError } = usePageStatus(
    "Failed to load events."
  );

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    banner: "",
    status: "upcoming",
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/api/events/events", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch events");

      const data = await res.json();
      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
      handleError(error, "Unable to load events.");
    } finally {
      setLoading(false);
    }
  }, [handleError, setLoading]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEvent
        ? `http://127.0.0.1:5000/api/events/edit-events/${editingEvent.id}`
        : "http://127.0.0.1:5000/api/events/add-event";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.msg || "Failed to save event");
      }

      setIsModalOpen(false);
      setEditingEvent(null);
      setFormData({
        name: "",
        date: "",
        time: "",
        venue: "",
        description: "",
        banner: "",
        status: "upcoming",
      });
      toast.success(`Event ${editingEvent ? "updated" : "created"} successfully.`);
      await fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save event. Please try again."
      );
    }
  };
  // Add this function inside your AdminEvents component
const deleteEvent = async (id: string) => {
  if (!confirm("Are you sure you want to delete this event?")) return;

  try {
    const res = await fetch(`http://127.0.0.1:5000/api/events/delete-event/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.msg || "Failed to delete event");
    }

    // Remove deleted event from local state
    toast.success("Event deleted successfully.");
    await fetchEvents();
  } catch (error) {
    console.error("Error deleting event:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to delete event. Please try again."
    );
  }
};


  const EventCard = ({ event }: { event: any }) => (
    <div className="bg-[#0f172a] p-4 rounded-lg border border-gray-700 space-y-3">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg text-white">{event.name}</h3>
        <div className="flex items-center gap-4">
          <button
            className={`hover:text-white transition ${
              event.featured ? "text-yellow-400" : "text-gray-500"
            }`}
          >
            <Star size={18} />
          </button>
          <button
            className="text-blue-400 hover:text-blue-300"
            onClick={() => {
              setEditingEvent(event);
              setFormData({
                name: event.name,
                date: event.date,
                time: event.time,
                venue: event.venue,
                description: event.description,
                banner: event.banner || "",
                status: event.status || "upcoming",
              });
              setIsModalOpen(true);
            }}
          >
            <Edit size={18} />
          </button>
          <button className="text-red-400 hover:text-red-300" onClick={() => deleteEvent(event.id)}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
        <span className="flex items-center gap-2">
          <Calendar size={14} /> {event.date}
        </span>
        <span className="flex items-center gap-2">
          <Clock size={14} /> {event.time}
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={14} /> {event.venue}
        </span>
      </div>
      <p className="text-gray-300 text-sm">{event.description}</p>
      <p className="text-gray-400 text-sm">Status: {event.status}</p>
    </div>
  );

  if (isLoading) {
    return <PageLoader message="Loading events..." />;
  }

  return (
    <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Event Management</h2>
        <button
          onClick={() => {
            setEditingEvent(null);
            setFormData({
              name: "",
              date: "",
              time: "",
              venue: "",
              description: "",
              banner: "",
              status: "upcoming",
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          <Plus size={18} /> Add Event
        </button>
      </div>

      <Tabs tabNames={["Upcoming", "Completed", "Drafts"]}>
        <div className="space-y-4">
          {events
            .filter((e) => e.status?.toLowerCase() === "upcoming")
            .map((event) => (
              <EventCard key={event.id || event.name} event={event} />
            ))}
        </div>
        <div className="space-y-4">
          {events
            .filter((e) => e.status === "Completed")
            .map((event) => (
              <EventCard key={event.id || event.name} event={event} />
            ))}
        </div>
        <div className="text-center text-gray-500 py-10">No draft events.</div>
      </Tabs>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? "Edit Event" : "Add New Event"}
      >
        <form className="space-y-4" onSubmit={saveEvent}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Event Name"
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              required
            />
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
              required
            />
          </div>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleInputChange}
            placeholder="Venue"
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white min-h-[100px]"
            required
          />
          <input
            type="text"
            name="banner"
            value={formData.banner}
            onChange={handleInputChange}
            placeholder="Banner Image URL"
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
          >
            <option value="upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Draft">Draft</option>
          </select>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 rounded-lg text-gray-300 hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold transition"
            >
              {editingEvent ? "Save Changes" : "Save Event"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

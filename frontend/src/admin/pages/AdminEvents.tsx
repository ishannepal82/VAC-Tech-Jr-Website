import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Star,
  BarChart2,
} from "lucide-react";
import Tabs from "../components/Tabs";
import Modal from "../components/Modal";

// Mock Data
const mockEvents = [
  {
    id: 1,
    name: "Hackathon 2024",
    date: "2024-11-15",
    time: "09:00 AM",
    venue: "Main Auditorium",
    description: "A 24-hour coding marathon.",
    banner: "",
    status: "Upcoming",
    featured: true,
    registrations: 120,
  },
  {
    id: 2,
    name: "Intro to React Workshop",
    date: "2024-10-05",
    time: "02:00 PM",
    venue: "Room 301",
    description: "Learn the basics of React.",
    banner: "",
    status: "Completed",
    featured: false,
    registrations: 45,
  },
  {
    id: 3,
    name: "Guest Speaker: CEO of TechCorp",
    date: "2024-12-01",
    time: "06:00 PM",
    venue: "Online",
    description: "An inspiring talk on entrepreneurship.",
    banner: "",
    status: "Upcoming",
    featured: false,
    registrations: 250,
  },
];

export default function AdminEvents() {
  const [events] = useState(mockEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const EventCard = ({ event }: { event: (typeof mockEvents)[0] }) => (
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
          <button className="text-blue-400 hover:text-blue-300">
            <Edit size={18} />
          </button>
          <button className="text-red-400 hover:text-red-300">
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
      <div className="flex items-center gap-2 text-sm text-green-400 pt-2">
        <BarChart2 size={16} />
        <span>{event.registrations} Registrations</span>
      </div>
    </div>
  );

  return (
    <div className="bg-[#1e293b] p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Event Management</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          <Plus size={18} /> Add Event
        </button>
      </div>

      <Tabs tabNames={["Upcoming", "Completed", "Drafts"]}>
        <div className="space-y-4">
          {events
            .filter((e) => e.status === "Upcoming")
            .map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
        </div>
        <div className="space-y-4">
          {events
            .filter((e) => e.status === "Completed")
            .map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
        </div>
        <div className="text-center text-gray-500 py-10">No draft events.</div>
      </Tabs>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Event"
      >
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Event Name"
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            />
            <input
              type="time"
              className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
            />
          </div>
          <input
            type="text"
            placeholder="Venue"
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
          />
          <textarea
            placeholder="Description"
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white min-h-[100px]"
          />
          <input
            type="text"
            placeholder="Banner Image URL"
            className="w-full bg-[#0f172a] border border-gray-600 rounded-lg py-2 px-4 text-white"
          />
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
              Save Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

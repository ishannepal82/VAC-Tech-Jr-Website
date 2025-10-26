import { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import { Clock, MapPin } from "lucide-react";
import "../styles/Calendar.css";

type EventCategory = "important" | "collaboration" | "meeting" | "other";
type Event = {
  id: number;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  category: EventCategory;
};

const mockEvents: Event[] = [
  {
    id: 1,
    title: "React Workshop: Building Interactive UIs",
    description:
      "Dive deep into React hooks, state management, and building a complete application from scratch.",
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    time: "2:00 PM - 4:00 PM",
    location: "Virtual (Zoom)",
    category: "important",
  },
  {
    id: 2,
    title: "Club Leadership Sync",
    description:
      "Weekly sync-up for committee leads to discuss progress and upcoming tasks.",
    date: new Date(new Date().setDate(new Date().getDate() + 7)),
    time: "1:00 PM - 1:30 PM",
    location: "Discord",
    category: "meeting",
  },
  {
    id: 3,
    title: "Backend AMA with a Senior Engineer",
    description:
      "Ask anything about Node.js, databases, and scaling your backend services.",
    date: new Date(new Date().setDate(new Date().getDate() + 12)),
    time: "6:00 PM - 7:00 PM",
    location: "Tech Hall, Room 101",
    category: "other",
  },
  {
    id: 4,
    title: "Project Showcase & Networking Night",
    description:
      "Present your projects, get feedback, and network with fellow club members and alumni.",
    date: new Date(new Date().setDate(new Date().getDate() + 20)),
    time: "7:00 PM onwards",
    location: "Main Auditorium",
    category: "important",
  },
  {
    id: 5,
    title: "Intro to Docker & CI/CD",
    description:
      "Learn how to containerize your applications with Docker and automate your deployments.",
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    time: "5:00 PM - 6:30 PM",
    location: "Virtual (Zoom)",
    category: "other",
  },
  {
    id: 6,
    title: "Cross-Club Collab: AI Hackathon Planning",
    description:
      "Joint meeting with the AI Club to plan the upcoming hackathon event.",
    date: new Date(new Date().setDate(new Date().getDate() + 15)),
    time: "4:00 PM - 5:00 PM",
    location: "Room 302",
    category: "collaboration",
  },
];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const categoryColorMap: Record<EventCategory, string> = {
  important: "bg-red-500",
  collaboration: "bg-yellow-400",
  meeting: "bg-green-500",
  other: "bg-blue-400",
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const eventRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    setEvents(mockEvents);
  }, []);

  useEffect(() => {
    const firstEventOfTheDay = upcomingEvents.find((event) =>
      isSameDay(event.date, selectedDate)
    );
    if (firstEventOfTheDay) {
      eventRefs.current[firstEventOfTheDay.id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedDate, events]);

  const upcomingEvents = events
    .filter((event) => event.date >= new Date(new Date().toDateString()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <section className="min-h-screen w-full bg-[#0a1a33] text-white font-poppins py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#9cc9ff]">
            Event Insights
          </h1>
          <p className="text-gray-300  max-w-2xl mx-auto text-lg ">
            Explore our upcoming workshops, talks, and networking sessions.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-12">
          <div className="lg:flex-1">
            <Calendar
              locale="en-US"
              onChange={(value) => setSelectedDate(value as Date)}
              value={selectedDate}
              tileClassName={({ date, view }) => {
                if (view === "month" && date.getDay() === 6) {
                  return "saturday-holiday";
                }
                return null;
              }}
              tileContent={({ date, view }) => {
                if (view === "month") {
                  const eventsOnDay = events.filter((event) =>
                    isSameDay(event.date, date)
                  );
                  if (eventsOnDay.length > 0) {
                    return (
                      <div className="event-markers-container">
                        {eventsOnDay.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`event-marker ${
                              categoryColorMap[event.category]
                            }`}
                          />
                        ))}
                      </div>
                    );
                  }
                }
                return null;
              }}
              className="react-calendar"
            />
          </div>
          <div className="lg:w-2/5 flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-4">
              Upcoming Events
            </h2>
            <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-3 -mr-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    ref={(el) => {
                      eventRefs.current[event.id] = el;
                    }}
                    className={`bg-[#112240] p-5 rounded-xl border-2 transition-all duration-300 shadow-lg ${
                      isSameDay(event.date, selectedDate)
                        ? "border-[#5ea4ff]"
                        : "border-[#1a2f55] hover:border-[#3a507e]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#5ea4ff] mb-1">
                      {event.date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <h3 className="font-bold text-xl text-[#b3d9ff]">
                      {event.title}
                    </h3>
                    <p className="text-gray-400 mt-2 text-sm">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-6 mt-4 text-xs text-gray-300">
                      <span className="flex items-center gap-2">
                        <Clock size={14} className="text-[#9cc9ff]" />{" "}
                        {event.time}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#9cc9ff]" />{" "}
                        {event.location}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#112240] p-6 rounded-xl border-2 border-dashed border-[#1a2f55] text-center h-full flex flex-col justify-center items-center">
                  <p className="text-gray-400 text-lg">
                    No upcoming events scheduled.
                  </p>
                  <p className="text-gray-500 text-sm mt-2">Check back soon!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import Calendar from "react-calendar";
import { Clock, MapPin } from "lucide-react";
import "../styles/Calendar.css";
import PageLoader from "../components/common/PageLoader";
import { usePageStatus } from "../hooks/usePageStatus";

type EventCategory = "important" | "collaboration" | "meeting" | "other";

type EventStatus = "Upcoming" | "Completed" | "Draft";

type Event = {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  category: EventCategory;
  status: EventStatus; // new status field
};

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
  const eventRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { isLoading, setLoading, handleError } = usePageStatus(
    "Failed to load events."
  );

  // Fetch events from backend
  const fetchEvents = useCallback(async () => {
      try {
        setLoading(true);
        const res = await fetch("http://127.0.0.1:5000/api/events/events", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch events");

        const data = await res.json();

        // Make sure data.events exists and is an array
        if (!Array.isArray(data.events)) throw new Error("Invalid data format");

        const parsedEvents: Event[] = data.events.map((ev: any) => ({
          id: ev.id,
          title: ev.name, // map backend `name` to title
          description: ev.description,
          date: new Date(ev.date), // convert string to Date
          time: ev.time,
          location: ev.venue, // map backend `venue` to location
          category: "other", // optional default category
          status: ev.status
            ? ev.status.charAt(0).toUpperCase() + ev.status.slice(1) // "upcoming" -> "Upcoming"
            : "Upcoming",
        }));

        setEvents(parsedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]); // fallback
        handleError(error, "Unable to fetch events.");
      } finally {
        setLoading(false);
      }
  }, [handleError, setLoading]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Scroll to first upcoming event of the selected date
  const upcomingEvents = events
    .filter((event) => event.status === "Upcoming")
    .sort((a, b) => a.date.getTime() - b.date.getTime());

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
  }, [selectedDate, upcomingEvents]);

  if (isLoading) {
    return <PageLoader message="Loading events..." />;
  }

  return (
    <section className="min-h-screen w-full bg-[#0a1a33] text-white font-poppins py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#9cc9ff]">
            Event Insights
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Explore our upcoming workshops, talks, and networking sessions.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-12">
          {/* Calendar */}
          <div className="lg:flex-1">
            <Calendar
              locale="en-US"
              onChange={(value) => setSelectedDate(value as Date)}
              value={selectedDate}
              tileClassName={({ date, view }) =>
                view === "month" && date.getDay() === 6 ? "saturday-holiday" : null
              }
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
                            className={`event-marker ${categoryColorMap[event.category]}`}
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

          {/* Upcoming Events Panel */}
          <div className="lg:w-2/5 flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-4">Upcoming Events</h2>
            <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-3 -mr-3">
              {upcomingEvents.length === 0 ? (
                <div className="bg-[#112240] p-6 rounded-xl border-2 border-dashed border-[#1a2f55] text-center">
                  <p className="text-gray-400 text-lg">
                    No upcoming events scheduled.
                  </p>
                  <p className="text-gray-500 text-sm mt-2">Check back soon!</p>
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    ref={(el) => (eventRefs.current[event.id] = el)}
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
                    <h3 className="font-bold text-xl text-[#b3d9ff]">{event.title}</h3>
                    <p className="text-gray-400 mt-2 text-sm">{event.description}</p>
                    <div className="flex items-center gap-6 mt-4 text-xs text-gray-300">
                      <span className="flex items-center gap-2">
                        <Clock size={14} className="text-[#9cc9ff]" /> {event.time}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#9cc9ff]" /> {event.location}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

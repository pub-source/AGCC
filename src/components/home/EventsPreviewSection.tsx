import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface EventItem {
  id: string;
  title: string;
  event_date: string;
  event_type: string | null;
}

export function EventsPreviewSection() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, event_date, event_type")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(3);
      if (data) setEvents(data);
    };
    fetchEvents();
  }, []);

  // Fallback static events if none in DB
  const displayEvents = events.length > 0 ? events : [
    { id: "1", title: "Sunday Worship Service", event_date: "2026-02-15", event_type: "Service" },
    { id: "2", title: "Wednesday Bible Study", event_date: "2026-02-18", event_type: "Study" },
    { id: "3", title: "Youth Fellowship Night", event_date: "2026-02-20", event_type: "Youth" },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
          {/* Left side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-foreground">
              What's
              <br />
              Happening
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Let's walk with Jesus together! Check out our upcoming services, events, and more.
            </p>
            <Button
              asChild
              className="rounded-full px-8 py-6 text-sm font-semibold uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90"
            >
              <Link to="/events">Get Involved</Link>
            </Button>
          </motion.div>

          {/* Right side - event list */}
          <div className="space-y-0">
            {displayEvents.map((event, index) => {
              const date = new Date(event.event_date);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to="/events"
                    className="flex items-center gap-8 py-8 border-b border-border group hover:bg-card/30 transition-colors px-4 -mx-4 rounded-lg"
                  >
                    {/* Date block */}
                    <div className="text-center min-w-[60px]">
                      <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                        {format(date, "MMM")}
                      </p>
                      <p className="text-3xl font-serif font-bold text-foreground">
                        {format(date, "d")}
                      </p>
                    </div>

                    {/* Event info */}
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1">
                        {event.event_type || "Event"}
                      </p>
                      <h3 className="font-serif text-xl md:text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

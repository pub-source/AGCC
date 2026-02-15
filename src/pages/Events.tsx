import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { BackButton } from "@/components/ui/back-button";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useUserChurch } from "@/hooks/useUserChurch";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  event_type: string | null;
}

const typeColors: Record<string, string> = {
  service: "from-blue-500 to-blue-600",
  study: "from-emerald-500 to-emerald-600",
  youth: "from-orange-500 to-orange-600",
  special: "from-primary to-violet-dark",
  outreach: "from-rose-500 to-rose-600",
  prayer: "from-purple-500 to-purple-600",
};

const typeLabels: Record<string, string> = {
  service: "Worship Service",
  study: "Bible Study",
  youth: "Youth",
  special: "Special Event",
  outreach: "Outreach",
  prayer: "Prayer Meeting",
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { churchId } = useUserChurch();

  useEffect(() => {
    fetchEvents();
  }, [churchId]);

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true });

      if (churchId) {
        query = query.eq("church_id", churchId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <BackButton to="/" label="Back to Home" />
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-primary text-sm font-medium uppercase tracking-wider">
              Join Us
            </span>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mt-4 mb-6">
              Events & Services
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Connect with our community through worship, fellowship, and service.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 section-elevated">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="glass-card p-12 text-center max-w-lg mx-auto">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-semibold mb-2">No Upcoming Events</p>
              <p className="text-muted-foreground">
                Check back soon for upcoming events and services.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="glass-card p-6 h-full flex flex-col hover:border-primary/30 transition-all duration-300">
                    {/* Type Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                          typeColors[event.event_type || "service"]
                        } text-white`}
                      >
                        {typeLabels[event.event_type || "service"]}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-serif text-xl font-semibold mb-2">{event.title}</h3>
                    <p className="text-muted-foreground text-sm mb-6 flex-grow">
                      {event.description || "Join us for this event!"}
                    </p>

                    {/* Details */}
                    <div className="space-y-3 text-sm text-muted-foreground border-t border-border pt-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                        <span>{format(new Date(event.event_date), "EEEE, MMMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        <span>{format(new Date(event.event_date), "h:mm a")}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-primary shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <Button variant="outline-glow" className="w-full mt-6">
                      <Users className="h-4 w-4" />
                      RSVP
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

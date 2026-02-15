import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Calendar, ArrowLeft, Edit, Trash2, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/Layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useUserChurch } from "@/hooks/useUserChurch";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  event_type: string | null;
  image_url: string | null;
  church_id: string | null;
  created_at: string;
}

const eventTypes = [
  { value: "service", label: "Worship Service" },
  { value: "study", label: "Bible Study" },
  { value: "youth", label: "Youth" },
  { value: "special", label: "Special Event" },
  { value: "outreach", label: "Outreach" },
  { value: "prayer", label: "Prayer Meeting" },
];

export default function EventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    event_type: "service",
    image_url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { churchId, churchName, isPastor, isAdmin, isLoading: churchLoading } = useUserChurch();

  useEffect(() => {
    if (!churchLoading) {
      checkAccessAndFetch();
    }
  }, [churchLoading, churchId]);

  const checkAccessAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }

    if (!isPastor && !isAdmin) {
      toast.error("Access denied. Pastor or Admin privileges required.");
      navigate("/dashboard");
      return;
    }

    fetchEvents();
  };

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });

      if (!isAdmin && churchId) {
        query = query.eq("church_id", churchId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast.error("Failed to load events");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || "",
        event_date: event.event_date.slice(0, 16),
        location: event.location || "",
        event_type: event.event_type || "service",
        image_url: event.image_url || "",
      });
    } else {
      setEditingEvent(null);
      const now = new Date();
      now.setMinutes(0);
      setFormData({
        title: "",
        description: "",
        event_date: now.toISOString().slice(0, 16),
        location: "",
        event_type: "service",
        image_url: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const eventData = {
        title: formData.title,
        description: formData.description || null,
        event_date: formData.event_date,
        location: formData.location || null,
        event_type: formData.event_type,
        image_url: formData.image_url || null,
        created_by: session?.user.id,
        church_id: churchId,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast.success("Event updated successfully");
      } else {
        const { error } = await supabase
          .from("events")
          .insert(eventData);

        if (error) throw error;
        toast.success("Event created successfully");
      }

      setDialogOpen(false);
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || "Failed to save event");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (event: Event) => {
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) return;

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);

      if (error) throw error;
      toast.success("Event deleted");
      fetchEvents();
    } catch (error: any) {
      toast.error("Failed to delete event");
      console.error(error);
    }
  };

  const typeColors: Record<string, string> = {
    service: "from-blue-500 to-blue-600",
    study: "from-emerald-500 to-emerald-600",
    youth: "from-orange-500 to-orange-600",
    special: "from-primary to-violet-dark",
    outreach: "from-rose-500 to-rose-600",
    prayer: "from-purple-500 to-purple-600",
  };

  if (loading || churchLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Button variant="ghost" className="mb-4" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">
                  Event Manager
                </h1>
                {churchName && (
                  <p className="text-primary font-medium">{churchName}</p>
                )}
                <p className="text-muted-foreground text-lg mt-2">
                  Create and manage church events and services
                </p>
              </div>
              <Button variant="hero" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </div>
          </motion.div>

          {/* Events Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.length === 0 ? (
              <div className="col-span-full glass-card p-12 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">No events yet</p>
                <p className="text-muted-foreground mb-6">Create your first event to get started</p>
                <Button variant="hero" onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4" />
                  Create Event
                </Button>
              </div>
            ) : (
              events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="glass-card p-6 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                        typeColors[event.event_type || "service"]
                      } text-white`}
                    >
                      {eventTypes.find(t => t.value === event.event_type)?.label || "Event"}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-semibold mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{format(new Date(event.event_date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{format(new Date(event.event_date), "h:mm a")}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="glass"
                      onClick={() => handleOpenDialog(event)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => handleDelete(event)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingEvent ? "Edit Event" : "Create New Event"}
            </DialogTitle>
            <DialogDescription>
              Add event details including date, time, and location
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Sunday Worship Service"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_type">Event Type</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => setFormData({ ...formData, event_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the event..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_date">Date & Time *</Label>
              <Input
                id="event_date"
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Main Sanctuary"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={submitting}>
                {submitting ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

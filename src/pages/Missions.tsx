import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { BackButton } from "@/components/ui/back-button";
import { MapPin, Target, Users, Heart, Smartphone, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useUserChurch } from "@/hooks/useUserChurch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Mission {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  goal_amount: number | null;
  raised_amount: number | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
}

const statusColors: Record<string, string> = {
  active: "from-emerald-500 to-emerald-600",
  completed: "from-blue-500 to-blue-600",
  upcoming: "from-amber-500 to-amber-600",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  completed: "Completed",
  upcoming: "Upcoming",
};

export default function Missions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const { churchId } = useUserChurch();

  useEffect(() => {
    fetchMissions();
  }, [churchId]);

  const fetchMissions = async () => {
    try {
      let query = supabase
        .from("missions")
        .select("*")
        .order("created_at", { ascending: false });

      if (churchId) {
        query = query.eq("church_id", churchId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      console.error("Failed to fetch missions:", error);
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
              Global Outreach
            </span>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mt-4 mb-6">
              Our Missions
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Making a difference locally and around the world through love, service, and the gospel.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Missions Grid */}
      <section className="py-16 section-elevated">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : missions.length === 0 ? (
            <div className="glass-card p-12 text-center max-w-lg mx-auto">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-semibold mb-2">No Active Missions</p>
              <p className="text-muted-foreground">
                Mission projects will appear here once created by church leadership.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {missions.map((mission, index) => {
                const progress = mission.goal_amount 
                  ? ((mission.raised_amount || 0) / mission.goal_amount) * 100 
                  : 0;

                return (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="glass-card p-8 h-full hover:border-primary/30 transition-all duration-300">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-serif text-xl font-semibold mb-2">
                            {mission.title}
                          </h3>
                          {mission.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span>{mission.location}</span>
                            </div>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${
                            statusColors[mission.status || "active"]
                          } text-white`}
                        >
                          {statusLabels[mission.status || "active"]}
                        </span>
                      </div>

                      {/* Description */}
                      {mission.description && (
                        <p className="text-muted-foreground text-sm mb-6">
                          {mission.description}
                        </p>
                      )}

                      {/* Progress */}
                      {mission.goal_amount && (
                        <div className="mb-6">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold text-primary">
                              ₱{(mission.raised_amount || 0).toLocaleString()} / ₱
                              {mission.goal_amount.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      {/* Action */}
                      {mission.status !== "completed" && (
                        <Button 
                          variant="hero" 
                          className="w-full"
                          onClick={() => setSelectedMission(mission)}
                        >
                          <Heart className="h-4 w-4" />
                          Support This Mission
                        </Button>
                      )}
                      {mission.status === "completed" && (
                        <Button variant="glass" className="w-full">
                          View Report
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* GCash Dialog for Mission Support */}
      <Dialog open={!!selectedMission} onOpenChange={() => setSelectedMission(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-center">
              Support: {selectedMission?.title}
            </DialogTitle>
            <DialogDescription className="text-center">
              Scan the QR code or send to the GCash number below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* QR Code Placeholder */}
            <div className="aspect-square max-w-[250px] mx-auto bg-white rounded-xl p-4 flex items-center justify-center">
              <div className="text-center">
                <QrCode className="h-32 w-32 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">GCash QR Code</p>
              </div>
            </div>

            {/* GCash Number */}
            <div className="glass-card p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">GCash Number</span>
              </div>
              <p className="text-2xl font-bold tracking-wider">09XX-XXX-XXXX</p>
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Please include "{selectedMission?.title}" in the message.</p>
              <p className="text-xs">
                For inquiries, contact the church office.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

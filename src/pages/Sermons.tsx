import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { BackButton } from "@/components/ui/back-button";
import { Play, Download, Calendar, User, Search, Filter, FileAudio, FileText, Presentation, Video, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserChurch } from "@/hooks/useUserChurch";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface Sermon {
  id: string;
  title: string;
  description: string | null;
  pastor_name: string | null;
  sermon_date: string;
  video_url: string | null;
  thumbnail_url: string | null;
  audio_url: string | null;
  document_url: string | null;
  presentation_url: string | null;
}

export default function Sermons() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const { churchId, churchName, isApproved, isLoading: churchLoading } = useUserChurch();

  useEffect(() => {
    if (!churchLoading) {
      fetchSermons();
    }
  }, [churchLoading, churchId]);

  const fetchSermons = async () => {
    // If user is not logged in or not approved, show empty
    if (!churchId || !isApproved) {
      setSermons([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .eq("church_id", churchId)
        .order("sermon_date", { ascending: false });

      if (error) throw error;
      setSermons(data || []);
    } catch (error) {
      console.error("Failed to fetch sermons:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSermons = sermons.filter(
    (sermon) =>
      sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sermon.pastor_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (sermon.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
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

  // Show login prompt if not authenticated or not approved
  if (!churchId || !isApproved) {
    return (
      <Layout>
        <section className="pt-32 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                <Lock className="h-10 w-10 text-muted-foreground" />
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                Members Only
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8">
                Sermons are available exclusively for approved church members. 
                Please log in or join our community to access our sermon library.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="glass" size="lg" asChild>
                  <Link to="/join">Join Our Church</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

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
              {churchName}
            </span>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mt-4 mb-6">
              Sermons & Messages
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Watch, listen, and grow with powerful messages from our pastors.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search sermons, pastors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sermons Grid */}
      <section className="py-8 pb-24">
        <div className="container mx-auto px-4">
          {filteredSermons.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-semibold mb-2">No sermons available yet</p>
              <p className="text-muted-foreground">
                Check back soon for new messages from our pastors.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSermons.map((sermon, index) => (
                <motion.div
                  key={sermon.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="glass-card overflow-hidden group hover:border-primary/30 transition-all duration-300">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-secondary to-card relative overflow-hidden">
                      {sermon.thumbnail_url ? (
                        <img
                          src={sermon.thumbnail_url}
                          alt={sermon.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-violet-dark/20" />
                      )}
                      {sermon.video_url && (
                        <a
                          href={sermon.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                          <div className="w-16 h-16 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-primary/30">
                            <Play className="h-6 w-6 text-primary-foreground ml-1" />
                          </div>
                        </a>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {sermon.title}
                      </h3>
                      {sermon.pastor_name && (
                        <p className="text-primary text-sm mb-2 flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {sermon.pastor_name}
                        </p>
                      )}
                      {sermon.description && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {sermon.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(sermon.sermon_date), "MMMM d, yyyy")}</span>
                      </div>

                      {/* Resource links */}
                      <div className="flex flex-wrap gap-2">
                        {sermon.video_url && (
                          <a
                            href={sermon.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="hero" size="sm">
                              <Play className="h-4 w-4" />
                              Watch
                            </Button>
                          </a>
                        )}
                        {sermon.audio_url && (
                          <a href={sermon.audio_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="glass" size="sm">
                              <FileAudio className="h-4 w-4" />
                              Audio
                            </Button>
                          </a>
                        )}
                        {sermon.document_url && (
                          <a href={sermon.document_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="glass" size="sm">
                              <FileText className="h-4 w-4" />
                              Notes
                            </Button>
                          </a>
                        )}
                        {sermon.presentation_url && (
                          <a href={sermon.presentation_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="glass" size="sm">
                              <Presentation className="h-4 w-4" />
                              Slides
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
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

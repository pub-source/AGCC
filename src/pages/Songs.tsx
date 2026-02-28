import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Music, Search, FileAudio, X, MicVocal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { supabase } from "@/integrations/supabase/client";
import { useUserChurch } from "@/hooks/useUserChurch";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string | null;
  lyrics: string | null;
  key_signature: string | null;
  tempo: number | null;
  audio_url: string | null;
}

// ─── Lyrics Modal ──────────────────────────────────────────────────────────────
function LyricsModal({ song, onClose }: { song: Song; onClose: () => void }) {
  // Close on backdrop click
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backdropFilter: "blur(10px)", background: "rgba(0,0,0,0.65)" }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          style={{ background: "hsl(var(--card))" }}
        >
          {/* Header */}
          <div className="shrink-0 px-6 pt-6 pb-4 border-b border-border flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-dark flex items-center justify-center shrink-0">
              <MicVocal className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-2xl font-bold leading-tight">{song.title}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {song.artist && (
                  <span className="text-sm text-muted-foreground">{song.artist}</span>
                )}
                {song.key_signature && (
                  <span className="px-2 py-0.5 rounded bg-secondary text-xs font-medium">
                    Key: {song.key_signature}
                  </span>
                )}
                {song.tempo && (
                  <span className="px-2 py-0.5 rounded bg-secondary text-xs font-medium">
                    {song.tempo} BPM
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {song.audio_url && (
                <a
                  href={song.audio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"
                  title="Play Audio"
                >
                  <FileAudio className="h-5 w-5 text-primary" />
                </a>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-secondary hover:bg-destructive/20 hover:text-destructive transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Lyrics body — scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-4">
              Lyrics
            </p>
            <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/80 leading-[1.9]">
              {song.lyrics}
            </pre>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { churchId, churchName, isApproved, isLoading: churchLoading } = useUserChurch();

  useEffect(() => {
    if (!churchLoading) fetchSongs();
  }, [churchLoading, churchId]);

  const fetchSongs = async () => {
    if (!churchId || !isApproved) {
      setSongs([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("church_id", churchId)
        .order("title", { ascending: true });
      if (error) throw error;
      setSongs(data || []);
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.artist?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  if (loading || churchLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

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
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Members Only</h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8">
                The song library is available exclusively for approved church members.
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
      {/* Lyrics Modal */}
      {selectedSong && selectedSong.lyrics && (
        <LyricsModal song={selectedSong} onClose={() => setSelectedSong(null)} />
      )}

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <BackButton to="/" label="Back to Home" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-primary text-sm font-medium uppercase tracking-wider">
              {churchName}
            </span>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mt-4 mb-6">
              Song Library
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Browse lyrics and listen to songs from our worship collection.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="glass-card p-4 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search songs by title or artist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Songs List */}
      <section className="py-8 pb-24">
        <div className="container mx-auto px-4">
          {filteredSongs.length === 0 ? (
            <div className="glass-card p-12 text-center max-w-lg mx-auto">
              <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-semibold mb-2">No songs found</p>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try a different search term."
                  : "Songs will appear here once added by the worship team."}
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {filteredSongs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <div className="glass-card overflow-hidden hover:border-primary/30 transition-all duration-300">
                    <div className="w-full p-6 flex items-center gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-dark flex items-center justify-center shrink-0">
                        <Music className="h-6 w-6 text-white" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-lg font-semibold truncate">{song.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {song.artist && <span>{song.artist}</span>}
                          {song.key_signature && (
                            <span className="px-2 py-0.5 rounded bg-secondary text-xs">
                              Key: {song.key_signature}
                            </span>
                          )}
                          {song.tempo && (
                            <span className="px-2 py-0.5 rounded bg-secondary text-xs">
                              {song.tempo} BPM
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {song.audio_url && (
                          <a
                            href={song.audio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"
                            title="Play Audio"
                          >
                            <FileAudio className="h-5 w-5 text-primary" />
                          </a>
                        )}
                        {song.lyrics && (
                          <button
                            onClick={() => setSelectedSong(song)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wider transition-colors"
                          >
                            <MicVocal className="h-3.5 w-3.5" />
                            Lyrics
                          </button>
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

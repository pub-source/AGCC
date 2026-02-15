import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Music, ArrowLeft, Edit, Trash2, FileAudio, FileText, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/Layout";
import { FileUpload } from "@/components/FileUpload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserChurch } from "@/hooks/useUserChurch";

interface Song {
  id: string;
  title: string;
  artist: string | null;
  lyrics: string | null;
  key_signature: string | null;
  tempo: number | null;
  audio_url: string | null;
  church_id: string | null;
  created_at: string;
}

export default function SongManager() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    lyrics: "",
    key_signature: "",
    tempo: "",
    audio_url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { churchId, churchName, isPastor, isAdmin, isWorshipTeam, isLoading: churchLoading } = useUserChurch();

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

    if (!isPastor && !isAdmin && !isWorshipTeam) {
      toast.error("Access denied. Worship Team, Pastor, or Admin privileges required.");
      navigate("/dashboard");
      return;
    }

    fetchSongs();
  };

  const fetchSongs = async () => {
    try {
      let query = supabase
        .from("songs")
        .select("*")
        .order("title", { ascending: true });

      if (!isAdmin && churchId) {
        query = query.eq("church_id", churchId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSongs(data || []);
    } catch (error: any) {
      toast.error("Failed to load songs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (song?: Song) => {
    if (song) {
      setEditingSong(song);
      setFormData({
        title: song.title,
        artist: song.artist || "",
        lyrics: song.lyrics || "",
        key_signature: song.key_signature || "",
        tempo: song.tempo?.toString() || "",
        audio_url: song.audio_url || "",
      });
    } else {
      setEditingSong(null);
      setFormData({
        title: "",
        artist: "",
        lyrics: "",
        key_signature: "",
        tempo: "",
        audio_url: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const songData = {
        title: formData.title,
        artist: formData.artist || null,
        lyrics: formData.lyrics || null,
        key_signature: formData.key_signature || null,
        tempo: formData.tempo ? parseInt(formData.tempo) : null,
        audio_url: formData.audio_url || null,
        created_by: session?.user.id,
        church_id: churchId,
      };

      if (editingSong) {
        const { error } = await supabase
          .from("songs")
          .update(songData)
          .eq("id", editingSong.id);

        if (error) throw error;
        toast.success("Song updated successfully");
      } else {
        const { error } = await supabase
          .from("songs")
          .insert(songData);

        if (error) throw error;
        toast.success("Song added successfully");
      }

      setDialogOpen(false);
      fetchSongs();
    } catch (error: any) {
      toast.error(error.message || "Failed to save song");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (song: Song) => {
    if (!confirm(`Are you sure you want to delete "${song.title}"?`)) return;

    try {
      const { error } = await supabase
        .from("songs")
        .delete()
        .eq("id", song.id);

      if (error) throw error;
      toast.success("Song deleted");
      fetchSongs();
    } catch (error: any) {
      toast.error("Failed to delete song");
      console.error(error);
    }
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
                  Song Library
                </h1>
                {churchName && (
                  <p className="text-primary font-medium">{churchName}</p>
                )}
                <p className="text-muted-foreground text-lg mt-2">
                  Manage songs with lyrics, audio, and worship resources
                </p>
              </div>
              <Button variant="hero" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4" />
                Add Song
              </Button>
            </div>
          </motion.div>

          {/* Songs Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.length === 0 ? (
              <div className="col-span-full glass-card p-12 text-center">
                <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">No songs yet</p>
                <p className="text-muted-foreground mb-6">Add your first song to get started</p>
                <Button variant="hero" onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4" />
                  Add Song
                </Button>
              </div>
            ) : (
              songs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="glass-card p-6 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet-dark flex items-center justify-center">
                      <Music className="h-6 w-6 text-white" />
                    </div>
                    {song.key_signature && (
                      <span className="px-2 py-1 rounded bg-secondary text-xs font-medium">
                        Key: {song.key_signature}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-semibold mb-1 line-clamp-1">
                    {song.title}
                  </h3>
                  {song.artist && (
                    <p className="text-sm text-muted-foreground mb-3">{song.artist}</p>
                  )}
                  
                  {song.tempo && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Tempo: {song.tempo} BPM
                    </p>
                  )}

                  {/* Resource indicators */}
                  <div className="flex items-center gap-2 mb-4">
                    {song.audio_url && (
                      <a href={song.audio_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-secondary hover:bg-primary/20 transition-colors" title="Audio">
                        <FileAudio className="h-4 w-4 text-primary" />
                      </a>
                    )}
                    {song.lyrics && (
                      <span className="p-1.5 rounded bg-secondary" title="Has Lyrics">
                        <FileText className="h-4 w-4 text-primary" />
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="glass"
                      onClick={() => handleOpenDialog(song)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => handleDelete(song)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingSong ? "Edit Song" : "Add New Song"}
            </DialogTitle>
            <DialogDescription>
              Add song details, lyrics, and audio files
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Song title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist">Artist/Composer</Label>
                <Input
                  id="artist"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  placeholder="Hillsong, Elevation Worship..."
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="key_signature">Key</Label>
                <Input
                  id="key_signature"
                  value={formData.key_signature}
                  onChange={(e) => setFormData({ ...formData, key_signature: e.target.value })}
                  placeholder="C, G, Am..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempo">Tempo (BPM)</Label>
                <Input
                  id="tempo"
                  type="number"
                  value={formData.tempo}
                  onChange={(e) => setFormData({ ...formData, tempo: e.target.value })}
                  placeholder="120"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lyrics">Lyrics</Label>
              <Textarea
                id="lyrics"
                value={formData.lyrics}
                onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
                placeholder="Enter song lyrics..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <FileUpload
              bucket="song-audio"
              accept="audio/*,.mp3,.wav,.m4a"
              maxSize={50}
              onUpload={(url) => setFormData({ ...formData, audio_url: url })}
              currentUrl={formData.audio_url || null}
              label="Audio File (MP3, WAV, M4A)"
              icon="audio"
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={submitting}>
                {submitting ? "Saving..." : editingSong ? "Update Song" : "Add Song"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

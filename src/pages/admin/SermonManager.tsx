import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Video, Image, ArrowLeft, Edit, Trash2, Calendar, User, FileAudio, FileText, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/Layout";
import { FileUpload } from "@/components/FileUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { format } from "date-fns";
import { useUserChurch } from "@/hooks/useUserChurch";

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
  church_id: string | null;
  created_at: string;
}

export default function SermonManager() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pastor_name: "",
    sermon_date: new Date().toISOString().split("T")[0],
    video_url: "",
    thumbnail_url: "",
    audio_url: "",
    document_url: "",
    presentation_url: "",
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

    fetchSermons();
  };

  const fetchSermons = async () => {
    try {
      let query = supabase
        .from("sermons")
        .select("*")
        .order("sermon_date", { ascending: false });

      // If not admin, only show church-specific sermons
      if (!isAdmin && churchId) {
        query = query.eq("church_id", churchId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSermons(data || []);
    } catch (error: any) {
      toast.error("Failed to load sermons");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (sermon?: Sermon) => {
    if (sermon) {
      setEditingSermon(sermon);
      setFormData({
        title: sermon.title,
        description: sermon.description || "",
        pastor_name: sermon.pastor_name || "",
        sermon_date: sermon.sermon_date,
        video_url: sermon.video_url || "",
        thumbnail_url: sermon.thumbnail_url || "",
        audio_url: sermon.audio_url || "",
        document_url: sermon.document_url || "",
        presentation_url: sermon.presentation_url || "",
      });
    } else {
      setEditingSermon(null);
      setFormData({
        title: "",
        description: "",
        pastor_name: "",
        sermon_date: new Date().toISOString().split("T")[0],
        video_url: "",
        thumbnail_url: "",
        audio_url: "",
        document_url: "",
        presentation_url: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const sermonData = {
        title: formData.title,
        description: formData.description || null,
        pastor_name: formData.pastor_name || null,
        sermon_date: formData.sermon_date,
        video_url: formData.video_url || null,
        thumbnail_url: formData.thumbnail_url || null,
        audio_url: formData.audio_url || null,
        document_url: formData.document_url || null,
        presentation_url: formData.presentation_url || null,
        created_by: session?.user.id,
        church_id: churchId,
      };

      if (editingSermon) {
        const { error } = await supabase
          .from("sermons")
          .update(sermonData)
          .eq("id", editingSermon.id);

        if (error) throw error;
        toast.success("Sermon updated successfully");
      } else {
        const { error } = await supabase
          .from("sermons")
          .insert(sermonData);

        if (error) throw error;
        toast.success("Sermon added successfully");
      }

      setDialogOpen(false);
      fetchSermons();
    } catch (error: any) {
      toast.error(error.message || "Failed to save sermon");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sermon: Sermon) => {
    if (!confirm(`Are you sure you want to delete "${sermon.title}"?`)) return;

    try {
      const { error } = await supabase
        .from("sermons")
        .delete()
        .eq("id", sermon.id);

      if (error) throw error;
      toast.success("Sermon deleted");
      fetchSermons();
    } catch (error: any) {
      toast.error("Failed to delete sermon");
      console.error(error);
    }
  };

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
                  Sermon Manager
                </h1>
                {churchName && (
                  <p className="text-primary font-medium">{churchName}</p>
                )}
                <p className="text-muted-foreground text-lg mt-2">
                  Upload sermons with videos, audio, and documents
                </p>
              </div>
              <Button variant="hero" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4" />
                Add Sermon
              </Button>
            </div>
          </motion.div>

          {/* Sermons Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sermons.length === 0 ? (
              <div className="col-span-full glass-card p-12 text-center">
                <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">No sermons yet</p>
                <p className="text-muted-foreground mb-6">Add your first sermon to get started</p>
                <Button variant="hero" onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4" />
                  Add Sermon
                </Button>
              </div>
            ) : (
              sermons.map((sermon, index) => (
                <motion.div
                  key={sermon.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="glass-card overflow-hidden group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-secondary">
                    {sermon.thumbnail_url ? (
                      <img
                        src={sermon.thumbnail_url}
                        alt={sermon.title}
                        className="w-full h-full object-cover"
                      />
                    ) : sermon.video_url ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {sermon.video_url && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={sermon.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-full bg-primary text-primary-foreground"
                        >
                          <Video className="h-6 w-6" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-serif text-lg font-semibold mb-2 line-clamp-2">
                      {sermon.title}
                    </h3>
                    {sermon.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {sermon.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      {sermon.pastor_name && (
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {sermon.pastor_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(sermon.sermon_date), "MMM d, yyyy")}
                      </span>
                    </div>

                    {/* Resource indicators */}
                    <div className="flex items-center gap-2 mb-4">
                      {sermon.audio_url && (
                        <a href={sermon.audio_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-secondary hover:bg-primary/20 transition-colors" title="Audio">
                          <FileAudio className="h-4 w-4 text-primary" />
                        </a>
                      )}
                      {sermon.document_url && (
                        <a href={sermon.document_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-secondary hover:bg-primary/20 transition-colors" title="Document">
                          <FileText className="h-4 w-4 text-primary" />
                        </a>
                      )}
                      {sermon.presentation_url && (
                        <a href={sermon.presentation_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-secondary hover:bg-primary/20 transition-colors" title="Presentation">
                          <Presentation className="h-4 w-4 text-primary" />
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="glass"
                        onClick={() => handleOpenDialog(sermon)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => handleDelete(sermon)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingSermon ? "Edit Sermon" : "Add New Sermon"}
            </DialogTitle>
            <DialogDescription>
              Add sermon details, videos, audio, and documents
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
                  placeholder="Sermon title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pastor_name">Pastor Name</Label>
                <Input
                  id="pastor_name"
                  value={formData.pastor_name}
                  onChange={(e) => setFormData({ ...formData, pastor_name: e.target.value })}
                  placeholder="Pastor John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the sermon..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sermon_date">Sermon Date *</Label>
              <Input
                id="sermon_date"
                type="date"
                value={formData.sermon_date}
                onChange={(e) => setFormData({ ...formData, sermon_date: e.target.value })}
                required
                className="w-fit"
              />
            </div>

            <Tabs defaultValue="video" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="video">Video</TabsTrigger>
                <TabsTrigger value="audio">Audio</TabsTrigger>
                <TabsTrigger value="document">Document</TabsTrigger>
                <TabsTrigger value="presentation">Presentation</TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="video_url" className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" />
                    YouTube Video Link
                  </Label>
                  <Input
                    id="video_url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url" className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-primary" />
                    Thumbnail Image URL
                  </Label>
                  <Input
                    id="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {formData.video_url && getYouTubeEmbedUrl(formData.video_url) && (
                  <div className="aspect-video bg-secondary rounded-lg overflow-hidden">
                    <iframe
                      src={getYouTubeEmbedUrl(formData.video_url)!}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="audio" className="mt-4">
                <FileUpload
                  bucket="sermon-audio"
                  accept="audio/*"
                  maxSize={50}
                  icon="audio"
                  label="Sermon Audio (MP3, WAV)"
                  currentUrl={formData.audio_url}
                  onUpload={(url) => setFormData({ ...formData, audio_url: url })}
                />
              </TabsContent>

              <TabsContent value="document" className="mt-4">
                <FileUpload
                  bucket="sermon-documents"
                  accept=".pdf"
                  maxSize={20}
                  icon="document"
                  label="Sermon Notes (PDF)"
                  currentUrl={formData.document_url}
                  onUpload={(url) => setFormData({ ...formData, document_url: url })}
                />
              </TabsContent>

              <TabsContent value="presentation" className="mt-4">
                <FileUpload
                  bucket="sermon-presentations"
                  accept=".pdf,.ppt,.pptx"
                  maxSize={50}
                  icon="document"
                  label="Presentation (PDF, PPT, PPTX)"
                  currentUrl={formData.presentation_url}
                  onUpload={(url) => setFormData({ ...formData, presentation_url: url })}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={submitting}>
                {submitting ? "Saving..." : editingSermon ? "Update Sermon" : "Add Sermon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

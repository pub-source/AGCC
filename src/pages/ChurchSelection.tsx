import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Church, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChurchOption {
  id: string;
  name: string;
  slug: string;
  address: string | null;
}

export default function ChurchSelection() {
  const [churches, setChurches] = useState<ChurchOption[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChurches();
  }, []);

  const fetchChurches = async () => {
    const { data, error } = await supabase
      .from("churches")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to load churches");
      console.error(error);
    } else {
      setChurches(data || []);
    }
    setLoading(false);
  };

  const handleContinue = () => {
    if (!selectedChurch) {
      toast.error("Please select a church");
      return;
    }
    // Store selected church in sessionStorage for the registration page
    sessionStorage.setItem("selectedChurchId", selectedChurch);
    const church = churches.find(c => c.id === selectedChurch);
    if (church) {
      sessionStorage.setItem("selectedChurchName", church.name);
    }
    navigate("/register");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-violet-dark/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl mx-4"
      >
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="glass-card p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-violet-dark flex items-center justify-center mx-auto mb-6">
              <Church className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">
              Select Your Church
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose the AGCC branch you belong to
            </p>
          </div>

          {/* Church Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {churches.map((church, index) => (
              <motion.button
                key={church.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => setSelectedChurch(church.id)}
                className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                  selectedChurch === church.id
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedChurch === church.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <Church className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-lg">{church.name}</h3>
                </div>
                {church.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{church.address}</span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Continue Button */}
          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={handleContinue}
            disabled={!selectedChurch || submitting}
          >
            Continue to Registration
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

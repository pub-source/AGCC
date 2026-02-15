import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  BookOpen,
  Music,
  Users,
  DollarSign,
  Settings,
  Upload,
  FileText,
  Plus,
  Church,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useUserChurch } from "@/hooks/useUserChurch";

type AppRole = "member" | "pastor" | "worship_team" | "admin";
type RoleStatus = "pending" | "approved" | "rejected";

interface UserRole {
  role: AppRole;
  status: RoleStatus;
}

const dashboardCards = [
  {
    id: "events",
    title: "Events",
    description: "View upcoming services and events",
    icon: Calendar,
    href: "/events",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "sermons",
    title: "Sermons",
    description: "Watch and download messages",
    icon: BookOpen,
    href: "/sermons",
    color: "from-primary to-violet-dark",
  },
  {
    id: "songs",
    title: "Song Library",
    description: "Browse lyrics and worship songs",
    icon: Music,
    href: "/songs",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    id: "missions",
    title: "Missions",
    description: "Explore our global outreach",
    icon: Users,
    href: "/missions",
    color: "from-rose-500 to-rose-600",
  },
  {
    id: "giving",
    title: "Giving",
    description: "Give and view transparency",
    icon: DollarSign,
    href: "/giving",
    color: "from-amber-500 to-amber-600",
  },
  {
    id: "upload-sermon",
    title: "Manage Sermons",
    description: "Upload videos, audio & documents",
    icon: Upload,
    href: "/dashboard/sermons",
    color: "from-emerald-500 to-emerald-600",
    roles: ["pastor", "admin"],
  },
  {
    id: "manage-events",
    title: "Manage Events",
    description: "Create and manage events",
    icon: Calendar,
    href: "/dashboard/events",
    color: "from-sky-500 to-sky-600",
    roles: ["pastor", "admin"],
  },
  {
    id: "worship",
    title: "Manage Songs",
    description: "Add & edit songs and lyrics",
    icon: Music,
    href: "/dashboard/songs",
    color: "from-teal-500 to-teal-600",
    roles: ["worship_team", "pastor", "admin"],
  },
  {
    id: "finances",
    title: "Financial Records",
    description: "Manage church finances",
    icon: FileText,
    href: "/dashboard/finances",
    color: "from-orange-500 to-orange-600",
    roles: ["admin"],
  },
  {
    id: "users",
    title: "User Management",
    description: "Manage members & roles",
    icon: Users,
    href: "/dashboard/users",
    color: "from-indigo-500 to-indigo-600",
    roles: ["admin"],
  },
  {
    id: "settings",
    title: "Settings",
    description: "Church settings & configuration",
    icon: Settings,
    href: "/dashboard/settings",
    color: "from-gray-500 to-gray-600",
    roles: ["admin"],
  },
];

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { churchName, role, isApproved, isLoading: churchLoading } = useUserChurch();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role, status")
        .eq("user_id", session.user.id);

      if (roles && roles.length > 0) {
        const typedRoles = roles as UserRole[];
        const firstRole = typedRoles[0];
        
        if (firstRole.status === "pending" || firstRole.status === "rejected") {
          navigate("/pending-approval");
          return;
        }
        
        const approvedRoles = typedRoles
          .filter(r => r.status === "approved")
          .map(r => r.role);
        setUserRoles(approvedRoles);
      }

      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    checkAuth();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const visibleCards = dashboardCards.filter(card => {
    if (!(card as any).roles) return true;
    return userRoles.some(role => (card as any).roles?.includes(role));
  });

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
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Decorative background frame */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-0 w-96 h-96 bg-violet-dark/5 rounded-full blur-3xl" />
          <div className="absolute top-32 right-10 w-48 h-48 bg-gold/5 rounded-full blur-2xl" />
          {/* Corner ornaments */}
          <div className="absolute top-24 left-4 w-32 h-32 border-l-2 border-t-2 border-primary/10 rounded-tl-3xl" />
          <div className="absolute top-24 right-4 w-32 h-32 border-r-2 border-t-2 border-primary/10 rounded-tr-3xl" />
          <div className="absolute bottom-8 left-4 w-32 h-32 border-l-2 border-b-2 border-violet-dark/10 rounded-bl-3xl" />
          <div className="absolute bottom-8 right-4 w-32 h-32 border-r-2 border-b-2 border-violet-dark/10 rounded-br-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          {/* Header with decorative frame */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="glass-card p-8 md:p-10 gradient-border relative overflow-hidden">
              {/* Sparkle decoration */}
              <Sparkles className="absolute top-4 right-4 h-6 w-6 text-gold/30 animate-pulse-slow" />
              
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                Welcome Back<span className="text-gradient">,</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                <span className="text-lg">{user?.email}</span>
                <span className="text-primary">•</span>
                <span className="text-primary capitalize font-medium">
                  {userRoles.join(", ").replace(/_/g, " ") || "Member"}
                </span>
                {churchName && (
                  <>
                    <span className="text-primary">•</span>
                    <span className="inline-flex items-center gap-1.5 text-foreground font-medium">
                      <Church className="h-4 w-4 text-primary" />
                      {churchName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card p-6 mb-12"
          >
            <h2 className="font-serif text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              {(userRoles.includes("pastor") || userRoles.includes("admin")) && (
                <Button variant="hero" size="sm" onClick={() => navigate("/dashboard/sermons")}>
                  <Plus className="h-4 w-4" />
                  New Sermon
                </Button>
              )}
              {(userRoles.includes("worship_team") || userRoles.includes("pastor") || userRoles.includes("admin")) && (
                <Button variant="glass" size="sm" onClick={() => navigate("/dashboard/songs")}>
                  <Plus className="h-4 w-4" />
                  Add Song
                </Button>
              )}
              {(userRoles.includes("pastor") || userRoles.includes("admin")) && (
                <Button variant="glass" size="sm" onClick={() => navigate("/dashboard/events")}>
                  <Plus className="h-4 w-4" />
                  Create Event
                </Button>
              )}
              <Button variant="outline-glow" size="sm" onClick={() => navigate("/giving")}>
                <DollarSign className="h-4 w-4" />
                Give Now
              </Button>
            </div>
          </motion.div>

          {/* Dashboard Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              >
                <button
                  onClick={() => navigate(card.href)}
                  className="w-full text-left glass-card p-6 hover:border-primary/30 transition-all duration-300 group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{card.description}</p>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

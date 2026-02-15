import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroCommunity from "@/assets/hero-community.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <img
          src={heroCommunity}
          alt="Awesome God Christian Church community"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
      </div>

      {/* Content - bottom-left aligned like Austin Stone */}
      <div className="relative container mx-auto px-4 pb-16 pt-40 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-8 items-end">
          {/* Main heading */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-6"
            >
              <span className="text-foreground">We Are</span>
              <br />
              <span className="text-foreground">Awesome God</span>
              <br />
              <span className="text-gradient">Christian Church</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-muted-foreground mb-8 max-w-md"
            >
              You're invited to join us this Sunday. Come experience God's grace and love with our church family.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex gap-4"
            >
              <Button
                asChild
                className="rounded-full px-8 py-6 text-sm font-semibold uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90"
              >
                <Link to="/join">Visit</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="rounded-full px-8 py-6 text-sm font-semibold uppercase tracking-widest border-foreground/30 text-foreground hover:bg-foreground/10"
              >
                <Link to="/events">Get Involved</Link>
              </Button>
            </motion.div>
          </div>

          {/* Latest sermon card - right side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="hidden lg:block"
          >
            <div className="ml-auto max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Watch the Latest Sermon
              </p>
              <Link to="/sermons" className="block group">
                <div className="glass-card p-3 rounded-xl overflow-hidden hover:border-primary/30 transition-all">
                  <div className="aspect-video bg-gradient-to-br from-primary/30 to-accent rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-violet-dark/40" />
                    <div className="relative w-14 h-14 rounded-full bg-foreground/90 group-hover:bg-foreground flex items-center justify-center transition-all group-hover:scale-110">
                      <Play className="h-6 w-6 text-background ml-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

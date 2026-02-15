import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, Download, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LatestSermonSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 pattern-dots opacity-30" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary text-sm font-medium uppercase tracking-wider">
              Latest Message
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mt-4 mb-6">
              The Power of Faith
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              Join Pastor Dennis Pobadora as he explores the transformative power 
              of faith in our daily lives. Discover how trusting in God's plan can 
              bring peace and purpose to every situation.
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>February 2, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>45 minutes</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/sermons">
                  <Play className="h-5 w-5" />
                  Watch Now
                </Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link to="/sermons">
                  <Download className="h-5 w-5" />
                  Browse All
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Video Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="glass-card p-4 rounded-2xl glow-violet">
              <div className="aspect-video bg-gradient-to-br from-secondary to-card rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* Placeholder pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-violet-dark/20" />
                
                {/* Play button */}
                <Link
                  to="/sermons"
                  className="relative z-10 w-20 h-20 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-primary/30"
                >
                  <Play className="h-8 w-8 text-primary-foreground ml-1" />
                </Link>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 glass-card px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-primary">New This Week</span>
            </div>
          </motion.div>
        </div>

        {/* More Sermons Link */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Button variant="link" asChild className="text-lg">
            <Link to="/sermons">
              Browse All Sermons →
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

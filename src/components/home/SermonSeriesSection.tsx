import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function SermonSeriesSection() {
  return (
    <section className="py-24 md:py-32 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Sermon artwork */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-accent relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-violet-dark/90" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/70 mb-4">
                  Experience God's Grace
                </p>
                <h3 className="font-serif text-5xl md:text-6xl font-bold text-primary-foreground leading-tight">
                  The Power
                  <br />
                  of Faith
                </h3>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/60 mt-6">
                  A Sermon Series from AGCC
                </p>
              </div>
            </div>
          </motion.div>

          {/* Series info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background/50 mb-4">
              Current Sermon Series
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-background mb-6">
              The Power of Faith
            </h2>
            <p className="text-background/60 text-lg mb-8 leading-relaxed">
              Join Pastor Dennis Pobadora as he explores the transformative power 
              of faith in our daily lives. Discover how trusting in God's plan can 
              bring peace and purpose to every situation.
            </p>
            <Button
              asChild
              className="rounded-full px-8 py-6 text-sm font-semibold uppercase tracking-widest bg-background text-foreground hover:bg-background/90"
            >
              <Link to="/sermons">Explore Series</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

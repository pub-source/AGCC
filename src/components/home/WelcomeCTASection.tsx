import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroCommunity from "@/assets/hero-community.jpg";
export function WelcomeCTASection() {
  return (
    <section className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-0 items-stretch max-w-6xl mx-auto">
          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center py-12 lg:py-16 lg:pr-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              You are welcome here.
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Are you new to faith? Have you been following Jesus for a while? 
              Or are you somewhere in between? Come learn about Jesus alongside us!
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                asChild
                className="rounded-full px-8 py-6 text-sm font-semibold uppercase tracking-widest border-foreground/20 text-foreground hover:bg-foreground/5"
              >
                <Link to="/join">Visit</Link>
              </Button>
              <Button
                asChild
                className="rounded-full px-8 py-6 text-sm font-semibold uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90"
              >
                <Link to="/events">Get Involved</Link>
              </Button>
            </div>
          </motion.div>

          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="relative"
          >
            <img
              src={heroCommunity}
              alt="Welcome to our church"
              className="w-full h-full min-h-[400px] object-cover rounded-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

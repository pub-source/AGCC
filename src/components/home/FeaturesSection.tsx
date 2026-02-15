import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, BookOpen, Heart, Users, Music, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Calendar,
    title: "Events & Services",
    description: "Stay connected with our community events, weekly services, and special gatherings.",
    href: "/events",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: BookOpen,
    title: "Sermons",
    description: "Access powerful messages from our pastors. Watch, listen, or download anytime.",
    href: "/sermons",
    color: "from-primary to-violet-dark",
  },
  {
    icon: Heart,
    title: "Missions",
    description: "Discover how we're making a difference locally and around the world.",
    href: "/missions",
    color: "from-rose-500 to-rose-600",
  },
  {
    icon: HandHeart,
    title: "Giving & Transparency",
    description: "Support our mission with secure giving. See exactly where your contributions go.",
    href: "/giving",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: Music,
    title: "Worship Songs",
    description: "Browse our song library with lyrics. Follow along during worship.",
    href: "/songs",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with small groups, ministries, and fellow believers.",
    href: "/join",
    color: "from-cyan-500 to-cyan-600",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 section-elevated">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            Our Ministry
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mt-4 mb-6">
            Grow in Faith Together
          </h2>
          <p className="text-muted-foreground text-lg">
            Explore the many ways you can connect, serve, and grow with our church family.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={feature.href}
                className="block h-full glass-card p-8 group hover:border-primary/30 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Button variant="outline-glow" size="lg" asChild>
            <Link to="/join">Join Our Community</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

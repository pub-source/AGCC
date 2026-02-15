import { motion } from "framer-motion";
import { Church, Users, Heart, Globe } from "lucide-react";

const stats = [
  { icon: Church, value: "3", label: "Church Branches", color: "text-primary" },
  { icon: Users, value: "500+", label: "Active Members", color: "text-blue-400" },
  { icon: Heart, value: "15+", label: "Years of Ministry", color: "text-rose-400" },
  { icon: Globe, value: "10+", label: "Mission Partners", color: "text-emerald-400" },
];

export function StatsSection() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-violet-dark/5 to-primary/5" />

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="glass-card p-6 md:p-8 hover:border-primary/20 transition-all duration-300">
                <stat.icon className={`h-8 w-8 mx-auto mb-4 ${stat.color}`} />
                <p className="font-serif text-3xl md:text-4xl font-bold mb-2">{stat.value}</p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

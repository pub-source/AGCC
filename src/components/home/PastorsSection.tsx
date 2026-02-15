import { motion } from "framer-motion";

const pastors = [
  {
    name: "Pastor Dennis Pobadora",
    role: "Senior Pastor",
    initials: "DP",
  },
  {
    name: "Pastor Josephine Pobadora",
    role: "Senior Pastor's Wife",
    initials: "JP",
  },
];

export function PastorsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            Our Leadership
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mt-4 mb-6">
            Meet Our Pastors
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Guided by faith and a heart for service, our pastors lead our congregation with love and wisdom.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-center max-w-3xl mx-auto">
          {pastors.map((pastor, index) => (
            <motion.div
              key={pastor.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="flex-1 w-full"
            >
              <div className="glass-card p-8 text-center group hover:border-primary/30 transition-all duration-300">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-violet-dark flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                  <span className="text-primary-foreground font-serif font-bold text-2xl">
                    {pastor.initials}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {pastor.name}
                </h3>
                <p className="text-primary text-sm font-medium">{pastor.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

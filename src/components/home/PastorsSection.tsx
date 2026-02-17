import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ptrDennisImg from "@/assets/ptrDennis.jpg";
import jho from "@/assets/ptraJho.jpg";
import ptrMelvinImg from "@/assets/ptrmelvin.jpg";
import familyEdmarImg from "@/assets/familyEdmar.jpg";
import nelson from "@/assets/nelson.jpg";
import danilo from "@/assets/danilo.jpg";
import peniamenteImg from "@/assets/peniamante.jpg";
import batangasImg from "@/assets/ptraRachell.jpg";
import villa2Img from "@/assets/villa2.jpg";

const seniorPastors = [
  { name: "Ptr. Dennis Pobadora", role: "Senior Pastor", initials: "DP", image: ptrDennisImg },
  { name: "Ptr. Josephine Pobadora", role: "Co-Pastor", initials: "JP", image: jho },
];

const otherPastors = [
  { name: "Ptr. Melvin Arellano", role: "Associate Pastor", initials: "MA", image: ptrMelvinImg },
  { name: "Ptr. John Edmar Redoble", role: "Associate Pastor", initials: "JR", image: familyEdmarImg },
  { name: "Ptr. Nelson Roca", role: "Pastor", initials: "NR", image: nelson },
  { name: "Ptr. Danilo Malazarte", role: "Pastor", initials: "DM", image: danilo },
  { name: "Ptr. Geryme Peñamante", role: "Pastor", initials: "GP", image: peniamenteImg },
  { name: "Ptra. Rachelle Albarico", role: "Pastor", initials: "RA", image: batangasImg },
];

function PastorCard({ pastor, index }: { pastor: typeof seniorPastors[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="w-full"
    >
      <div className="glass-card p-8 text-center group hover:border-primary/30 transition-all duration-300">
        <Avatar className="w-24 h-24 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20 ring-2 ring-primary/20">
          <AvatarImage src={pastor.image} alt={pastor.name} className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-primary to-violet-dark text-primary-foreground font-serif font-bold text-2xl">
            {pastor.initials}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
          {pastor.name}
        </h3>
        <p className="text-primary text-sm font-medium">{pastor.role}</p>
      </div>
    </motion.div>
  );
}

export function PastorsSection() {
  const [showOthers, setShowOthers] = useState(false);

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

        {/* Senior Pastors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-8">
          {seniorPastors.map((pastor, index) => (
            <PastorCard key={pastor.name} pastor={pastor} index={index} />
          ))}
        </div>

        {/* Toggle Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowOthers(!showOthers)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          >
            <span className="text-sm font-medium uppercase tracking-wider">
              {showOthers ? "Hide" : "View All"} Pastors
            </span>
            <motion.div
              animate={{ rotate: showOthers ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="h-5 w-5 group-hover:text-primary transition-colors" />
            </motion.div>
          </button>
        </div>

        {/* Other Pastors - Collapsible */}
        <AnimatePresence>
          {showOthers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto pt-4">
                {otherPastors.map((pastor, index) => (
                  <PastorCard key={pastor.name} pastor={pastor} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

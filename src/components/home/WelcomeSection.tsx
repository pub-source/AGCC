import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import heroCommunity from "@/assets/hero-community.jpg";
import heroImg from "@/assets/hero.jpg";
import leadToServe from "@/assets/lead to serve.jpg";
import ministry from "@/assets/ministry.jpg";
import ministry2 from "@/assets/ministry2.jpg";
import batanggas from "@/assets/batanggas.jpg";
import boys from "@/assets/boys.jpg";
import dominguito from "@/assets/dominguito.jpg";
import familyEdmar from "@/assets/familyEdmar.jpg";
import familytubo from "@/assets/familytubo.jpg";
import girls from "@/assets/girls.jpg";
import irah from "@/assets/irah.jpg";
import nanays from "@/assets/nanay's.jpg";
import peniamante from "@/assets/peniamante.jpg";
import pobadora from "@/assets/pobadora.jpg";
import villa2 from "@/assets/villa2.jpg";
import villafamily from "@/assets/villafamily.jpg";

const galleryImages = [
  { src: heroCommunity, alt: "Church community gathering" },
  { src: heroImg, alt: "Church hero" },
  { src: leadToServe, alt: "Lead to serve" },
  { src: ministry, alt: "Ministry" },
  { src: ministry2, alt: "Ministry outreach" },
  { src: batanggas, alt: "Batanggas outreach" },
  { src: boys, alt: "Boys ministry" },
  { src: dominguito, alt: "Dominguito" },
  { src: familyEdmar, alt: "Family Edmar" },
  { src: familytubo, alt: "Family Tubo" },
  { src: girls, alt: "Girls ministry" },
  { src: irah, alt: "Irah" },
  { src: nanays, alt: "Nanay's gathering" },
  { src: peniamante, alt: "Peniamante" },
  { src: pobadora, alt: "Pobadora" },
  { src: villa2, alt: "Villa outreach" },
  { src: villafamily, alt: "Villa family" },
];

export function WelcomeSection() {
  return (
    <section className="py-24 md:py-32 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-background/50 mb-6"
          >
            Welcome to Awesome God Christian Church
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-background leading-tight mb-8"
          >
            Gathering together to love God, the church, and the community.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex gap-4"
          >
            <Button
              asChild
              className="rounded-full px-8 py-6 text-sm font-semibold uppercase tracking-widest bg-background text-foreground hover:bg-background/90"
            >
              <Link to="/join">Visit</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="rounded-full px-8 py-6 text-sm font-semibold uppercase tracking-widest border-background/30 text-background hover:bg-background/10"
            >
              <Link to="/events">About Us</Link>
            </Button>
          </motion.div>
        </div>

        {/* Photo carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Carousel
            opts={{ align: "start", loop: true, dragFree: true }}
            plugins={[Autoplay({ delay: 1500, stopOnInteraction: false, stopOnMouseEnter: false })]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {galleryImages.map((img) => (
                <CarouselItem key={img.alt} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <div className="overflow-hidden rounded-xl">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-72 md:h-80 object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 bg-background text-foreground border-0 hover:bg-background/80" />
            <CarouselNext className="hidden md:flex -right-4 bg-background text-foreground border-0 hover:bg-background/80" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}

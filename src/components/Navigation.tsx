"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Bouquet", href: "#bouquet" },
  { name: "Message", href: "#message" },
  { name: "Flowers", href: "#flowers" },
  { name: "Garden", href: "#interactive" },
  { name: "For You", href: "#for-you" },
];

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("bouquet");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);

      const sections = ["bouquet", "message", "flowers", "interactive", "for-you"];
      const scrollPosition = window.scrollY + 250;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace("#", "");
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
        className={`pointer-events-auto flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full luxury-glass transition-all duration-300 ${
          isScrolled ? "shadow-md shadow-rose-900/5 bg-white/85" : "bg-white/60"
        }`}
      >
        <span className="hidden sm:inline-flex items-center pl-1 pr-2 text-xs font-serif text-[#6B172A]/75 italic">
          Lena & Sanoof
        </span>
        <span className="hidden sm:inline-block w-px h-3 bg-rose-200" />

        {navItems.map((item) => {
          const sectionId = item.href.replace("#", "");
          const isActive = activeSection === sectionId;

          return (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => scrollToSection(e, item.href)}
              className={`relative px-2.5 py-1 text-xs font-medium transition-colors duration-200 rounded-full ${
                isActive
                  ? "text-[#6B172A] font-semibold"
                  : "text-[#3D2C2E]/70 hover:text-[#6B172A]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavPill"
                  className="absolute inset-0 rounded-full bg-rose-100/80 -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              {item.name}
            </a>
          );
        })}
      </motion.nav>
    </header>
  );
}

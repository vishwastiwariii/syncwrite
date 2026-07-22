import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Templates from "../components/Templates";
import Footer from "../components/Footer";

/* ─── Home ─────────────────────────────────────────────────────────────────
   Rebuild in progress (see SyncWrite.pdf design system).
   Steps: 1 Navbar · 2 Hero · 3 Features · 5 Templates · 10 Footer.           */
export default function Home() {
  return (
    <div className="min-h-screen bg-sw-bg text-sw-ink">
      <Navbar />
      <Hero />
      <Features />
      <Templates />
      <Footer />
    </div>
  );
}

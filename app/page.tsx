"use client";

import { Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ThemeSwitcher } from "@/components/theme-switcher";

// Lazy load the heavy components
const WorldMapDemo = dynamic(() => import("@/components/ui/world-map-demo"), {
  loading: () => (
    <div className="w-full h-96 bg-muted/20 rounded-lg flex items-center justify-center">
      <div className="text-foreground/80 font-medium">Loading map...</div>
    </div>
  ),
});

const IndiaMapComponent = dynamic(() => import("@/components/ui/india-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-muted/20 rounded-lg flex items-center justify-center">
      <div className="text-foreground/80 font-medium">Loading India map...</div>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="min-h-screen">
      <div
        className="absolute left-0 right-0 top-0 bottom-0 z-0 opacity-60 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <Suspense
          fallback={
            <div className="w-full h-full bg-muted/20 flex items-center justify-center">
              <div className="text-foreground/80 font-medium">
                Loading map...
              </div>
            </div>
          }
        >
          <WorldMapDemo />
        </Suspense>
      </div>
      {/* Header */}
      <header className="relative">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">InfyRescue</h1>
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              Helper
            </Link>
            <Link
              href="/gemini-demo"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              Gemini AI
            </Link>
            <Link
              href="/help"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-6 py-2 rounded-lg font-medium transition-colors shadow-lg"
            >
              Need Help
            </Link>
            <ThemeSwitcher />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 relative min-h-screen">
        {/* World Map Background - Extended to cover multiple sections */}

        {/* Hero Section with World Map Background */}
        <section className="py-20 text-center relative">
          {/* Hero Content - Higher z-index */}
          <div className="relative z-20 rounded-lg p-8">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 drop-shadow-lg">
              Disaster Response
              <br />
              <span className="text-foreground/90">Coordination Hub</span>
            </h1>

            <p className="text-xl text-foreground/85 max-w-3xl mx-auto mb-8 leading-relaxed drop-shadow-md font-medium">
              Real-time disaster response coordination platform that fuses
              space-based insights and ground-level data for faster, smarter
              decision-making in crisis situations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg">
                Volunteer Now
              </button>
            </div>
          </div>
          <footer
            id="contact"
            className="py-12 bg-background/10 backdrop-blur-sm rounded-lg mx-4 mb-4"
          >
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground drop-shadow-lg">
                    Our Goal
                  </h3>
                  <p className="text-foreground/85 text-sm drop-shadow-md font-medium">
                    Real-time coordination platform for emergency response
                    teams.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground drop-shadow-lg">
                    Features
                  </h4>
                  <ul className="space-y-2 text-sm text-foreground/85">
                    <li className="drop-shadow-md font-medium">
                      AI-Powered Triage
                    </li>
                    <li className="drop-shadow-md font-medium">
                      Disaster Mapping
                    </li>
                    <li className="drop-shadow-md font-medium">
                      Route Planning
                    </li>
                    <li className="drop-shadow-md font-medium">
                      Resource Management
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground drop-shadow-lg">
                    Resources
                  </h4>
                  <ul className="space-y-2 text-sm text-foreground/85">
                    <li className="drop-shadow-md">
                      <Link
                        href="/dashboard"
                        className="hover:text-foreground transition-colors font-medium"
                      >
                        Emergency Dashboard
                      </Link>
                    </li>
                    <li className="drop-shadow-md">
                      <Link
                        href="/help"
                        className="hover:text-foreground transition-colors font-medium"
                      >
                        Help & Support
                      </Link>
                    </li>
                    <li className="drop-shadow-md font-medium">
                      Documentation
                    </li>
                    <li className="drop-shadow-md font-medium">
                      Training Materials
                    </li>
                    <li className="drop-shadow-md font-medium">Support</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground drop-shadow-lg">
                    Contact
                  </h4>
                  <ul className="space-y-2 text-sm text-foreground/85">
                    <li className="drop-shadow-md font-medium">
                      info@infyRescue.com
                    </li>
                    <li className="drop-shadow-md font-medium">
                      +1 (555) 123-4567
                    </li>
                    <li className="drop-shadow-md font-medium">
                      Emergency: 911
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </footer>
        </section>

        {/* India Emergency Response Section */}
        <section className="py-20 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              India Emergency Response Network
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Interactive map showing relief camps, safe zones, and emergency services across India. 
              Get real-time information about disaster response resources in your area.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border">
              <div className="h-96">
                <IndiaMapComponent />
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link
                href="/help"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg"
              >
                Explore Emergency Resources
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}

        {/* About Section */}
      </main>
    </div>
  );
}

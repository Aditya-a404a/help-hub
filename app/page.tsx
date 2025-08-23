import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import WorldMapDemo from "@/components/ui/world-map-demo";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">
          InfyRescue
          </h1>
          <nav className="flex items-center gap-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
            <ThemeSwitcher />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4">
        {/* Hero Section with World Map Background */}
        <section className="py-20 text-center relative">
          {/* Hero Content - Higher z-index */}
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 drop-shadow-lg">
              Disaster Response
              <br />
              <span className="text-muted-foreground">Coordination Hub</span>
            </h1>
            
            {/* World Map Background - positioned after the title */}
            <div className="absolute left-0 right-0 top-32 bottom-0 z-0 opacity-40">
              <WorldMapDemo />
            </div>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed drop-shadow-md">
              Real-time disaster response coordination platform that fuses space-based insights 
              and ground-level data for faster, smarter decision-making in crisis situations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg">
                Get Started
              </button>
              <button className="border border-border px-8 py-3 rounded-lg font-medium hover:bg-accent transition-colors shadow-lg">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Essential tools for effective disaster response coordination
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border border-border rounded-lg hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">AI-Powered Triage</h3>
              <p className="text-muted-foreground">
                Analyze and classify real-time social media posts to identify rescue needs and safe locations.
              </p>
            </div>

            <div className="p-6 border border-border rounded-lg hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Disaster Mapping</h3>
              <p className="text-muted-foreground">
                Integrate radar imagery to map flood extent and terrain changes with reliable visibility.
              </p>
            </div>

            <div className="p-6 border border-border rounded-lg hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🛣️</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Route Planning</h3>
              <p className="text-muted-foreground">
                Calculate safest and fastest routes for emergency vehicles using live data.
              </p>
            </div>

            <div className="p-6 border border-border rounded-lg hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Resource Management</h3>
              <p className="text-muted-foreground">
                Track supplies across relief centers and optimize resource allocation.
              </p>
            </div>

            <div className="p-6 border border-border rounded-lg hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Volunteer Coordination</h3>
              <p className="text-muted-foreground">
                Match volunteers with tasks and enable peer-to-peer communication.
              </p>
            </div>

            <div className="p-6 border border-border rounded-lg hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Real-time Dashboard</h3>
              <p className="text-muted-foreground">
                Centralized operational view for faster decision-making in crisis situations.
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Build a real-time disaster response coordination platform for District Disaster Management Authorities (DDMAs). 
              Our solution fuses space-based insights and ground-level data into a centralized dashboard that maps affected 
              areas using satellite data, overlays geo-tagged SOS requests, and displays live data on relief resources.
            </p>
            <p className="text-muted-foreground">
              The platform provides a clear operational picture that enables faster, smarter decision-making in crisis situations.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="bg-muted/50 rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Transform Disaster Response?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join us in building a safer, more coordinated future for emergency response teams and communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Request Demo
              </button>
              <button className="border border-border px-8 py-3 rounded-lg font-medium hover:bg-accent transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Disaster Response Hub</h3>
              <p className="text-muted-foreground text-sm">
                Real-time coordination platform for emergency response teams.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>AI-Powered Triage</li>
                <li>Disaster Mapping</li>
                <li>Route Planning</li>
                <li>Resource Management</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Training Materials</li>
                <li>Support</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>info@disasterresponsehub.com</li>
                <li>+1 (555) 123-4567</li>
                <li>Emergency: 911</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
"use client";

import { useState } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info, Phone, Mail, MapPin, Clock, Users, Shield, X, Tent, Ambulance } from "lucide-react";
import { toast, Toaster } from "sonner";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/emergency-map"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

export default function HelpPage() {
  const [formData, setFormData] = useState({
    mobileNumber: '',
    emergencyType: 'Natural Disaster',
    description: '',
    latitude: '',
    longitude: '',
    locationCaptured: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(true);
  const [selectedSection, setSelectedSection] = useState('emergency');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsSubmitting(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            locationCaptured: true
          }));
          setIsSubmitting(false);
          toast.success('Location acquired successfully', {
            description: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            duration: 4000,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to acquire location', {
            description: 'Please enter coordinates manually or try again.',
            duration: 4000,
          });
          setIsSubmitting(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      toast.error('Geolocation not supported', {
        description: 'Your browser does not support location services.',
        duration: 4000,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mobileNumber || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!formData.latitude || !formData.longitude) {
      alert('Please provide your location coordinates');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Emergency alert submitted:', formData);
      alert('Emergency alert sent! Response teams have been notified.');
      setIsSubmitting(false);
      // Close banner and reset form
      setShowEmergencyBanner(false);
      setFormData({
        mobileNumber: '',
        emergencyType: 'Natural Disaster',
        description: '',
        latitude: '',
        longitude: '',
        locationCaptured: false
      });
    }, 2000);
  };

  const closeEmergencyBanner = () => {
    setShowEmergencyBanner(false);
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'emergency':
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">Emergency Assistance</h1>
              <p className="text-lg text-muted-foreground">
                Need immediate help? Fill out the emergency form below to get assistance quickly.
              </p>
            </div>

            {/* Emergency Contact Banner */}
            <Alert className="mb-8 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Emergency?</strong> If you&apos;re in immediate danger, call 911 or your local emergency services immediately. 
                This platform is for coordination and should not replace emergency calls.
              </AlertDescription>
            </Alert>

            {/* Show Emergency Form Button */}
            {!showEmergencyBanner && (
              <div className="text-center mb-8">
                <Button
                  onClick={() => setShowEmergencyBanner(true)}
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600 text-lg py-3 px-8"
                >
                  Need Emergency Help? Click Here
                </Button>
              </div>
            )}

            {/* Emergency Form Modal */}
            {showEmergencyBanner && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeEmergencyBanner}></div>
                <div className="relative bg-background border rounded-xl shadow-2xl max-w-4xl w-full p-10">
                  {/* Close Button */}
                  <button
                    onClick={closeEmergencyBanner}
                    className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {/* Form Header */}
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                      Emergency Assistance Required
                    </h2>
                    <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                      Please provide your location and contact information so we can dispatch emergency response immediately
                    </p>
                  </div>

                  {/* Emergency Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Top Row - Contact Info */}
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Mobile Number *
                        </label>
                        <input 
                          type="tel" 
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Emergency Type
                        </label>
                        <select 
                          name="emergencyType"
                          value={formData.emergencyType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                        >
                          <option>Natural Disaster</option>
                          <option>Medical Emergency</option>
                          <option>Fire</option>
                          <option>Accident</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Brief Description
                        </label>
                        <input 
                          type="text"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                          placeholder="What happened?"
                          required
                        />
                      </div>
                    </div>

                    {/* Middle Row - Location Section */}
                    <div className="bg-muted/50 p-5 rounded-xl border">
                      <div className="text-center mb-4">
                        <h3 className="text-base font-semibold text-foreground mb-2">
                          Location Information
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          We need your exact location to dispatch emergency response quickly
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <Button 
                          type="button" 
                          onClick={handleGetLocation}
                          disabled={isSubmitting}
                          variant="outline"
                          className="font-medium py-3 px-6 text-base"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              Acquiring Location...
                            </>
                          ) : (
                            <>
                              Acquire My Location
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Bottom Row - Submit Section */}
                    <div className="text-center space-y-3">
                      <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                          This will immediately notify emergency services response team
                        </p>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting || !formData.latitude || !formData.longitude}
                        className="bg-red-600 hover:bg-red-700 text-white border-red-600 text-lg py-4 px-10 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending Emergency Alert...
                          </>
                        ) : (
                          'SEND EMERGENCY ALERT'
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case 'relief-camps':
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">Relief Camps</h1>
              <p className="text-lg text-muted-foreground">
                Find nearby relief camps and emergency shelters in your area.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Relief Camp Information</CardTitle>
                <CardDescription>Coming soon - Interactive map and real-time data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">This section will show relief camps, their capacity, and current status.</p>
              </CardContent>
            </Card>
          </div>
        );

      case 'safe-points':
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">Safe Points & Assembly Areas</h1>
              <p className="text-lg text-muted-foreground">
                Locate designated safe zones and emergency assembly points.
              </p>
            </div>
            
            {/* Interactive Map */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Emergency Safe Points Map</CardTitle>
                <CardDescription>Your location and nearby safe zones</CardDescription>
              </CardHeader>
              <CardContent>
                <MapComponent />
              </CardContent>
            </Card>

            {/* Safe Points List */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Community Center
                  </CardTitle>
                  <CardDescription>Primary assembly point with reinforced structures</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>0.8 km away</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Capacity: 500 people</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>Flood-proof, Earthquake-resistant</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    High School Gymnasium
                  </CardTitle>
                  <CardDescription>Designated storm shelter with medical facilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>1.2 km away</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Capacity: 800 people</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>Storm shelter, Medical support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    City Hall
                  </CardTitle>
                  <CardDescription>Emergency operations command center</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>1.5 km away</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Capacity: 200 people</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>Command center, Communication hub</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Public Library
                  </CardTitle>
                  <CardDescription>Emergency shelter with backup power</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>0.6 km away</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Capacity: 300 people</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>Backup power, Water supply</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'emergency-services':
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">Emergency Services</h1>
              <p className="text-lg text-muted-foreground">
                Access emergency medical, fire, police, and rescue services.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Emergency Services Directory</CardTitle>
                <CardDescription>Coming soon - Response times and contact information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">This section will list all available emergency services in your area.</p>
              </CardContent>
            </Card>
          </div>
        );

      case 'training':
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">Training & Resources</h1>
              <p className="text-lg text-muted-foreground">
                Learn emergency response protocols and access training materials.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Training Resources</CardTitle>
                <CardDescription>Coming soon - Safety protocols and certification programs</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">This section will provide training materials and safety protocols.</p>
              </CardContent>
            </Card>
          </div>
        );

      case 'faq':
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
              <p className="text-lg text-muted-foreground">
                Find answers to common questions about emergency response and platform usage.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Common Questions</CardTitle>
                <CardDescription>Coming soon - Comprehensive FAQ database</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">This section will contain frequently asked questions and answers.</p>
              </CardContent>
            </Card>
          </div>
        );

      case 'contact':
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">Contact Support</h1>
              <p className="text-lg text-muted-foreground">
                Get in touch with our support team for assistance and inquiries.
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Support Channels</CardTitle>
                <CardDescription>Multiple ways to reach our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@infyrescue.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Support Hours</p>
                    <p className="text-sm text-muted-foreground">24/7 Emergency Support</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
            InfyRescue
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <button
              onClick={() => setShowEmergencyBanner(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-medium transition-colors px-4 py-2 rounded-md shadow-sm hover:shadow-md"
            >
              Emergency
            </button>
            <ThemeSwitcher />
          </nav>
        </div>
      </header>

      <main className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-muted/30 border-r min-h-screen p-6">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-2">Help & Support</h2>
            <p className="text-sm text-muted-foreground">Navigate to different support areas</p>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={() => setSelectedSection('emergency')}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedSection === 'emergency' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Emergency Help</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedSection('relief-camps')}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedSection === 'relief-camps' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tent className="w-5 h-5" />
                <span className="font-medium">Relief Camps</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedSection('safe-points')}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedSection === 'safe-points' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Safe Points</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedSection('emergency-services')}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedSection === 'emergency-services' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Ambulance className="w-5 h-5" />
                <span className="font-medium">Emergency Services</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedSection('training')}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedSection === 'training' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span className="font-medium">Training & Resources</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedSection('faq')}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedSection === 'faq' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5" />
                <span className="font-medium">FAQ</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedSection('contact')}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedSection === 'contact' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <span className="font-medium">Contact Support</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </main>

      {/* Sonner Toaster */}
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            background: '#166534',
            color: '#ffffff',
            border: '1px solid #15803d'
          },
          className: 'dark:bg-green-800 dark:border-green-700'
        }}
      />
    </div>
  );
}

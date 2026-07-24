import { HeroSection } from "@/components/landing/HeroSection";
import { Navbar } from "@/components/landing/Navbar";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { AIFeatures } from "@/components/landing/AIFeatures";
import { CourseShowcase } from "@/components/landing/CourseShowcase";
import { TestSeriesPreview } from "@/components/landing/TestSeriesPreview";
import { StudentDashboardMockup } from "@/components/landing/StudentDashboardMockup";
import { TestimonialsAndResults } from "@/components/landing/TestimonialsAndResults";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Stats / Trusted By (Integrated into Hero or separate) */}

      {/* Feature Grid */}
      <FeatureGrid />

      {/* AI Features Dashboard Preview */}
      <AIFeatures />

      {/* Courses */}
      <CourseShowcase />

      {/* Test Series Preview */}
      <TestSeriesPreview />

      {/* Student Dashboard Mockup */}
      <StudentDashboardMockup />

      {/* Testimonials & AIR Results */}
      <TestimonialsAndResults />

      {/* Footer */}
      <Footer />
    </main>
  );
}

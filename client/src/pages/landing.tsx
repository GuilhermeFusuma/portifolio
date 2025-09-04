import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import FeaturedProjects from "@/components/featured-projects";
import AboutSection from "@/components/about-section";
import AllProjectsSection from "@/components/all-projects-section";
import ContactSection from "@/components/contact-section";

export default function Landing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect if authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={false} />
      <HeroSection />
      <FeaturedProjects />
      <AboutSection />
      <AllProjectsSection />
      <ContactSection />
      
      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-card-foreground mb-2">Portfolio AI</h3>
            <p className="text-muted-foreground mb-4">
              Desenvolvido com 💙 usando Inteligência Artificial
            </p>
            <p className="text-sm text-muted-foreground">
              © 2024 Portfolio Digital. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

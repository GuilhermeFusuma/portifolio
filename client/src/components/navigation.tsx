import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Settings } from "lucide-react";

interface NavigationProps {
  isAuthenticated: boolean;
}

export default function Navigation({ isAuthenticated }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const NavLinks = () => (
    <>
      <button
        onClick={() => scrollToSection("inicio")}
        className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
        data-testid="link-inicio"
      >
        Início
      </button>
      <button
        onClick={() => scrollToSection("sobre")}
        className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
        data-testid="link-sobre"
      >
        Sobre
      </button>
      <button
        onClick={() => scrollToSection("projetos")}
        className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
        data-testid="link-projetos"
      >
        Projetos
      </button>
      <button
        onClick={() => scrollToSection("contato")}
        className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
        data-testid="link-contato"
      >
        Contato
      </button>
    </>
  );

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary" data-testid="text-logo">Portfolio AI</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLinks />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/admin">
                  <Button variant="outline" size="sm" data-testid="link-admin">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
                <Button
                  onClick={() => (window.location.href = "/api/logout")}
                  variant="outline"
                  size="sm"
                  data-testid="button-logout"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = "/api/login")}
                data-testid="button-login"
              >
                Login
              </Button>
            )}
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks />
                  {isAuthenticated && (
                    <>
                      <Link href="/admin">
                        <Button variant="outline" className="w-full justify-start" data-testid="link-admin-mobile">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin
                        </Button>
                      </Link>
                      <Button
                        onClick={() => (window.location.href = "/api/logout")}
                        variant="outline"
                        className="w-full"
                        data-testid="button-logout-mobile"
                      >
                        Logout
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

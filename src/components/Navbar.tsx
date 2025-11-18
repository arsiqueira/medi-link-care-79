import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/medilink-logo.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logo} 
              alt="MediLink Logo" 
              className="h-12 w-12 transition-transform group-hover:scale-110"
            />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MediLink
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/#recursos" className="text-foreground hover:text-primary transition-colors">
              Recursos
            </Link>
            <Link to="/#como-funciona" className="text-foreground hover:text-primary transition-colors">
              Como Funciona
            </Link>
            <Link to="/#sobre" className="text-foreground hover:text-primary transition-colors">
              Sobre
            </Link>
            <Link to="/auth">
              <Button variant="outline" className="mr-2">
                Entrar
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                Começar Agora
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link
                to="/#recursos"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Recursos
              </Link>
              <Link
                to="/#como-funciona"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Como Funciona
              </Link>
              <Link
                to="/#sobre"
                className="text-foreground hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full mb-2">
                  Entrar
                </Button>
              </Link>
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-gradient-primary hover:opacity-90">
                  Começar Agora
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

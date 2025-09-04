import { Mail, Linkedin, Github, Twitter, Instagram } from "lucide-react";

export default function ContactSection() {
  return (
    <section id="contato" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Vamos Conversar?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Interessado em colaborar ou discutir um projeto? Entre em contato!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="mailto:contato@portfolio.dev"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-medium transition-all duration-300 inline-flex items-center justify-center"
              data-testid="link-email"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </a>
            <a
              href="https://linkedin.com/in/portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card text-card-foreground hover:bg-accent border border-border px-8 py-3 rounded-lg font-medium transition-all duration-300 inline-flex items-center justify-center"
              data-testid="link-linkedin"
            >
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </a>
          </div>
          <div className="flex justify-center space-x-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="link-github"
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="link-twitter"
            >
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              data-testid="link-instagram"
            >
              <Instagram className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

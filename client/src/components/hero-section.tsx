export default function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="inicio" className="gradient-bg py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-8">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300"
              alt="Foto do desenvolvedor"
              className="w-32 h-32 rounded-full mx-auto shadow-xl ring-4 ring-primary/20 object-cover"
              data-testid="img-developer-photo"
            />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Portfolio Digital
            <span className="text-primary block">Interativo</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Desenvolvedor Full Stack especializado em criar experiências digitais inovadoras com inteligência artificial
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection("projetos")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              data-testid="button-view-projects"
            >
              Ver Projetos
            </button>
            <button
              onClick={() => scrollToSection("sobre")}
              className="bg-card text-card-foreground hover:bg-accent border border-border px-8 py-3 rounded-lg font-medium transition-all duration-300"
              data-testid="button-about-me"
            >
              Sobre Mim
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

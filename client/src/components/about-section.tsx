export default function AboutSection() {
  return (
    <section id="sobre" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Sobre Mim</h2>
            <p className="text-muted-foreground text-lg">
              Desenvolvedor apaixonado por tecnologia e inovação
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
                alt="Desenvolvedor trabalhando"
                className="rounded-xl shadow-lg w-full object-cover"
                data-testid="img-developer-working"
              />
            </div>
            <div className="space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                Sou um desenvolvedor Full Stack com mais de 5 anos de experiência na criação de soluções digitais inovadoras. 
                Especializo-me em integrar inteligência artificial em aplicações web para criar experiências únicas e eficientes.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Minha missão é transformar ideias complexas em interfaces simples e intuitivas, sempre priorizando a experiência do usuário 
                e a performance das aplicações.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg border border-border">
                  <h4 className="font-semibold text-card-foreground mb-2">Frontend</h4>
                  <p className="text-sm text-muted-foreground">React, Next.js, TypeScript</p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <h4 className="font-semibold text-card-foreground mb-2">Backend</h4>
                  <p className="text-sm text-muted-foreground">Node.js, Python, PostgreSQL</p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <h4 className="font-semibold text-card-foreground mb-2">IA/ML</h4>
                  <p className="text-sm text-muted-foreground">TensorFlow, OpenAI, Replit AI</p>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <h4 className="font-semibold text-card-foreground mb-2">DevOps</h4>
                  <p className="text-sm text-muted-foreground">Docker, AWS, Vercel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

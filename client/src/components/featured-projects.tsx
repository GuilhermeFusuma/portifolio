import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, ExternalLink } from "lucide-react";
import { useState } from "react";
import ProjectModal from "./project-modal";
import type { ProjectWithDetails } from "@shared/schema";

export default function FeaturedProjects() {
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);

  const { data: projects, isLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects"],
    queryFn: () => fetch("/api/projects?published=true&featured=true&limit=3").then(res => res.json()),
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Projetos em Destaque</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Seleção dos projetos mais curtidos e recentes do meu portfolio
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-1/4 mb-3" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Projetos em Destaque</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Seleção dos projetos mais curtidos e recentes do meu portfolio
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects?.map((project) => (
              <Card
                key={project.id}
                className="overflow-hidden card-hover border border-border cursor-pointer"
                onClick={() => setSelectedProject(project)}
                data-testid={`card-featured-project-${project.id}`}
              >
                {project.imageUrl && (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-48 object-cover"
                    data-testid={`img-project-${project.id}`}
                  />
                )}
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    {project.category && (
                      <Badge style={{ backgroundColor: project.category.color || '#3B82F6' }} className="text-white">
                        {project.category.name}
                      </Badge>
                    )}
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm" data-testid={`text-likes-count-${project.id}`}>
                        {project.likesCount}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2" data-testid={`text-project-title-${project.id}`}>
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2" data-testid={`text-project-description-${project.id}`}>
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                      }}
                      data-testid={`button-view-details-${project.id}`}
                    >
                      Ver Detalhes
                    </Button>
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground" data-testid={`text-comments-count-${project.id}`}>
                        {project.commentsCount}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {projects && projects.length > 0 && (
            <div className="text-center mt-12">
              <Button
                variant="secondary"
                onClick={() => scrollToSection("projetos")}
                data-testid="button-view-all-projects"
              >
                Ver Todos os Projetos
              </Button>
            </div>
          )}

          {!isLoading && (!projects || projects.length === 0) && (
            <div className="text-center">
              <p className="text-muted-foreground">Nenhum projeto em destaque no momento.</p>
            </div>
          )}
        </div>
      </section>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}

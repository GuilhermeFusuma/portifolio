import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle } from "lucide-react";
import ProjectModal from "./project-modal";
import type { ProjectWithDetails, Category } from "@shared/schema";

export default function AllProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: projects, isLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects", selectedCategory],
    queryFn: () => {
      const params = new URLSearchParams({ published: "true" });
      if (selectedCategory) {
        params.append("categoryId", selectedCategory);
      }
      return fetch(`/api/projects?${params}`).then(res => res.json());
    },
  });

  if (isLoading) {
    return (
      <section id="projetos" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Todos os Projetos</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Explore minha coleção completa de projetos e conquistas
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-14" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-32" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-1/4 mb-2" />
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-full mb-3" />
                  <Skeleton className="h-6 w-20" />
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
      <section id="projetos" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Todos os Projetos</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Explore minha coleção completa de projetos e conquistas
            </p>
            
            {/* Filter Tags */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant={selectedCategory === null ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                data-testid="button-filter-all"
              >
                Todos
              </Button>
              {categories?.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  data-testid={`button-filter-${category.slug}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects?.map((project) => (
              <Card
                key={project.id}
                className="overflow-hidden card-hover border border-border cursor-pointer"
                onClick={() => setSelectedProject(project)}
                data-testid={`card-project-${project.id}`}
              >
                {project.imageUrl && (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-32 object-cover"
                    data-testid={`img-project-${project.id}`}
                  />
                )}
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    {project.category && (
                      <Badge
                        style={{ backgroundColor: project.category.color || '#3B82F6' }}
                        className="text-white text-xs"
                        data-testid={`badge-category-${project.id}`}
                      >
                        {project.category.name}
                      </Badge>
                    )}
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Heart className={`h-3 w-3 ${project.likesCount > 0 ? 'text-red-500' : ''}`} />
                      <span className="text-xs" data-testid={`text-likes-count-${project.id}`}>
                        {project.likesCount}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-card-foreground mb-1 text-sm" data-testid={`text-project-title-${project.id}`}>
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-xs mb-3 line-clamp-2" data-testid={`text-project-description-${project.id}`}>
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs p-0 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                      }}
                      data-testid={`button-view-details-${project.id}`}
                    >
                      Ver Detalhes
                    </Button>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <MessageCircle className="h-3 w-3" />
                      <span className="text-xs" data-testid={`text-comments-count-${project.id}`}>
                        {project.commentsCount}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isLoading && (!projects || projects.length === 0) && (
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                {selectedCategory ? "Nenhum projeto encontrado nesta categoria." : "Nenhum projeto disponível."}
              </p>
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

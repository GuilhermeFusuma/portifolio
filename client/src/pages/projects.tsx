import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MessageCircle, ExternalLink, Github, Share2, Filter, User } from "lucide-react";
import type { ProjectWithDetails, Category, ProjectComment } from "@shared/schema";

export default function Projects() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Faça login para acessar a página de projetos...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects", selectedCategory],
    queryFn: () => {
      const params = new URLSearchParams({ published: "true" });
      if (selectedCategory && selectedCategory !== "all") {
        params.append("categoryId", selectedCategory);
      }
      return fetch(`/api/projects?${params}`).then(res => res.json());
    },
    enabled: isAuthenticated,
  });

  const likeMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await apiRequest("POST", `/api/projects/${projectId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você precisa estar logado para curtir projetos",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Erro",
        description: "Falha ao curtir projeto",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ projectId, content }: { projectId: string; content: string }) => {
      await apiRequest("POST", `/api/projects/${projectId}/comments`, { content });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setCommentInputs(prev => ({ ...prev, [variables.projectId]: "" }));
      toast({
        title: "Sucesso",
        description: "Comentário adicionado com sucesso",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você precisa estar logado para comentar",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Erro",
        description: "Falha ao adicionar comentário",
        variant: "destructive",
      });
    },
  });

  const shareMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", "/api/share/linkedin", { projectId });
      return response.json();
    },
    onSuccess: (data: { linkedinUrl: string }) => {
      window.open(data.linkedinUrl, '_blank');
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao gerar link de compartilhamento",
        variant: "destructive",
      });
    },
  });

  const handleLike = (projectId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para curtir projetos",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate(projectId);
  };

  const handleComment = (projectId: string) => {
    const content = commentInputs[projectId]?.trim();
    if (!content) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para comentar",
        variant: "destructive",
      });
      return;
    }
    
    commentMutation.mutate({ projectId, content });
  };

  const handleShare = (projectId: string) => {
    shareMutation.mutate(projectId);
  };

  const updateCommentInput = (projectId: string, value: string) => {
    setCommentInputs(prev => ({ ...prev, [projectId]: value }));
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isAuthenticated={true} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Feed de Projetos</h1>
          <p className="text-muted-foreground">Explore, curta e comente nos projetos em destaque</p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]" data-testid="select-category-filter">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects Feed */}
        <div className="max-w-2xl mx-auto space-y-8">
          {projectsLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} className="w-full">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="w-full h-64 mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            projects?.map((project) => (
              <Card key={project.id} className="w-full" data-testid={`project-card-${project.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={project.owner.profileImageUrl || undefined} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground" data-testid={`project-title-${project.id}`}>
                          {project.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {project.owner.firstName} {project.owner.lastName}
                        </p>
                      </div>
                    </div>
                    {project.category && (
                      <Badge 
                        style={{ backgroundColor: project.category.color || '#3B82F6' }} 
                        className="text-white"
                        data-testid={`project-category-${project.id}`}
                      >
                        {project.category.name}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground" data-testid={`project-description-${project.id}`}>
                    {project.description}
                  </p>

                  {project.imageUrl && (
                    <div className="w-full">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full rounded-lg object-cover max-h-96"
                        data-testid={`project-image-${project.id}`}
                      />
                    </div>
                  )}

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 5).map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(project.id)}
                        disabled={likeMutation.isPending}
                        className={`flex items-center space-x-2 ${project.isLikedByUser ? 'text-red-500' : ''}`}
                        data-testid={`button-like-${project.id}`}
                      >
                        <Heart className={`h-4 w-4 ${project.isLikedByUser ? 'fill-current' : ''}`} />
                        <span>{project.likesCount}</span>
                      </Button>
                      
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        <span data-testid={`comments-count-${project.id}`}>{project.commentsCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {project.demoUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(project.demoUrl!, '_blank')}
                          data-testid={`button-demo-${project.id}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {project.githubUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(project.githubUrl!, '_blank')}
                          data-testid={`button-github-${project.id}`}
                        >
                          <Github className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(project.id)}
                        disabled={shareMutation.isPending}
                        data-testid={`button-share-${project.id}`}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Comments Section */}
                  <div className="space-y-3">
                    {project.comments.length > 0 && (
                      <div className="space-y-2">
                        {project.comments.slice(0, 2).map((comment) => (
                          <div key={comment.id} className="flex items-start space-x-3" data-testid={`comment-${comment.id}`}>
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={comment.user.profileImageUrl || undefined} />
                              <AvatarFallback className="text-xs">
                                {comment.user.firstName?.charAt(0)}{comment.user.lastName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                <span className="font-medium">{comment.user.firstName} {comment.user.lastName}</span>{' '}
                                <span className="text-muted-foreground">{comment.content}</span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(comment.createdAt!).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={(user as any)?.profileImageUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {(user as any)?.firstName?.charAt(0)}{(user as any)?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Escreva um comentário..."
                          value={commentInputs[project.id] || ""}
                          onChange={(e) => updateCommentInput(project.id, e.target.value)}
                          className="resize-none"
                          rows={2}
                          data-testid={`textarea-comment-${project.id}`}
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleComment(project.id)}
                            disabled={commentMutation.isPending || !commentInputs[project.id]?.trim()}
                            data-testid={`button-comment-${project.id}`}
                          >
                            {commentMutation.isPending ? "Enviando..." : "Comentar"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {!projectsLoading && (!projects || projects.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {selectedCategory !== "all" ? "Nenhum projeto encontrado nesta categoria." : "Nenhum projeto disponível."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
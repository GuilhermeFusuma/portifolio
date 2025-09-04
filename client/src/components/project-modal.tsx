import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageCircle, ExternalLink, Github, Share2 } from "lucide-react";
import type { ProjectWithDetails, ProjectComment } from "@shared/schema";

interface ProjectModalProps {
  project: ProjectWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: comments, isLoading: commentsLoading } = useQuery<(ProjectComment & { user: any })[]>({
    queryKey: ["/api/projects", project.id, "comments"],
    enabled: isOpen,
  });

  const { data: projectDetails } = useQuery<ProjectWithDetails>({
    queryKey: ["/api/projects", project.id],
    enabled: isOpen,
  });

  const currentProject = projectDetails || project;

  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/projects/${project.id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Login Required",
          description: "You need to be logged in to like projects",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to toggle like",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/projects/${project.id}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", project.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setComment("");
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Login Required",
          description: "You need to be logged in to comment",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/share/linkedin", { projectId: project.id });
      return response.json();
    },
    onSuccess: (data: { linkedinUrl: string }) => {
      window.open(data.linkedinUrl, '_blank');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate share link",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to like projects",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleComment = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to comment",
        variant: "destructive",
      });
      return;
    }
    if (comment.trim()) {
      commentMutation.mutate(comment.trim());
    }
  };

  const handleShare = () => {
    shareMutation.mutate();
  };

  const copyLink = () => {
    const url = `${window.location.origin}/projects/${project.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Success",
      description: "Link copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-project-modal-title">{currentProject.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {currentProject.imageUrl && (
            <img
              src={currentProject.imageUrl}
              alt={currentProject.title}
              className="w-full rounded-lg shadow-lg object-cover max-h-96"
              data-testid="img-project-modal-image"
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-card-foreground mb-3">Descrição do Projeto</h4>
                <p className="text-muted-foreground mb-4" data-testid="text-project-description">
                  {currentProject.description}
                </p>
                {currentProject.content && (
                  <div className="prose prose-sm max-w-none" data-testid="text-project-content">
                    {currentProject.content}
                  </div>
                )}
              </div>

              {currentProject.technologies && currentProject.technologies.length > 0 && (
                <div>
                  <h5 className="font-semibold text-card-foreground mb-2">Tecnologias Utilizadas</h5>
                  <div className="flex flex-wrap gap-2">
                    {currentProject.technologies.map((tech, index) => (
                      <Badge key={index} variant="secondary" data-testid={`badge-tech-${index}`}>
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <h5 className="font-semibold text-card-foreground mb-3">Comentários</h5>
                <div className="space-y-3 mb-4">
                  {comments?.map((comment) => (
                    <div key={comment.id} className="bg-muted/50 p-3 rounded-lg" data-testid={`comment-${comment.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-card-foreground">
                          {comment.user.firstName} {comment.user.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt!).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.content}</p>
                    </div>
                  ))}
                  {comments?.length === 0 && (
                    <p className="text-muted-foreground text-sm">Nenhum comentário ainda.</p>
                  )}
                </div>

                {isAuthenticated && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Deixe seu comentário..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="resize-none"
                      rows={3}
                      data-testid="textarea-comment"
                    />
                    <Button
                      onClick={handleComment}
                      disabled={commentMutation.isPending || !comment.trim()}
                      data-testid="button-submit-comment"
                    >
                      {commentMutation.isPending ? "Enviando..." : "Comentar"}
                    </Button>
                  </div>
                )}
                {!isAuthenticated && (
                  <p className="text-muted-foreground text-sm">
                    <a href="/api/login" className="text-primary hover:underline">
                      Faça login
                    </a>{" "}
                    para comentar
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Curtidas</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      disabled={likeMutation.isPending}
                      className={currentProject.isLikedByUser ? "text-red-500" : ""}
                      data-testid="button-like-project"
                    >
                      <Heart className={`h-4 w-4 ${currentProject.isLikedByUser ? 'fill-current' : ''}`} />
                    </Button>
                    <span className="font-semibold" data-testid="text-likes-count">
                      {currentProject.likesCount}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Comentários</span>
                  <span className="font-semibold" data-testid="text-comments-count">
                    {currentProject.commentsCount}
                  </span>
                </div>

                <Separator />

                <div className="space-y-2">
                  {currentProject.demoUrl && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(currentProject.demoUrl!, '_blank')}
                      data-testid="button-view-demo"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Demo
                    </Button>
                  )}

                  {currentProject.githubUrl && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(currentProject.githubUrl!, '_blank')}
                      data-testid="button-view-github"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      Ver Código
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleShare}
                    disabled={shareMutation.isPending}
                    data-testid="button-share-linkedin"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar no LinkedIn
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={copyLink}
                    data-testid="button-copy-link"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Copiar Link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

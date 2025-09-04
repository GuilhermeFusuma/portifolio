import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { ProjectWithDetails, Category } from "@shared/schema";

const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  project?: ProjectWithDetails | null;
  onClose: () => void;
}

export default function ProjectForm({ project, onClose }: ProjectFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [technologies, setTechnologies] = useState<string[]>(project?.technologies || []);
  const [techInput, setTechInput] = useState("");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      content: project?.content || "",
      imageUrl: project?.imageUrl || "",
      videoUrl: project?.videoUrl || "",
      demoUrl: project?.demoUrl || "",
      githubUrl: project?.githubUrl || "",
      categoryId: project?.categoryId || "",
      isPublished: project?.isPublished || false,
      isFeatured: project?.isFeatured || false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData & { technologies: string[] }) => {
      await apiRequest("POST", "/api/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProjectFormData & { technologies: string[] }) => {
      await apiRequest("PUT", `/api/projects/${project!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    const projectData = {
      ...data,
      technologies,
      imageUrl: data.imageUrl || undefined,
      videoUrl: data.videoUrl || undefined,
      demoUrl: data.demoUrl || undefined,
      githubUrl: data.githubUrl || undefined,
      categoryId: data.categoryId || undefined,
    };

    if (project) {
      updateMutation.mutate(projectData);
    } else {
      createMutation.mutate(projectData);
    }
  };

  const addTechnology = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput("");
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTechnology();
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Project title"
              data-testid="input-project-title"
            />
            {form.formState.errors.title && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Brief project description"
              rows={3}
              data-testid="textarea-project-description"
            />
            {form.formState.errors.description && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="content">Detailed Content</Label>
            <Textarea
              id="content"
              {...form.register("content")}
              placeholder="Detailed project description"
              rows={4}
              data-testid="textarea-project-content"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={form.watch("categoryId")}
              onValueChange={(value) => form.setValue("categoryId", value)}
            >
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Technologies</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add technology"
                data-testid="input-technology"
              />
              <Button type="button" onClick={addTechnology} data-testid="button-add-technology">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="flex items-center gap-1" data-testid={`badge-tech-${tech}`}>
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechnology(tech)}
                    className="ml-1 hover:text-destructive"
                    data-testid={`button-remove-tech-${tech}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              {...form.register("imageUrl")}
              placeholder="https://example.com/image.jpg"
              data-testid="input-image-url"
            />
            {form.formState.errors.imageUrl && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.imageUrl.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              {...form.register("videoUrl")}
              placeholder="https://youtube.com/watch?v=..."
              data-testid="input-video-url"
            />
            {form.formState.errors.videoUrl && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.videoUrl.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="demoUrl">Demo URL</Label>
            <Input
              id="demoUrl"
              {...form.register("demoUrl")}
              placeholder="https://myproject.com"
              data-testid="input-demo-url"
            />
            {form.formState.errors.demoUrl && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.demoUrl.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input
              id="githubUrl"
              {...form.register("githubUrl")}
              placeholder="https://github.com/user/repo"
              data-testid="input-github-url"
            />
            {form.formState.errors.githubUrl && (
              <p className="text-destructive text-sm mt-1">{form.formState.errors.githubUrl.message}</p>
            )}
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="isPublished">Published</Label>
              <Switch
                id="isPublished"
                checked={form.watch("isPublished")}
                onCheckedChange={(checked) => form.setValue("isPublished", checked)}
                data-testid="switch-published"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isFeatured">Featured</Label>
              <Switch
                id="isFeatured"
                checked={form.watch("isFeatured")}
                onCheckedChange={(checked) => form.setValue("isFeatured", checked)}
                data-testid="switch-featured"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          data-testid="button-save-project"
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : project
            ? "Update Project"
            : "Create Project"}
        </Button>
      </div>
    </form>
  );
}

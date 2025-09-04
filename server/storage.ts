import {
  users,
  categories,
  projects,
  projectLikes,
  projectComments,
  notifications,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Project,
  type InsertProject,
  type ProjectLike,
  type ProjectComment,
  type InsertProjectComment,
  type Notification,
  type InsertNotification,
  type ProjectWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, count, asc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  
  // Project operations
  getProjects(options?: { published?: boolean; featured?: boolean; categoryId?: string; limit?: number }): Promise<ProjectWithDetails[]>;
  getProjectById(id: string, userId?: string): Promise<ProjectWithDetails | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  incrementProjectViews(id: string): Promise<void>;
  
  // Like operations
  toggleProjectLike(projectId: string, userId: string): Promise<{ liked: boolean; likesCount: number }>;
  
  // Comment operations
  getProjectComments(projectId: string): Promise<(ProjectComment & { user: User })[]>;
  createProjectComment(comment: InsertProjectComment): Promise<ProjectComment & { user: User }>;
  deleteProjectComment(id: string, userId: string): Promise<boolean>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationAsRead(id: string, userId: string): Promise<boolean>;
  
  // Admin operations
  getProjectsByOwner(ownerId: string): Promise<ProjectWithDetails[]>;
  getProjectStats(ownerId: string): Promise<{ totalProjects: number; totalLikes: number; totalComments: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  // Project operations
  async getProjects(options: { published?: boolean; featured?: boolean; categoryId?: string; limit?: number } = {}): Promise<ProjectWithDetails[]> {
    const query = db
      .select({
        project: projects,
        owner: users,
        category: categories,
        likesCount: count(projectLikes.id).as('likesCount'),
      })
      .from(projects)
      .leftJoin(users, eq(projects.ownerId, users.id))
      .leftJoin(categories, eq(projects.categoryId, categories.id))
      .leftJoin(projectLikes, eq(projects.id, projectLikes.projectId))
      .groupBy(projects.id, users.id, categories.id)
      .orderBy(desc(projects.createdAt));

    if (options.published !== undefined) {
      query.where(eq(projects.isPublished, options.published));
    }
    if (options.featured !== undefined) {
      query.where(eq(projects.isFeatured, options.featured));
    }
    if (options.categoryId) {
      query.where(eq(projects.categoryId, options.categoryId));
    }
    if (options.limit) {
      query.limit(options.limit);
    }

    const results = await query;

    const projectsWithDetails: ProjectWithDetails[] = await Promise.all(
      results.map(async (result) => {
        const likes = await db.select().from(projectLikes).where(eq(projectLikes.projectId, result.project.id));
        const comments = await db
          .select({
            comment: projectComments,
            user: users,
          })
          .from(projectComments)
          .leftJoin(users, eq(projectComments.userId, users.id))
          .where(eq(projectComments.projectId, result.project.id))
          .orderBy(desc(projectComments.createdAt));

        return {
          ...result.project,
          owner: result.owner!,
          category: result.category,
          likes,
          comments: comments.map(c => ({ ...c.comment, user: c.user! })),
          likesCount: result.likesCount,
          commentsCount: comments.length,
        };
      })
    );

    return projectsWithDetails;
  }

  async getProjectById(id: string, userId?: string): Promise<ProjectWithDetails | undefined> {
    const [result] = await db
      .select({
        project: projects,
        owner: users,
        category: categories,
      })
      .from(projects)
      .leftJoin(users, eq(projects.ownerId, users.id))
      .leftJoin(categories, eq(projects.categoryId, categories.id))
      .where(eq(projects.id, id));

    if (!result) return undefined;

    const likes = await db.select().from(projectLikes).where(eq(projectLikes.projectId, id));
    const comments = await db
      .select({
        comment: projectComments,
        user: users,
      })
      .from(projectComments)
      .leftJoin(users, eq(projectComments.userId, users.id))
      .where(eq(projectComments.projectId, id))
      .orderBy(desc(projectComments.createdAt));

    let isLikedByUser = false;
    if (userId) {
      const [userLike] = await db
        .select()
        .from(projectLikes)
        .where(and(eq(projectLikes.projectId, id), eq(projectLikes.userId, userId)));
      isLikedByUser = !!userLike;
    }

    return {
      ...result.project,
      owner: result.owner!,
      category: result.category,
      likes,
      comments: comments.map(c => ({ ...c.comment, user: c.user! })),
      likesCount: likes.length,
      commentsCount: comments.length,
      isLikedByUser,
    };
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }

  async incrementProjectViews(id: string): Promise<void> {
    await db
      .update(projects)
      .set({ viewCount: sql`${projects.viewCount} + 1` })
      .where(eq(projects.id, id));
  }

  // Like operations
  async toggleProjectLike(projectId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const [existingLike] = await db
      .select()
      .from(projectLikes)
      .where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId)));

    if (existingLike) {
      await db
        .delete(projectLikes)
        .where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId)));
    } else {
      await db.insert(projectLikes).values({ projectId, userId });
    }

    const likesCount = await db
      .select({ count: count() })
      .from(projectLikes)
      .where(eq(projectLikes.projectId, projectId));

    return {
      liked: !existingLike,
      likesCount: likesCount[0].count,
    };
  }

  // Comment operations
  async getProjectComments(projectId: string): Promise<(ProjectComment & { user: User })[]> {
    const comments = await db
      .select({
        comment: projectComments,
        user: users,
      })
      .from(projectComments)
      .leftJoin(users, eq(projectComments.userId, users.id))
      .where(eq(projectComments.projectId, projectId))
      .orderBy(desc(projectComments.createdAt));

    return comments.map(c => ({ ...c.comment, user: c.user! }));
  }

  async createProjectComment(comment: InsertProjectComment): Promise<ProjectComment & { user: User }> {
    const [newComment] = await db.insert(projectComments).values(comment).returning();
    const [user] = await db.select().from(users).where(eq(users.id, comment.userId));
    return { ...newComment, user: user! };
  }

  async deleteProjectComment(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(projectComments)
      .where(and(eq(projectComments.id, id), eq(projectComments.userId, userId)));
    return result.rowCount > 0;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getUserNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
    const query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

    if (unreadOnly) {
      query.where(eq(notifications.isRead, false));
    }

    return await query;
  }

  async markNotificationAsRead(id: string, userId: string): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
    return result.rowCount > 0;
  }

  // Admin operations
  async getProjectsByOwner(ownerId: string): Promise<ProjectWithDetails[]> {
    return this.getProjects({ published: undefined }); // Get all projects regardless of published status
  }

  async getProjectStats(ownerId: string): Promise<{ totalProjects: number; totalLikes: number; totalComments: number }> {
    const [projectsCount] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.ownerId, ownerId));

    const [likesCount] = await db
      .select({ count: count() })
      .from(projectLikes)
      .leftJoin(projects, eq(projectLikes.projectId, projects.id))
      .where(eq(projects.ownerId, ownerId));

    const [commentsCount] = await db
      .select({ count: count() })
      .from(projectComments)
      .leftJoin(projects, eq(projectComments.projectId, projects.id))
      .where(eq(projects.ownerId, ownerId));

    return {
      totalProjects: projectsCount.count,
      totalLikes: likesCount.count,
      totalComments: commentsCount.count,
    };
  }
}

export const storage = new DatabaseStorage();

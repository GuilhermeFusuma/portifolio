# Portfolio Digital Interativo com IA

## Overview

This is a digital portfolio web application that allows users to showcase their projects, achievements, and experiences in an organized and interactive way. The system features a public-facing portfolio site where visitors can view projects, like them, comment, and share on LinkedIn. It includes user authentication for visitor engagement and an admin area for the portfolio owner to manage content. The application is built with modern web technologies and designed to integrate AI assistance throughout the development process.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query** for server state management and data fetching
- **Tailwind CSS** with **shadcn/ui** components for styling and UI components
- **React Hook Form** with Zod validation for form handling

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with route organization in `/server/routes.ts`
- **Session-based authentication** using Replit Auth integration
- **PostgreSQL session storage** for persistent login sessions
- **Structured storage layer** with interface abstraction in `/server/storage.ts`

### Database Design
- **PostgreSQL** database with **Drizzle ORM** for type-safe database operations
- **Neon Database** as the serverless PostgreSQL provider
- Core entities: Users, Categories, Projects, Likes, Comments, and Notifications
- **Mandatory session storage** table for Replit Auth compatibility
- Database schema defined in `/shared/schema.ts` with Zod validation schemas

### Authentication System
- **Replit Auth (OpenID Connect)** for secure user authentication
- **Passport.js** integration with OpenID Connect strategy
- **Session management** with PostgreSQL store using `connect-pg-simple`
- **Role-based access** distinguishing between visitors and portfolio owners

### Key Features Implementation
- **Project Management**: CRUD operations for projects with media uploads, categorization, and publish/draft states
- **Social Interactions**: Like system, commenting system, and LinkedIn sharing integration
- **Admin Dashboard**: Content management interface for the portfolio owner
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Optimistic updates and cache invalidation with TanStack Query

### Development Workflow
- **Hot Module Replacement** with Vite for fast development cycles
- **TypeScript** throughout the stack for type safety
- **ESM modules** with modern JavaScript features
- **Database migrations** managed through Drizzle Kit
- **Replit-specific optimizations** including development banner and error overlays

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client for Neon Database
- **drizzle-orm**: Type-safe ORM for PostgreSQL operations
- **express**: Web server framework
- **passport**: Authentication middleware
- **openid-client**: OpenID Connect client for Replit Auth

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI primitives for accessibility
- **react-hook-form**: Form state management and validation
- **wouter**: Lightweight routing library
- **date-fns**: Date manipulation utilities

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Authentication & Session Management
- **connect-pg-simple**: PostgreSQL session store
- **express-session**: Session middleware
- **memoizee**: Function memoization for caching

The application is designed to be deployed on Replit with specific optimizations for that environment, including development tooling and authentication integration.
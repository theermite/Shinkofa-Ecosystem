# Multi-stage build for frontend

# Development stage
FROM node:20-alpine AS development

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Copy brain-training package (needed for file-based dependency)
COPY brain-training-package ./brain-training-package

# Install dependencies (ignore workspace packages for standalone build)
RUN pnpm install --ignore-workspace

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["pnpm", "run", "dev", "--", "--host"]

# Build stage
FROM node:20-alpine AS build

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Copy brain-training package (needed for file-based dependency)
COPY brain-training-package ./brain-training-package

# Install dependencies (ignore workspace packages for standalone build)
RUN pnpm install --ignore-workspace

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Production stage
FROM nginx:alpine AS production

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

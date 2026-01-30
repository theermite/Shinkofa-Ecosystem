# ═════════════════════════════════════════════════════════════════════
# SHINKOFA - WEB FRONTEND DOCKERFILE (Multi-stage)
# Context: apps/ (includes web/ and toolbox-theermite/ submodule)
# ═════════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────────
# STAGE 1: DEPENDENCIES
# ─────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copy package files from web/
COPY web/package.json web/package-lock.json* ./

# Install dependencies (use npm install instead of npm ci for better compatibility)
RUN npm install --legacy-peer-deps

# ─────────────────────────────────────────────────────────────────────
# STAGE 2: DEVELOPMENT (with hot reload)
# ─────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS development

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy web application code
COPY web/ ./

# Copy toolbox-theermite submodule (for widgets)
COPY toolbox-theermite/ ../toolbox-theermite/

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]


# ─────────────────────────────────────────────────────────────────────
# STAGE 3: BUILDER (production build)
# ─────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy web application code
COPY web/ ./

# Copy toolbox-theermite submodule (widgets are referenced via ../toolbox-theermite)
COPY toolbox-theermite/ ../toolbox-theermite/

# Build arguments for Next.js public env vars
# IMPORTANT: These are BASE API URLs - code adds specific paths (/auth/login, /rituals, etc.)
ARG NEXT_PUBLIC_API_URL=https://app.shinkofa.com/api
ARG NEXT_PUBLIC_AUTH_API_URL=https://app.shinkofa.com/api
ARG NEXT_PUBLIC_API_SHIZEN_URL=https://app.shinkofa.com/api
ARG NEXT_PUBLIC_WS_URL=wss://app.shinkofa.com/ws

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Pass build args to Next.js build process (CRITICAL: These are compiled into JS)
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_AUTH_API_URL=$NEXT_PUBLIC_AUTH_API_URL
ENV NEXT_PUBLIC_API_SHIZEN_URL=$NEXT_PUBLIC_API_SHIZEN_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

# Build application
RUN npm run build

# ─────────────────────────────────────────────────────────────────────
# STAGE 4: PRODUCTION (optimized)
# ─────────────────────────────────────────────────────────────────────
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "server.js"]

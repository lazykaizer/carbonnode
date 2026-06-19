# Stage 1: Build client and server
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy rest of the files
COPY . .

# Build both client and server
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built outputs from builder stage
COPY --from=builder /app/dist ./dist

# Use non-root node user for security
USER node

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/server/server/index.js"]

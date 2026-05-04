## DockerFile: For "React + Vite" Application ##

# Build stage
FROM node:18-alpine AS builder

# Set the 'app' as a 'CWD' inside the 'container'
WORKDIR /app

# Copy the 'package.json' and 'package-lock.json' files
COPY package*.json ./

# Install the 'dependencies'
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the 'Vite' application
RUN npm run build

# Production stage using nginx
FROM nginx:alpine AS runner

# Copy the 'build' output from the 'builder' stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose the port "80" to the 'outside' world
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]

## DockerFile: For "Next.js" Application ##

# Start from the latest "Node" base image (alpine)
FROM node:18-alpine AS builder

# Set the 'app' as a 'CWD' inside the 'container'
WORKDIR /app

# Copy the 'package.json' and 'package-lock.json' files
COPY package*.json ./

# Install the 'dependencies'
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the 'Next.js' application
RUN npm run build

# Start from the latest "Node" base image (alpine) for production
FROM node:18-alpine AS runner

# Set the 'app' as a 'CWD' inside the 'container'
WORKDIR /app

# Copy the 'build' output from the 'builder' stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Expose the port "3000" to the 'outside' world
EXPOSE 3000

# Run the 'Next.js' application
CMD ["npm", "start"]

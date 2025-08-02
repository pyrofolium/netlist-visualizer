FROM node:24-alpine3.21

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code and configuration files
COPY tsconfig.backend.json tsconfig.json tsup.config.ts vite.frontend.config.ts ./
COPY src/ ./src/
COPY public/ ./public/
COPY tests ./tests/
COPY index.html ./

# Build the frontend and backend in parallel
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000
EXPOSE 9229

# Command to run the application
CMD ["node", "--inspect=0.0.0.0:9229", "--experimental-specifier-resolution=node", "build/server.js"]
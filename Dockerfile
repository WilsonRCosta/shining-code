# Use official Node LTS image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy client package files and install dependencies
COPY client/package*.json ./client/
RUN cd client && npm install

# Copy server package files and install dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Copy entire client and server folders
COPY client ./client
COPY server ./server

# Build client
RUN cd client && npm run build

# Expose port your server listens on
EXPOSE 3000

# Start the server
CMD ["node", "server/server.js"]

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy application source code
COPY . .

# Expose the port Cloud Run uses
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]

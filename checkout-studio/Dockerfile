FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start the dev server bound to all interfaces so Nginx can reach it
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

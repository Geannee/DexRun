FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system deps if needed (e.g., tzdata for correct timezone)
RUN apk add --no-cache tzdata

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install deps
RUN npm ci --only=production || npm install --production

# Copy source code
COPY . .

# Environment (adjust at runtime via platform env vars)
ENV NODE_ENV=production
ENV PORT=3000

# Expose service port
EXPOSE 3000

# Start
CMD ["node", "server.js"]

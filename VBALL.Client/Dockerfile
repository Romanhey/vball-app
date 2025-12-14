# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Try npm ci first (faster, requires exact lock file match), fallback to npm install
RUN npm ci || npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Copy stage - copy build output to a temporary location
FROM alpine:latest
RUN apk add --no-cache bash
WORKDIR /build-output
COPY --from=build /app/build .
# Copy files to volume mount point on container start
CMD ["sh", "-c", "echo 'Copying build files to /static...' && rm -rf /static/* && cp -r /build-output/* /static/ && echo 'Files copied. Contents:' && ls -la /static && tail -f /dev/null"]

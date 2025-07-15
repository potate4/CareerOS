# ===== FRONTEND BUILD STAGE =====
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app (disable CI to avoid warnings breaking build)
ENV CI=false
RUN npm run build

# ===== PRODUCTION NGINX STAGE =====
FROM nginx:alpine
# Copy built frontend to nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

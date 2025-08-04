# Use official Node.js image for build
FROM node:18 AS build

WORKDIR /home/runner/app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Build the React app
RUN npm run build

# Use Nginx to serve the build
FROM nginx:alpine
COPY --from=build /home/runner/app/build /usr/share/nginx/html

# Copy custom nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
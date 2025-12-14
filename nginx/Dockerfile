FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# The static files will be mounted from a volume
# No need to copy them here, they'll come from the client-build volume

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Muhadatsah — static site
# Aplikasi ini murni HTML/CSS/JS (tanpa build step).
# Image ini hanya berisi static web server.

FROM node:20-alpine

ENV NODE_ENV=production \
    PORT=8080

WORKDIR /app

# Install hanya http-server global (tanpa dependency aplikasi).
RUN npm install -g http-server@14

# Salin seluruh konten aplikasi.
COPY . .

# Buang file yang tidak perlu di runtime.
RUN rm -rf node_modules .git .github

EXPOSE 8080

# Sajikan file statis; cache dinonaktifkan agar konten selalu segar.
CMD ["http-server", ".", "-p", "8080", "-c-1", "--silent"]

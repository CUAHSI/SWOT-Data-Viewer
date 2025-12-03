FROM node:20.19.6 AS node_build
WORKDIR /app
COPY package.json .
COPY package-lock.json .

RUN npm install
ADD ./ ./
RUN npm run build

# Production layer
FROM caddy:2.10.2-alpine AS prod

COPY docker-entrypoint.sh /usr/local/bin/

# Copy config
COPY Caddyfile /etc/caddy/Caddyfile

# Copy source dist
COPY --from=node_build /app/dist /srv

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]

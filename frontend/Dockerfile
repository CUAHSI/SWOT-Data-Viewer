FROM node:20.9.0 as node_build
WORKDIR /app
COPY package.json .
COPY package-lock.json .

RUN npm install
ADD ./ ./
RUN npm run build

# Production layer
FROM caddy:2.7.6-alpine as prod

COPY docker-entrypoint.sh /usr/local/bin/

# Copy config
COPY Caddyfile /etc/caddy/Caddyfile

# Copy source dist
COPY --from=node_build /app/dist /srv/swotviz

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]

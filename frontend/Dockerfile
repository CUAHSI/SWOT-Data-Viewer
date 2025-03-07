FROM mambaorg/micromamba:2.0.5 as voici-build

WORKDIR /voici

COPY --chown=$MAMBA_USER:$MAMBA_USER voici/build-environment.yml build-environment.yml
RUN micromamba create -n voici -f build-environment.yml && \
    micromamba clean --all --yes
SHELL ["micromamba", "run", "-n", "voici", "/bin/bash", "-c"]

COPY --chown=$MAMBA_USER:$MAMBA_USER voici/environment.yml environment.yml
RUN micromamba install voici
COPY voici/notebooks notebooks

ARG MAMBA_DOCKERFILE_ACTIVATE=1  # (otherwise python will not be found)
RUN voici build --contents notebooks --output-dir dist

# in order to get the required .env, context must be app/
# docker build -f app/frontend/Dockerfile app/
FROM node:20.9.0 as node_build

# WORKDIR /tmp
# COPY *env* ./
# RUN [ -f ".env" ] || cp env.template .env
# RUN grep '^VITE' .env > /.env

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
ADD ./ ./
RUN npm run build

# Production layer
FROM caddy:2.7.6-alpine as prod

# COPY --from=build-stage .env .env
# Install envsubst command for replacing __env files
# RUN set -x \
#   && apk add gettext libintl

COPY docker-entrypoint.sh /usr/local/bin/

# Copy config
COPY Caddyfile /etc/caddy/Caddyfile

# Copy source dist
COPY --from=node_build /app/dist /srv/swotviz

# bring in the static files from voici build
COPY --from=voici-build /voici/dist /srv/notebooks

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]

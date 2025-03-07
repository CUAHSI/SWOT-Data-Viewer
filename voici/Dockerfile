FROM mambaorg/micromamba:2.0.5 as voici-build

WORKDIR /voici

COPY --chown=$MAMBA_USER:$MAMBA_USER build-environment.yml build-environment.yml
RUN micromamba create -n voici -f build-environment.yml && \
    micromamba clean --all --yes
SHELL ["micromamba", "run", "-n", "voici", "/bin/bash", "-c"]

COPY --chown=$MAMBA_USER:$MAMBA_USER environment.yml environment.yml
RUN micromamba install voici
COPY notebooks notebooks

ARG MAMBA_DOCKERFILE_ACTIVATE=1  # (otherwise python will not be found)
RUN voici build --contents notebooks --output-dir dist


# Production layer
FROM caddy:2.7.6-alpine as prod

# COPY caddy.docker.json /etc/caddy/caddy.json
COPY --from=voici-build /voici/dist/ /usr/share/caddy/

# TODO: this is served on port 80 by default
# copy the Caddyfile to the container
# COPY Caddyfile /etc/caddy/Caddyfile

# RUN chown -R caddy:caddy /srv

# EXPOSE 8090

# CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
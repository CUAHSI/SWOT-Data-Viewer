FROM mambaorg/micromamba:2.0.5 as voici-build

WORKDIR /voici

COPY --chown=$MAMBA_USER:$MAMBA_USER build-environment.yml build-environment.yml
COPY --chown=$MAMBA_USER:$MAMBA_USER environment.yml environment.yml
RUN micromamba install -y -n base -f build-environment.yml && \
    micromamba clean --all --yes

# install voici
# RUN micromamba install -n base voici --yes

# copy the content
COPY content content

ARG MAMBA_DOCKERFILE_ACTIVATE=1  # (otherwise python will not be found)
# run voici
RUN voici build --contents content --output-dir dist

# Production layer
FROM caddy:2.7.6-alpine as prod

# Copy config
COPY caddy.docker.json /etc/caddy/caddy.json

# Copy source dist
COPY --from=voici-build /voici/dist /srv

EXPOSE 8000

CMD ["caddy", "run", "--config", "/etc/caddy/caddy.json"]
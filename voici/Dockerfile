FROM mambaorg/micromamba:2.0.5 as voici-build

WORKDIR /voici

COPY --chown=$MAMBA_USER:$MAMBA_USER build-environment.yml build-environment.yml
COPY --chown=$MAMBA_USER:$MAMBA_USER environment.yml environment.yml
RUN micromamba install -y -n base -f build-environment.yml && \
    micromamba clean --all --yes

# install voici
# RUN micromamba install -n base voici --yes

# copy the content
COPY notebooks notebooks

ARG MAMBA_DOCKERFILE_ACTIVATE=1  # (otherwise python will not be found)
# run voici
RUN voici notebooks

# Production layer
FROM caddy:2.7.6-alpine as prod

# Copy config
COPY caddy.docker.json /etc/caddy/caddy.json

# Copy source dir
COPY --from=voici-build /voici/_output /srv

EXPOSE 8090

CMD ["caddy", "run", "--config", "/etc/caddy/caddy.json"]
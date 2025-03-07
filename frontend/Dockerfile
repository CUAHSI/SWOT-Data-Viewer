FROM continuumio/miniconda3:25.1.1-2 as voici-build
SHELL ["/bin/bash", "--login", "-c"]
WORKDIR /voici

RUN conda init bash
COPY voici/build-environment.yml build-environment.yml
RUN conda env create -n voici -f build-environment.yml

RUN conda activate voici
SHELL ["conda", "run", "-n", "voici", "/bin/bash", "-c"]

COPY voici/environment.yml environment.yml
RUN conda install -c conda-forge voici
COPY voici/notebooks notebooks
RUN voici build --contents notebooks --output-dir dist

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

# bring in the static files from voici build
COPY --from=voici-build /voici/dist /srv/notebooks

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]

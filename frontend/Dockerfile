FROM quay.io/jupyter/base-notebook:python-3.11.10 as nbconvert-build
# FROM python:3.10-slim as nbconvert-build
COPY ./notebooks /notebooks
WORKDIR /notebooks

RUN pip install --upgrade pip \
    && pip install -r requirements.txt

RUN jupyter nbconvert --to html /notebooks/*.ipynb --output-dir=/home/jovyan/dist

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

# bring in the static files from nbconvert build
COPY --from=nbconvert-build /home/jovyan/dist /srv/notebooks

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]

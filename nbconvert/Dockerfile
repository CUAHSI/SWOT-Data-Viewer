FROM quay.io/jupyter/base-notebook:python-3.11.10
COPY ./notebooks /notebooks
COPY requirements.txt /

WORKDIR /

RUN pip install --upgrade pip \
    && pip install -r requirements.txt

RUN jupyter nbconvert --to html /notebooks/*.ipynb --output-dir=/home/jovyan/dist

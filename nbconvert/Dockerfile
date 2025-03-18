FROM quay.io/jupyter/base-notebook:python-3.11.10
COPY requirements.txt /

WORKDIR /

RUN pip install --upgrade pip \
    && pip install -r requirements.txt

CMD ["/bin/bash", "-c", "tail -f /dev/null"]


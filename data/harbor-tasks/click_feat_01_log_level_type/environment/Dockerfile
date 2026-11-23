FROM python:3.11-slim

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Clone click at pinned tag v8.1.7
RUN git clone --depth 1 --branch 8.1.7 https://github.com/pallets/click /app

WORKDIR /app

# Install click in editable mode + test deps
RUN pip install -e ".[dev]" pytest

CMD ["/bin/bash"]

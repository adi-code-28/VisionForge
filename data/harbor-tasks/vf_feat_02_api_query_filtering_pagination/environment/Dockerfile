# Harbor Task Environment for vf_feat_02_api_query_filtering_pagination
FROM node:22-alpine

WORKDIR /app

# Install git, bash, coreutils
RUN apk add --no-cache git bash coreutils

# Copy repository at baseline v0.1.0
COPY package.json server.js ./
COPY src/ ./src/
COPY public/ ./public/
COPY tests/ ./tests/

# Initialize git tracking at base commit
RUN git init && \
    git config user.name "Evaluation Baseline" && \
    git config user.email "baseline@eval.internal" && \
    git add . && \
    git commit -m "baseline v0.1.0" && \
    git tag v0.1.0

# Ensure test and data directories exist
RUN mkdir -p /logs/verifier data

CMD ["/bin/bash"]

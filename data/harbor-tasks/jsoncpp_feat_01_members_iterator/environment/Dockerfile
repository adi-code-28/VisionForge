FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    git cmake g++ make python3 \
    && rm -rf /var/lib/apt/lists/*

# Clone jsoncpp at pinned tag 1.9.5
RUN git clone --depth 1 --branch 1.9.5 https://github.com/open-source-parsers/jsoncpp /app

WORKDIR /app

# Pre-build to cache dependencies
RUN cmake -S . -B build -DJSONCPP_WITH_TESTS=ON && cmake --build build

CMD ["/bin/bash"]

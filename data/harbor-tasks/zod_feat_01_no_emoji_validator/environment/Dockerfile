FROM node:22-alpine

RUN apk add --no-cache git

# Clone zod at pinned tag v3.22.4
RUN git clone --depth 1 --branch v3.22.4 https://github.com/colinhacks/zod /app

WORKDIR /app

# Install dependencies (zod uses pnpm)
RUN npm install -g pnpm
RUN pnpm install

CMD ["/bin/sh"]

FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates bash python3 && rm -rf /var/lib/apt/lists/*
RUN npm install -g opencode-ai

WORKDIR /workspace
COPY opencode/entrypoint.sh /usr/local/bin/thuisles-opencode
RUN chmod +x /usr/local/bin/thuisles-opencode

EXPOSE 4096
ENTRYPOINT ["/usr/local/bin/thuisles-opencode"]

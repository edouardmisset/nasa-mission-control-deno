FROM denoland/deno:alpine-1.17.1

WORKDIR /app

COPY . .

USER deno

CMD [ "run", "--allow-net", "--allow-read", "src/mod.ts" ]

EXPOSE 8000
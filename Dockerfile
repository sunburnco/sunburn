FROM node:lts-alpine AS app_builder
RUN npm install -g pnpm
WORKDIR /app
COPY ./app/package.json ./
COPY ./app/pnpm-lock.yaml ./
RUN pnpm install
COPY ./app .
RUN pnpm run build

FROM golang:alpine AS backend_builder
WORKDIR /go/src/app
COPY ./backend .
RUN go mod download
RUN go build -o sunburn .
# TODO create migrations

FROM alpine
WORKDIR /app
COPY --from=backend_builder /go/src/app/sunburn .
COPY --from=backend_builder /go/src/app/migrations ./migrations
RUN ./sunburn migrate up
COPY --from=app_builder /app/build ./svelteOut
EXPOSE 3000

CMD ["./sunburn", "--dir", "/data", "--http", "0.0.0.0:3000", "serve"]
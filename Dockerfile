FROM node:lts-alpine AS app_builder
RUN npm install -g pnpm
WORKDIR /app
COPY ./pwa/package.json ./
COPY ./pwa/pnpm-lock.yaml ./
RUN pnpm install
COPY ./pwa .
RUN pnpm run build

FROM golang:alpine AS backend_builder
WORKDIR /go/src/app
COPY ./backend .
RUN go mod download
RUN go build -o sunburn .

FROM alpine
WORKDIR /app
COPY --from=backend_builder /go/src/app/sunburn .
RUN ./sunburn migrate up
COPY --from=app_builder /app/build ./svelteOut
EXPOSE 3000

CMD ["./sunburn", "--dir", "/data", "--http", "0.0.0.0:3000", "serve"]

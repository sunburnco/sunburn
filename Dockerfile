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

FROM node:lts-alpine
WORKDIR /app
COPY ./docker-wrapper.sh .
COPY --from=backend_builder /go/src/app/sunburn .
RUN ./sunburn migrate up
COPY --from=app_builder /app/build ./pwa

EXPOSE 3000

CMD ["./docker-wrapper.sh"]

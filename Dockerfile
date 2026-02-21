FROM --platform=$BUILDPLATFORM node:lts-alpine AS app_builder
RUN npm install -g pnpm
WORKDIR /app
COPY ./pwa/package.json ./
COPY ./pwa/pnpm-lock.yaml ./
RUN pnpm install
COPY ./pwa .
RUN pnpm run build

FROM --platform=$BUILDPLATFORM golang:alpine AS backend_builder
ARG TARGETOS TARGETARCH
WORKDIR /go/src/app
COPY ./backend .
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH go mod download
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o sunburn .

FROM scratch
WORKDIR /app
COPY --from=app_builder /app/build ./pwa
COPY --from=backend_builder /go/src/app/sunburn .

EXPOSE 3000
CMD ["./sunburn", "--dir", "/data", "--http", "0.0.0.0:3000", "serve"]

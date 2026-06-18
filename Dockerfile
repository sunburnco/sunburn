FROM --platform=$BUILDPLATFORM node:lts-alpine AS app_builder
RUN npm install -g pnpm
WORKDIR /app
COPY ./pwa/package.json ./
COPY ./pwa/pnpm-lock.yaml ./
COPY ./pwa/pnpm-workspace.yaml ./
RUN pnpm install
COPY ./pwa .
RUN pnpm run build

FROM --platform=$BUILDPLATFORM golang:alpine AS backend_builder
ARG TARGETOS TARGETARCH
WORKDIR /go/src/app
# https://gist.github.com/michaelboke/564bf96f7331f35f1716b59984befc50
RUN apk update && apk upgrade && apk add --no-cache ca-certificates
RUN update-ca-certificates
COPY ./backend .
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go mod download
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o sunburn .

FROM scratch
WORKDIR /app
COPY --from=app_builder /app/build ./pwa
COPY --from=backend_builder /go/src/app/sunburn .
COPY --from=backend_builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

EXPOSE 3000
CMD ["./sunburn", "--dir", "/data", "--http", "0.0.0.0:3000", "serve"]

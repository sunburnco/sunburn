#!/bin/sh

parallel ::: "pnpm dev --host" "cd ../backend && make servehttp"

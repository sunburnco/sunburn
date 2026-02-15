#!/bin/sh

PORT=4000 node /app/pwa 2> /dev/null &

./sunburn --dir /data --http 0.0.0.0:3000 serve &

wait -n

exit $?

#!/bin/bash
if [ ! "$(podman ps -a -q -f name=postgres-db)" ]; then
    if [ "$(podman ps -aq -f status=exited -f name=postgres-db)" ]; then
        # cleanup
        podman rm postgres-db
    fi
    # run the container
    podman run -v play_volume:/var/lib/postgresql/data \
    --name postgres-db -e POSTGRES_PASSWORD=pass \
    -e POSTGRES_USER=playreading -e POSTGRES_DB=playreadingparty \
    -p 5432:5432 -d play-reading
fi

# start production server
node src/server.js

# TODO: add something that watches for when the server is exited, then kill and remove the container
#!/bin/bash

DOMAIN="${MAGNET_DOMAIN:=tengam.org}"

ab -p payload.json -T application/json -c 5 -n 100 https://${DOMAIN}/api/v1/metadata

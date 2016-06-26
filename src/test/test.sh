#!/bin/bash

pushd /www/modules/be/src > /dev/null
env DB_HOST=$(docker inspect --format '{{ .NetworkSettings.Networks.dev_default.IPAddress }}' $(docker ps | grep db-test | cut -d " " -f 1)) npm test
popd > /dev/null
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

pushd $DIR/../ > /dev/null
env DB_HOST=192.168.33.10 DB_USER=root DB_PW=root DB_NAME=db NODE_ENV=test npm test
popd > /dev/null
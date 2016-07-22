#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

pushd $DIR/../ > /dev/null
env DB_HOST=localhost DB_USER=root DB_PW=root DB_NAME=db NODE_ENV=test npm test
popd > /dev/null
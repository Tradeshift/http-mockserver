#!/bin/bash
./bin/http-mockserver.js --mocks ./examples/ > /dev/null &
MOCKSERVER_PID=$!

jest
JEST_EXITCODE=$?

kill $MOCKSERVER_PID

exit $JEST_EXITCODE

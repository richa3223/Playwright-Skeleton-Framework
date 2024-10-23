#!/bin/bash

#Automatically expands aliases 
shopt -s expand_aliases

#Writes stdout to a file
function echo_tee() {
    echo $1 | tee -a /tmp/stdout.log
}
alias echo=echo_tee

echo "Starting playwright skeleton tests using Tag: \"$TEST_TAG\""

#Runs tests
npx playwright test

##Get exit status of playwright and store into '$status' variable
status=$?

if [ $status -eq 0 ]
then
  result="pass"
else
  result="fail"
fi

echo "Test execution completed with status: $result"

#Write results to a file
echo "{ \"result\" : \"$result\"}" > $TRI-result.json

#Consider copying the results to an external volume (e.g. s3 bucket)
#Copy stdout to the playwright report dir
cp /tmp/stdout.log $PLAYWRIGHT_HTML_REPORT/stdout.log
exit 0
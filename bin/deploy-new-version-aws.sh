#!/bin/sh
if [[ $# -eq 0 ]] ; then
    echo 'Please pass the number of new version'
    exit 0
fi
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 755297683773.dkr.ecr.us-east-1.amazonaws.com

docker build -t duniapay-api:$1 .

docker tag duniapay-api:$1 755297683773.dkr.ecr.us-east-1.amazonaws.com/duniapay-api:$1

docker push 755297683773.dkr.ecr.us-east-1.amazonaws.com/duniapay-api:$1

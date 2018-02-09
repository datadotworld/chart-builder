#!/usr/bin/env bash

set -o xtrace -o errexit -o pipefail

# populate the AWS profiles from env vars
mkdir -p ~/.aws
# Wipe any possibly pre-existing content. We only want our creds to be ones populated
echo "[default]" > ~/.aws/credentials
echo "aws_access_key_id=${DEV_AWS_ACCESS_KEY_ID}" >> ~/.aws/credentials
echo "aws_secret_access_key=${DEV_AWS_SECRET_ACCESS_KEY}" >> ~/.aws/credentials

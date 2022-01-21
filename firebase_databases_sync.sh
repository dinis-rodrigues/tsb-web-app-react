#!/bin/sh
LAST_LINE=$(sed -n -e '$p' .env)
FIREBASE_TOKEN=`echo "$LAST_LINE" | cut -d'"' -f 2`

RED='\033[1;32m'
NC='\033[0m' # No Color
bold=$(tput bold)
normal=$(tput sgr0)

cd .firebase

firebase use --clear --token $FIREBASE_TOKEN
firebase use default --token $FIREBASE_TOKEN
firebase database:get "/" --token $FIREBASE_TOKEN > original_data.json

firebase use --clear --token $FIREBASE_TOKEN
firebase use dev --token $FIREBASE_TOKEN
yes | firebase database:set "/" original_data.json --force --token $FIREBASE_TOKEN


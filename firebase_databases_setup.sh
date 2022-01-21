#!/bin/sh
LAST_LINE=$(sed -n -e '$p' .env)
FIREBASE_TOKEN=`echo "$LAST_LINE" | cut -d'"' -f 2`

RED='\033[1;32m'
NC='\033[0m' # No Color
bold=$(tput bold)
normal=$(tput sgr0)

rm -rf .firebase
mkdir .firebase
cd .firebase

firebase init database --token $FIREBASE_TOKEN

echo "${RED}\n\n\n\n\n\n\n"
echo "----------------------------------------------------------------------"
echo "${NC}Add your development database now and name it (alias): ${RED} ${bold}dev${normal}"
echo "${RED}----------------------------------------------------------------------${NC}"

firebase use --add --token $FIREBASE_TOKEN

echo "${RED}\n\n\n\n\n\n\n"
echo "----------------------------------------------------------------------"
echo "${NC}Add your development database now and name it (alias): ${RED} ${bold}dev${normal}"
echo "${RED}----------------------------------------------------------------------${NC}"

firebase use --clear --token $FIREBASE_TOKEN
firebase use default --token $FIREBASE_TOKEN
firebase database:get "/" --token $FIREBASE_TOKEN > original_data.json

firebase use --clear --token $FIREBASE_TOKEN
firebase use dev --token $FIREBASE_TOKEN
firebase database:set "/" original_data.json --token $FIREBASE_TOKEN


echo "${RED}\n\n\n\n\n\n\n\n\n\n\n\n\n\n"
echo "----------------------------------------------------------------------"
echo "${RED} ${bold}Development database was synced with original${normal}"
echo "${RED}----------------------------------------------------------------------${NC}"


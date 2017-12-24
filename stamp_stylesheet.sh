#!/bin/bash
DIR=$(dirname "${BASH_SOURCE}")
TIMESTAMP=$(date +'%s')
echo "Updating Stylehseet timestamp..."
# update all *.md and *.html in ./www/*
for FILE_PATH in $(find "${DIR}/www" -type f \( -name "*.html" -o -name "*.md" \)) ; do
    sed "s/style.css.*\"/style.css\?stamp=${TIMESTAMP}\"/" "${FILE_PATH}" > "${FILE_PATH}.tmp"
    mv "${FILE_PATH}.tmp" "${FILE_PATH}"
done
#sed style.css?reload-please=
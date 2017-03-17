#!/bin/bash
DIR=$(dirname "${BASH_SOURCE}")
echo "Updating Posts..."
for FILE_PATH in ${DIR}/*.md ; do
  if [ "${FILE_PATH}" != "${DIR}/template.md" ] ; then
    FILE_NAME=${FILE_PATH##*/}
    FILE_NAME=${FILE_NAME%%.*}
    echo ""
    echo "$FILE_PATH --> $FILE_NAME.html"
    (set -x
    pandoc -o ${DIR}/${FILE_NAME}.html ${FILE_PATH} --highlight-style=pygments -s)
  fi
done

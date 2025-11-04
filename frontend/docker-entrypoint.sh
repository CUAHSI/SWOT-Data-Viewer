#!/bin/sh
DIST_DIR=${DIST_DIR:-/srv}
# Replace env vars in files served by NGINX
for file in $DIST_DIR/assets/*.js $DIST_DIR/index.html; do
    echo "Processing $file ..."
    # LC_ALL=C sed -i "" 's|VITE_APP_API_URL_PLACEHOLDER|'${VITE_APP_API_URL}'|g' $file
    sed -i 's|VITE_APP_API_URL_PLACEHOLDER|'${VITE_APP_API_URL}'|g' $file
    sed -i 's|VITE_APP_FULL_URL_PLACEHOLDER|'${VITE_APP_FULL_URL}'|g' $file
    sed -i 's|VITE_APP_BASE_PLACEHOLDER|'${VITE_APP_BASE}'|g' $file
    sed -i 's|VITE_HYDROSHARE_NOTEBOOKS_COLLECTION_PLACEHOLDER|'${VITE_HYDROSHARE_NOTEBOOKS_COLLECTION}'|g' $file
done

exec "$@"

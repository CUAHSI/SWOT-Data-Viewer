# this script uses docker compose to run nbconvert on the notebook files in the notebooks directory
# it then copies the converted files to the frontend/public/notebooks directory

# export variable for the notebook directory
export NOTEBOOK_DIR=../frontend/public/notebooks
export SOURCE_NOTEBOOK_JS_MODULE=../frontend/src/notebooks.mjs

# copy the notebooks from the frontend/public/notebooks directory to the notebooks directory
mkdir -p notebooks
cp $NOTEBOOK_DIR/*.ipynb notebooks/

# # run nbconvert on the notebooks
# docker-compose up nbconvert -d
# docker cp nbconvert:/home/jovyan/dist/. $NOTEBOOK_DIR
# docker-compose down

# create a js module that has an object with the notebook metadata
# each notebook can contain a cell with the following metadata:
META_TO_PARSE=("META_TITLE" "META_SUBTITLE" "META_DESCRIPTION")
# for example, the notebook can contain a cell with the following metadata:
# META_TITLE = "Example metadata tile"
# META_SUBTITLE = "This is a subtitle"
# META_DESCRIPTION = "This is a description of the metadata tile. It can be as long as you want it to be."
# so we will extract this metadata and create a js module with the metadata
echo "export const notebooks = [" > $SOURCE_NOTEBOOK_JS_MODULE
for file in $NOTEBOOK_DIR/*.ipynb; do
    filename=$(basename $file)
    echo "Processing $file ..."
    file_stdout=$(jupyter nbconvert --to script $file --stdout)
    echo "  {" >> $SOURCE_NOTEBOOK_JS_MODULE
    echo "    filename: '$filename'," >> $SOURCE_NOTEBOOK_JS_MODULE
    for meta in ${META_TO_PARSE[@]}; do
        echo "Processing $meta ..."
        value=$(echo "$file_stdout" | grep $meta | cut -d'"' -f2)
        if [ "$value" ]; then
            echo "    $meta: '$value'," >> $SOURCE_NOTEBOOK_JS_MODULE
        fi
    done
    echo "  }," >> $SOURCE_NOTEBOOK_JS_MODULE
done
echo "];" >> $SOURCE_NOTEBOOK_JS_MODULE

# remove the notebooks from the notebooks directory
rm notebooks/*.ipynb

echo "Notebooks converted and copied to frontend/public/notebooks directory"
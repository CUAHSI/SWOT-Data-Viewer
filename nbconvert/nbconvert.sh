# this script uses docker compose to run nbconvert on the notebook files in the notebooks directory
# it then copies the converted files to the frontend/public/notebooks directory

# export variable for the notebook directory
export NOTEBOOK_DIR=../frontend/public/notebooks

# run nbconvert on the notebooks
docker-compose up nbconvert -d
docker cp nbconvert:/home/jovyan/dist/. $NOTEBOOK_DIR
docker-compose down

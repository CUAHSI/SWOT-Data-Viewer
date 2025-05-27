# SWOT-Data-Viewer
Data viewing, discovery, and access interface for the Surface Water Open Topography mission.

## Getting Started

### Clone the repo, checkout this branch
```console
git clone https://github.com/CUAHSI/SWOT-Data-Viewer.git
cd SWOT-Data-Viewer
git checkout develop
```

### Full stack running locally
```console
cp .env.template .env
make build-all
make up-all
```
The API will be available at http://0.0.0.0:8000 
The UI will be available at http://localhost:5173

To bring the stack down:
```console
make down-all
```
To see logs:
```console
make logs-front
#or
make logs-back
```

### Frontend only, for local development
```console
cp .env.template .env
cd frontend
npm install
npm run dev
```
The frontend will be available at http://localhost:5173
More detailed info is available in the [frontend readme](frontend/README.md)

## Formatting
```console
# backend
make format
# frontend:
cd frontend && lint-format-fix
```
Formatting and linting is run with a git pre-commit hook using Husky.
It requires the Docker daemon to be running.
If you are having trouble with the formatting and linting, you can see here how to skip the git hook:
https://typicode.github.io/husky/how-to.html#skipping-git-hooks
However note that this is not recommended -- let's keep our code clean!

## Adding notebooks

Notebooks from [this collection](https://www.hydroshare.org/resource/ac6cc75dcb0146cf9cc17a974f4bb08b/) will be rendered as examples

## More info
[CI/CD info](https://develop.cuahsi.io/swotviz/ci_cd/)

## MyBinder 

The functionality to launch into MyBinder relies on a separate repo:
[https://github.com/hydroshare/hydroshare_github_sync](https://github.com/hydroshare/hydroshare_github_sync)

This is because the direct hydroshare launch into MyBinder is broken at this time...

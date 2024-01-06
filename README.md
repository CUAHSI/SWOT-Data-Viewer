# SWOT-Data-Viewer
Data viewing, discovery, and access interface for the Surface Water Open Topography mission.

## Getting Started

### Clone the repo, checkout this branch
```console
git clone https://github.com/CUAHSI/SWOT-Data-Viewer.git
cd SWOT-Data-Viewer
git checkout main
```

### API for local development
```console
cp .env.template .env
make build
make up
```
The API will be available at http://0.0.0.0:8000

### Frontend for local development
```console
cp .env.template .env  #if you haven't already. Replace `https://localhost` with `https://localhost:5173`
cd frontend
npm install
npm run dev
```
The frontend will be available at http://localhost:5173
More detailed info is available in the [frontend readme](frontend/README.md)

## Formatting
```console
make format
```
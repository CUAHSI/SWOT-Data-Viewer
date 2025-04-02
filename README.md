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
make build
make up
```
The API will be available at http://0.0.0.0:8000 
The Frontend will be available at https://localhost (you will have to add an exception for the self-signed cert)

### Frontend for local development
```console
cp .env.template .env  #if you haven't already. Replace `https://localhost` with `http://localhost:5173` (or whatever port is used by Vite)
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

## Adding notebooks

Notebooks from [this collection](https://www.hydroshare.org/resource/ac6cc75dcb0146cf9cc17a974f4bb08b/) will be rendered as examples

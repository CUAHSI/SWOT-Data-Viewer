from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse, PlainTextResponse

from config import get_settings

settings = get_settings()

router = APIRouter()

# Original HydroCron URL
HYDROCRON_BASE_URL = settings.vite_hydrocron_url


@router.get("/timeseries")
async def proxy_hydrocron_timeseries(
    feature: str = Query(..., description="Feature type"),
    feature_id: str = Query(..., description="Feature ID"),
    start_time: str = Query(..., description="Start time"),
    end_time: str = Query(..., description="End time"),
    output: str = Query("geojson", description="Output format"),
    fields: Optional[str] = Query(None, description="Fields to include"),
    compact: Optional[str] = Query(None, description="Compact format"),
    collection_name: Optional[str] = Query(None, description="Collection name"),
):
    """
    Proxy endpoint for HydroCron timeseries data
    """
    # Build query parameters for the external API
    params = {
        "feature": feature,
        "feature_id": feature_id,
        "start_time": start_time,
        "end_time": end_time,
        "output": output,
    }

    # Add optional parameters if provided
    if fields:
        params["fields"] = fields
    if compact:
        params["compact"] = compact
    if collection_name:
        params["collection_name"] = collection_name

    try:
        async with httpx.AsyncClient() as client:
            print(
                f"Original request url with params: {client.build_request('GET', HYDROCRON_BASE_URL, params=params).url}"
            )
            response = await client.get(HYDROCRON_BASE_URL, params=params, timeout=30.0)

            # If the response is successful, return the content
            if response.status_code == 200:
                if output == "csv":
                    return PlainTextResponse(content=response.text)
                else:
                    return JSONResponse(content=response.json())
            else:
                # Forward the error from the external API
                # check if response has json content
                if response.headers.get("Content-Type") == "application/json":
                    error_detail = response.json()
                else:
                    error_detail = response.text
                # ensure we include statusText as well
                if "statusText" in response.headers:
                    error_detail += f": {response.headers['statusText']}"
                return JSONResponse(content=error_detail, status_code=response.status_code)

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request timeout")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Error connecting to HydroCron: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

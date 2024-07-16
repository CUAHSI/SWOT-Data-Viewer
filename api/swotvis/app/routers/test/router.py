from fastapi import APIRouter
import pandas as pd
from app.models import (
    SwotDataModel,
)
router = APIRouter()


@router.get('/', description="Test endpoint")
async def test_endpoint():
    return {"message": "Hello, world!"}


@router.post('/convert', description="Convert SWOT response")
async def convert_swot_data(data: SwotDataModel):
    """Convert SWOT response

    """
    # TODO: further parse the data
    features = data.results

    # create a new pandas dataframe
    df = pd.DataFrame(features)

    return df.to_html()

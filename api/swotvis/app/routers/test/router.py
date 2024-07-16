from fastapi import APIRouter
import pandas as pd
from app.models import (
    SwotNodeDataModel,
)
from typing import List
router = APIRouter()


@router.post('/convert', description="Convert some SWOT data")
async def convert_swot_data(data: List[List[SwotNodeDataModel]]):
    """Convert SWOT data

    """
    # TODO: further parse the data

    # for now as exmple we will just convert the data to a pandas dataframe
    df = pd.DataFrame(data)

    return df.to_html()

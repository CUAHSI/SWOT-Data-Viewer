from typing import List

import numpy as np
from fastapi import APIRouter

from app.enums import NodeVariables
from app.models import SwotNodeDataModel, SwotNodeDataSeriesModel

router = APIRouter()


@router.post(
    "/compute_node_series",
    description="Compute node-level series from raw SWOT observations",
)
async def compute_node_series(data: List[List[SwotNodeDataModel]]):
    """
    Compute node-level series statistics from raw SWOT observations.

    Arguments:
    ==========
    data: List[List[SwotNodeDataModel]]
        A list of lists of SWOT node data models.

    Returns:
    ========
    dict{ dict{ str: [float] } }
        A dictionary containing summarized node data for every node in the
        input data.


    """

    # create a SwotNodeDataSeriesModel object from the raw SWOT
    # observations that we received as input that were retrieved
    # from HydroCron.
    series = SwotNodeDataSeriesModel(all_series=data)

    # group all data by p_dist_out and remove all columns except
    # those corresponding to node variables
    grouped = series.as_dataframe()[NodeVariables.list()].groupby("p_dist_out")

    # Compute node-level statistics. Replace np.nan with None because np.nan
    # is not JSON serializable. Convert all pandas dataframes to dictionaries
    # so they can be serialized to JSON.
    dat = {}
    dat["median"] = grouped.median().replace([np.nan], [None]).reset_index()

    # compute quantiles for each node variable
    for q in [0.25, 0.75]:
        dat[f"q{q}"] = grouped.quantile(q).replace([np.nan], [None]).reset_index()

    # reorganize these data into an object that chartjs can work
    # with on the front-end. These data must be organized in
    # the following way:
    # [
    #   ## series 1 ##
    #   [
    #     {var1: value1, var2: value2, ...},
    #     {var1: value1, var2: value2, ...},
    #     {var1: value1, var2: value2, ...},
    #     {var1: value1, var2: value2, ...},
    #   ],
    #   ## series 2 ##
    #   [
    #     {var1: value1, var2: value2, ...},
    #     {var1: value1, var2: value2, ...},
    #     {var1: value1, var2: value2, ...},
    #     {var1: value1, var2: value2, ...},
    #   ],
    #
    # ]
    res = {}
    for k, d in dat.items():
        res[k] = d.to_dict(orient="records")

    # return a JSON serializable dictionary and let FastAPI handle the conversion
    return res

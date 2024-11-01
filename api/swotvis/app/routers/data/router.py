from typing import List

import numpy as np
import pandas as pd
from fastapi import APIRouter

from app.enums import NodeVariables
from app.models import SwotNodeDataModel, SwotNodeDataSeriesModel

router = APIRouter()

import epdb


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

    df = series.as_dataframe()

    # TODO: this is hard-coded and should be generalized in the future
    computed = {}
    variables_to_compute = [
        {"name": "wse", "xvar": "p_dist_out", "yvar": "wse"},
        {"name": "width", "xvar": "p_dist_out", "yvar": "width"},
        {"name": "area_total", "xvar": "p_dist_out", "yvar": "area_total"},
        {"name": "wse_vs_width", "xvar": "width", "yvar": "wse"},
    ]

    for variable in variables_to_compute:
        # ["wse", "width", "area_total"]:
        output_variable_name = variable["name"]
        stats = compute_iqr_statistics(
            df, variable["xvar"], variable["yvar"], output_variable_name, x_precision=0
        )

        # save the computed statistics for this variable in the computed dictionary
        for statistic_name, statistic_dataframe in stats.items():
            if statistic_name in computed.keys():
                # extend the entry in computed to include the stats for variable_name
                computed[statistic_name] = pd.concat(
                    [computed[statistic_name], statistic_dataframe], axis=1
                )
            else:
                computed[statistic_name] = statistic_dataframe

            # replace np.nan with None because np.nan is not JSON serializable
            computed[statistic_name] = computed[statistic_name].replace(
                [np.nan], [None]
            )

    # format stats in a way that can be serialized to json easily
    res2 = {}
    for k, d in computed.items():
        res2[k] = d.to_dict(orient="records")
    return res2

    epdb.st()
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


def compute_iqr_statistics(
    df, x_variable_name, y_variable_name, output_variable_name, x_precision=2
):
    """
    Computes the IQR statistics for a given x and y variable.

    Arguments:
    ==========
    df: pd.DataFrame
        A pandas dataframe containing the x and y variables.
    x_variable_name: str
        Name of the x variable to compute the IQR statistics for.
    y_variable_name: str
        Name of the y variable to compute the IQR statistics for.
    output_variable_name: str
        Name to use when saving the computed statistics output. This will usually be the same
        as the y_variable_name
    x_precision: int
        The number of decimal places to round the x variable to before computing the IQR statistics.

    Returns:
    ========
    dict
        A dictionary of pandas dataframes containing the IQR statistics for the x and y variables.

    """

    # lambda function to round the x variable to x_precision decimal
    round_func = lambda x: round(x, x_precision)

    dat = {}
    dat["median"] = (
        df[[x_variable_name, y_variable_name]]
        .groupby(df[x_variable_name].apply(round_func), as_index=False)
        .median()
        .replace([np.nan], [None])
        .rename(columns={y_variable_name: output_variable_name})
    )[output_variable_name]

    # compute quantiles for each node variable
    for q in [0.25, 0.75]:
        dat[f"q{q}"] = (
            df[[x_variable_name, y_variable_name]]
            .groupby(
                df[x_variable_name].apply(round_func),
                as_index=False,
            )
            .quantile(q)
            .replace([np.nan], [None])
            .rename(columns={y_variable_name: output_variable_name})
        )[output_variable_name]
    return dat

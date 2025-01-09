import datetime
from typing import List

import pandas as pd
from pydantic import BaseModel


class SwotNodeDataModel(BaseModel):
    """
    SWOT data is stored in the following format (for example):
    {
        "wse": "330.56504",
        "width": "581.065642",
        "area_total": "111953.0",
        "time_str": "2024-01-01T16:46:39Z",
        "node_q": "1",
        "p_dist_out": "3944438.0",
        "wse_units": "m",
        "width_units": "m",
        "area_total_units": "m^2",
        "p_dist_out_units": "m",
        "datetime": "2024-01-01T16:46:39.000Z"
    }
    """

    # TODO: add more fields as needed
    time_str: str
    node_q: int
    p_dist_out: float
    wse: float
    width: float
    area_total: float
    time_str: str
    wse_units: str
    width_units: str
    area_total_units: str
    p_dist_out_units: str
    datetime: datetime.datetime


class SwotNodeDataSeriesModel(BaseModel):

    all_series: List[List[SwotNodeDataModel]]

    def as_dataframe(self) -> pd.DataFrame:
        dat = []
        for series in self.all_series:
            for node in series:
                dat.append(node.dict())
        return pd.DataFrame(dat)

    def by_node(self) -> dict[float, pd.DataFrame]:
        df = self.as_dataframe()
        dat = {}
        for p_dist_out, group in df.groupby("p_dist_out"):
            dat[p_dist_out] = group
        return dat

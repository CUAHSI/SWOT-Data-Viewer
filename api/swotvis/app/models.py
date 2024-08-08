import datetime
from typing import Annotated, List

import pandas as pd
from fastapi import Depends, HTTPException, Path, status
from pydantic import BaseModel, Field

from app.db import Submission, User
from app.users import current_active_user


class WorkflowParams(BaseModel):
    workflow_id: str = Field(title="Workflow ID", description="The id of the workflow")
    submission: Submission
    user: User


async def workflow_params(
    workflow_id: Annotated[str, Path(title="Workflow ID", description="The id of the workflow")],
    user: User = Depends(current_active_user),
):
    submission = user.get_submission(workflow_id)
    if workflow_id not in [submission.workflow_id for submission in user.submissions]:
        raise HTTPException(status.HTTP_404_NOT_FOUND)
    return WorkflowParams(workflow_id=workflow_id, user=user, submission=submission)


WorkflowDep = Annotated[WorkflowParams, Depends(workflow_params)]


class LogsResponseModel(BaseModel):
    logs: str = Field(description="The logs for a workflow submission")


class UrlResponseModel(BaseModel):
    url: str = Field(description="The presigned url to download a submission result")


class UserSubmissionsResponseModel(BaseModel):
    submissions: list[Submission]


class SubmissionResponseModel(Submission):
    workflow_id: str


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

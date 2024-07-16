from typing import Annotated

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


class SwotDataModel(BaseModel):
    """
    SWOT data is stored in the following format (for example):
    {
        "status": "200 OK",
        "time": 2185.644,
        "hits": 2,
        "results": {
            "csv": "",
            "geojson": {
                "type": "FeatureCollection",
                "features": [
                    {
                        "id": "0",
                        "type": "Feature",
                        "properties": {
                            "wse": "155.40462",
                            "width": "-999999999999.0",
                            "area_total": "-999999999999.0",
                            "time_str": "2024-01-15T20:04:41Z",
                            "node_q": "3",
                            "p_dist_out": "2180371.0",
                            "wse_units": "m",
                            "width_units": "m",
                            "area_total_units": "m^2",
                            "p_dist_out_units": "m"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [-113.827873, 61.748777]
                        }
                    },
                    {
                        "id": "1",
                        "type": "Feature",
                        "properties": {
                            "wse": "154.9736",
                            "width": "-999999999999.0",
                            "area_total": "-999999999999.0",
                            "time_str": "2024-01-26T09:38:18Z",
                            "node_q": "3",
                            "p_dist_out": "2180371.0",
                            "wse_units": "m",
                            "width_units": "m",
                            "area_total_units": "m^2",
                            "p_dist_out_units": "m"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [-113.827873, 61.748777]
                        }
                    },
                ]
            }
        }
    }
    """
    status: str
    time: float
    hits: int
    params: dict
    # TODO: add more specific types for the results
    results: dict

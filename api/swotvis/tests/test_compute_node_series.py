"""Tests for the /data/compute_node_series statistics endpoint.

Run with the repo's `make test` target (docker compose exec api pytest tests),
or directly from the api/swotvis directory with `PYTHONPATH=. pytest tests`.
"""

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.routers.data import router as data_router


def _client():
    app = FastAPI()
    app.include_router(data_router, prefix="/data")
    return TestClient(app, raise_server_exceptions=False)


def _observation(p_dist_out, wse, width, area_total, time_str):
    return {
        "time_str": time_str,
        "node_q": 1,
        "p_dist_out": p_dist_out,
        "wse": wse,
        "width": width,
        "area_total": area_total,
        "wse_units": "m",
        "width_units": "m",
        "area_total_units": "m^2",
        "p_dist_out_units": "m",
        "datetime": time_str,
    }


def test_compute_node_series_summarizes_observations_by_distance():
    client = _client()
    # Two observations at p_dist_out=100 (wse 10 and 20) and one at 200.
    data = [
        [
            _observation(100.0, 10.0, 50.0, 500.0, "2024-01-01T00:00:00Z"),
            _observation(100.0, 20.0, 60.0, 600.0, "2024-01-08T00:00:00Z"),
            _observation(200.0, 30.0, 70.0, 700.0, "2024-01-01T00:00:00Z"),
        ]
    ]

    response = client.post("/data/compute_node_series", json=data)

    assert response.status_code == 200
    body = response.json()
    assert set(body.keys()) == {"median", "q0.25", "q0.75"}

    median = {row["p_dist_out"]: row for row in body["median"]}
    assert median[100.0]["wse"] == 15.0
    assert median[100.0]["width"] == 55.0
    assert median[200.0]["wse"] == 30.0

    q25 = {row["p_dist_out"]: row for row in body["q0.25"]}
    q75 = {row["p_dist_out"]: row for row in body["q0.75"]}
    assert q25[100.0]["wse"] == 12.5
    assert q75[100.0]["wse"] == 17.5


def test_compute_node_series_empty_body_returns_empty_series():
    # Regression: an empty request body used to raise a KeyError -> HTTP 500.
    client = _client()

    response = client.post("/data/compute_node_series", json=[])

    assert response.status_code == 200
    assert response.json() == {"median": [], "q0.25": [], "q0.75": []}


def test_compute_node_series_series_without_observations_returns_empty_series():
    # Regression: a series carrying no observations used to raise a 500 too.
    client = _client()

    response = client.post("/data/compute_node_series", json=[[]])

    assert response.status_code == 200
    assert response.json() == {"median": [], "q0.25": [], "q0.75": []}

from enum import Enum


class NodeVariables(str, Enum):
    """
    List of SWOT node variables
    """

    ws = "wse"
    width = "width"
    area = "area_total"
    p_dist_out = "p_dist_out"

    @staticmethod
    def list():
        return list(map(lambda v: v.value, NodeVariables))


class NodeMetadata(str, Enum):
    """
    List of SWOT node metadata
    """

    node_q = "node_q"
    wse_units = "wse_units"
    width_units = "width_units"
    area_total_units = "area_total_units"
    p_dist_out_units = "p_dist_out_units"
    datetime = "datetime"

    @staticmethod
    def list():
        return list(map(lambda v: v.value, NodeMetadata))

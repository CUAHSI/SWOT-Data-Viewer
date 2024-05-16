# arcpy can be run using a defined argis pro environment. This is typically installed
# C:\Program Files\ArcGIS\Pro\bin\Python\envs\arcgispro-py3
# see more here https://resources.esri.ca/getting-technical/how-to-configure-visual-studio-code-with-arcgis-pro-s-python-environment

import arcpy
import os

# assumes download and extraction of data has happened.
# To Do: automate extraction of data from zip file
# To Do: clean up of files


# Set paths
environment = r"C:\Maps\SWOT\SWOT_PLD_v103_beta"
input_gdb = os.path.join(environment, "SWOT_PLD_v103_beta.gdb")
output_directory = r"C:\Maps\SWOT\output"
output_gdb = "world_SWORD_lakes_mercator"
output_fc_name = "world_SWORD_lakes_mercator"
output_spatial_reference = arcpy.SpatialReference(
    3857)  # Example spatial reference, adjust as needed

# Create output geodatabase if it doesn't exist
if not arcpy.Exists(output_directory):
    os.makedirs(output_directory)
if not arcpy.Exists(output_gdb):
    gdb_path = os.path.join(output_directory, output_gdb + ".gdb")
    arcpy.CreateFileGDB_management(output_directory, output_gdb)
arcpy.env.workspace = input_gdb
# List all feature datasets and feature classes in the input geodatabase
datasets = arcpy.ListDatasets("*", "Feature")
datasets = datasets + [""]  # Add feature classes from the root level
for dataset in datasets:
    for fc in arcpy.ListFeatureClasses("*", "ALL", dataset):

        # Reproject the feature class
        output_path = os.path.join(
            output_directory, output_gdb + ".gdb", output_fc_name)
        arcpy.management.Project(fc,  output_path, output_spatial_reference)

print("Geodatabase reprojection completed successfully.")

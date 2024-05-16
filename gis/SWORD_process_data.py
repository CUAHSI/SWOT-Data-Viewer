# arcpy can be run using a defined argis pro environment. This is typically installed
# C:\Program Files\ArcGIS\Pro\bin\Python\envs\arcgispro-py3
# see more here https://resources.esri.ca/getting-technical/how-to-configure-visual-studio-code-with-arcgis-pro-s-python-environment

import arcpy
import os
import shutil
import zipfile


def extract_zip(zip_file, extract_to, subdirectory_name):
    """
    Extracts the contents of a ZIP file to a specified directory.

    Parameters:
        zip_file (str): Path to the ZIP file.
        extract_to (str): Directory where the contents will be extracted.
        subdirectory_name (str): Name of the subdirectory within the extraction directory.

    Returns:
        str: Path to the directory where the contents were extracted.
    """
    print("Extracting ZIP file...")

    extract_dir = os.path.join(extract_to, subdirectory_name)
    with zipfile.ZipFile(zip_file, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)
        print(extract_dir)

    return extract_dir


def merge_and_reproject_shapefiles(input_directory, zip_file, output_directory, shapefile_substrings, output_spatial_reference, subdirectory_name):
    """
    Merges and reprojects shapefiles containing specific substrings in the specified input directory
    and its subdirectories into single feature classes within a geodatabase.

    Parameters:
        input_directory (str): Path to the directory containing extracted shapefiles.
        zip_file (str): Relative path to the ZIP file containing shapefiles (relative to input_directory).
        output_directory (str): Output directory for the merged and reprojected shapefiles.
        shapefile_substrings (list): List of substrings contained in the shapefile names to be merged and reprojected.
        output_spatial_reference (str or arcpy.SpatialReference): Desired spatial reference for the output feature class.
            Can be specified as either the well-known ID (WKID) or the full coordinate system string,
            or an arcpy.SpatialReference object.
        subdirectory_name (str): Name of the subdirectory within the extraction directory containing the shapefiles.

    Returns:
        None
    """

    print("Merging and reprojecting shapefiles...")

    # Set output directory for the extracted contents
    output_directory = os.path.join(input_directory, output_directory)

    # Extract the contents of the ZIP file to a specified subdirectory
    extracted_dir = extract_zip(os.path.join(
        input_directory, zip_file), output_directory, subdirectory_name)

    for shapefile_substring in shapefile_substrings:
        # Set output geodatabase name
        output_gdbname = f"world_SWORD_{shapefile_substring}_mercator"

        # Create output geodatabase if it doesn't exist
        output_gdb = os.path.join(output_directory, output_gdbname + ".gdb")
        if not arcpy.Exists(output_gdb):
            arcpy.CreateFileGDB_management(output_directory, output_gdbname)

        # Walk through all subdirectories and list all shapefiles
        shapefiles = []
        for root, dirs, files in arcpy.da.Walk(os.path.join(extracted_dir, subdirectory_name), datatype="FeatureClass"):
            for filename in files:
                if filename.endswith(".shp") and shapefile_substring in filename:
                    shapefiles.append(os.path.join(root, filename))

        # Check if there are shapefiles to merge and reproject
        if not shapefiles:
            print(
                f"No shapefiles containing substring '{shapefile_substring}' found in the input directory.")
            continue

        # Merge shapefiles into a single feature class
        output_featureclass = f"world_SWORD_{shapefile_substring}"
        merged_feature_class = os.path.join(output_gdb, output_featureclass)
        arcpy.Merge_management(shapefiles, merged_feature_class)

        # Reproject the merged feature class
        arcpy.management.Project(merged_feature_class, os.path.join(
            output_gdb, output_featureclass + "_mercator"), output_spatial_reference)

        print(
            f"Merge and reprojection for '{shapefile_substring}' completed successfully.")

        # Delete the merged feature class
        arcpy.Delete_management(merged_feature_class)

        print(f"Merged feature class for '{shapefile_substring}' deleted.")

    # Delete the extracted ZIP file
    # os.remove(os.path.join(input_directory, zip_file))

    print("Extracted ZIP file deleted.")

    # Delete the folder containing the extracted files
    shutil.rmtree(extracted_dir)

    print("Extracted folder deleted.")


# Example usage:
input_directory = r"C:\Maps\SWOT"
zip_file = "SWORD_v16_shp.zip"  # Relative path to the ZIP file
output_directory = "output"
shapefile_substrings = ["nodes", "reaches"]
output_spatial_reference = arcpy.SpatialReference(3857)
subdirectory_name = "shp"

merge_and_reproject_shapefiles(input_directory, zip_file, output_directory,
                               shapefile_substrings, output_spatial_reference, subdirectory_name)

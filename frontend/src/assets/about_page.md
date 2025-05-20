## SWOT Background

---

The [Surface Water and Ocean Topography](https://swot.jpl.nasa.gov/) (SWOT) was launched in December 2022 and completed its 1-day repeat orbit for the "fast-sampling" or "calibration" phase of the mission in early July 2023. Following this, SWOT transitioned into a 21-day repeat orbit in August 2023 to start its “science” phase, which is expected to continue through 2025 (https://swot.jpl.nasa.gov/mission/overview/).

SWOT provides a suite of <strong>hydrology</strong> data products, distributed by NASA’s Physical Oceanography Distributed Active Archive Center, [PO.DAAC](https://podaac.jpl.nasa.gov/SWOT?tab=mission-objectives&sections=about%2Bdata). The basic river hydrological attributes of the SWOT measurement include WSE (wse), water
surface slope (slope), river width (width), water surface area (area_total), change in cross-sectional area from a reference value (d_x_area), and discharge (dschg_c and dschg_g; see [SWOT River Vector Product Description](https://deotb6e7tfubr.cloudfront.net/s3-edaf5da92e0ce48fb61175c28b67e95d/podaac-ops-cumulus-docs.s3.us-west-2.amazonaws.com/web-misc/swot_mission_docs/pdd/D-56413_SWOT_Product_Description_L2_HR_RiverSP_20240913.pdf?A-userid=None&Expires=1730321287&Signature=rg4D-~S-ER9REWunw3nQQAHRSJOJq-868z3hyNRMHRFkicw0IoogsvDL72W4N1o7o7jT6svuvSlCk4jBkGX7qpStZv1FCzzckWArKsF35FTHANhstF~8pVLZpyDUkZqbZ7Msytd91M55YLZ8o4YBHzIhzy7tEzbHF3anF5p2ztelEywKV6qj9u8ChlOieEc6OrrdEywUkZ6TY02tR~-t5P9n2teBLsDUWJTI-NTPmHMM4ZpTsVaISlS36lfo82Yy36NcTwWDMhP6NwujmQuVdb0JMx5-sIhy3ZKyMzj3RFBjJFHcCFrJhXI4QCj8bexnseLIHi9wY25fREnuLhwXSg__&Key-Pair-Id=K2ECMKQ3SIJ8HS)). These variables are critical for a range of applications, including: monitoring water levels during flooding or drought events, tracking changes in reservoir storage, assessing water surface evelation across transboundary rivers, supporting river commerce with water level data along any stretch of river, and providing critical information for businesses to assess flood risk and better protect their assets.

To meet the hydrology community’s preference for time series data visualizations, the NASA PO.DAAC team released a public web service called [Hydrocron](https://podaac.github.io/hydrocron). This service repackages hydrology datasets from the SWOT shapefile format into more CSV and GeoJSON formats. Users can query the Hydrocron API by specifying a water feature ID, a time range, and their preferred data format, enabling streamlined access to SWOT data. Examples are available in the Hydrocron [tutorials](https://podaac.github.io/hydrocron/hydrocron_tutorial.html). The <strong>reach and node</strong> feature IDs in Hydrocron is based on the [SWOT River Database](https://zenodo.org/records/10013982) (SWORD), which contains 213,485 river reaches and 10.7 million nodes globally. Serving as the geofabric for hydrology products, SWORD offers extensive hydrologic and morphological attributes, making it a valuable resource for users interested in river and water feature analyses (Altenau et al., 2021, Altenau et al., 2023). The <strong>lake</strong> feature IDs in Hydrocron is based on the [Prior Lake Database](https://podaac.jpl.nasa.gov/dataset/SWOT_L2_HR_LakeSP_2.0).

The figure below presents a schematic illustration of a river reach and its associated nodes as defined by the SWOT team. The purpose of this image is to visually distinguish between different types of SWOT measurement aggregation within a river reach. Panel a and b show a **plan view**, showing how variables such as node locations, node width, and reach-averaged width are offered by SWOT measurements. Panel C, in contrast, provides a **profile view**, showing how water surface elevation varies when measured at individual node locations compared to an average value calculated for the entire reach with respect to the geoid.

<img src="https://www.hydroshare.org/resource/fd04a07eddaf44ea86730dcc271223fa/data/contents/node-vs-reach.png" width=330 height=470 alt="Nodes-vs-Reach">

## SWOT Data Viewer Application (SWOTViz)

---

<img src="https://www.hydroshare.org/resource/fd04a07eddaf44ea86730dcc271223fa/data/contents/swot-logo-v12-transparent-bkg.png" width=260 height=150 alt="SWOTVis-logo">

### Why SWOTViz was developed?

The task of discovering, collecting, and analyzing data from the existing services, mentioned above, can be both computationally intensive and necessitate complex workflows. We require intuitive approaches for working with these data in a manner that serves a broad audience of stakeholders, scientific researchers, professionals, as well as the general public. **SWOTViz** was developed as a lightweight solution for streamlining access to SWOT observations across the globe by leveraging open-source libraries and existing capabilities, with the goal of encouraging broader use and maximizing the impact of the SWOT hydrology datasets globally.

SWOTViz is an interactive web user interface featuring mapping and plotting capabilities for **retrieving, visualizing, and manipulating** SWOT data. The application provides a solution for quickly discovering and previewing SWOT observations and, subsequently, performing advanced scientific analysis in the cloud using domain-specific code and algorithms.

<div style="border-left: 5px solid #4682B4; padding: 15px; background-color: #F5F5F5; border-radius: 8px;">
    <p style="display: flex; align-items: center; font-size: 16px; font-family: Arial, sans-serif; color: #333333; margin: 0;">
        <span style="font-size: 24px; color: #4682B4; margin-right: 10px;">&#9432;</span> <!-- Info icon -->
        <strong>These include:</strong> 
    </p>
    <ul style="font-size: 15px; font-family: Arial, sans-serif; color: #333333; margin-top: 10px; padding-left: 20px;">
        <li>Exploration of hydrological parameters and their associated metadata.</li>
        <li>Analysis of temporal changes using common statistical methods.</li>
        <li>Advanced scientific analysis using cloud computing and data-sharing platforms.</li>
    </ul>
</div>

<br>

SWOTViz allows users to select their reach of interest through an interactive map interface or by searching for the reach name or reach_id (as defined in SWORD). Once a reach is selected, users can view its metadata, including information on reach length, average water surface elevation, width, slope, upstream and downstream reach IDs, and more, all sourced from SWORD. Below is an example of metadata for a reach along the Maroni River in South America, highlighted with the dashed red circle.

<img src="https://www.hydroshare.org/resource/fd04a07eddaf44ea86730dcc271223fa/data/contents/sword-metadata.png" width=700 height=350 alt="SWORD-Metadata">

### What types of plots does SWOTViz provide?

<div style="display: flex; gap: 20px; align-items: stretch;">

  <!-- Left Column Box -->
  <div style="flex: 1; background-color: #C4D8E2; padding: 20px; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; max-width: 400px;">
    <h3>Timeseries Plots</h3>
    <img src="https://www.hydroshare.org/resource/fd04a07eddaf44ea86730dcc271223fa/data/contents/timeseries.png" alt="Thumbnail" style="width: 100%; max-width: 300px; height: 200px; object-fit: cover;">
    <p style="flex-grow: 1; margin-top: 15px;">This type of plot can effectively show changes in a variable of interest (e.g., water surface elevation) across one or more reaches over a specified period, helping in the understanding of temporal changes in river dynamics, such as seasonal variations, impacts of climate events, or human activities. Typically, the values represent 1-D averages across the reach.</p>
  </div>

  <!-- Right Column Box -->
  <div style="flex: 1; background-color: #AFEEEE; padding: 20px; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; max-width: 400px;">
    <h3>Longitudinal Profile Plots</h3>
    <img src="https://www.hydroshare.org/resource/fd04a07eddaf44ea86730dcc271223fa/data/contents/distance.png" alt="Thumbnail" style="width: 100%; max-width: 300px; height: 200px; object-fit: cover;">
    <p style="flex-grow: 1; margin-top: 15px;">The longitudinal profile helps in understanding variations in a variable of interest (e.g., water surface elevation) along the river reach, which is essential for studying river hydraulics, sediment transport, flood levels, and more.</p>
  </div>

</div>
 
 <br>

- Reach-averaged water surface elevation vs. time: This plot can help in understanding temporal changes in river dynamics.
- Reach-averaged width vs. time: This plot helps tracking temporal changes in a river's width, which reflects natural and anthropogenic impacts on local and upstream/downstream hydraulic and hydrologic processes. Moreover, these plots may offer an opportunity to study biogeochemical exchange and geomorphologic evolution (Feng et al., 2022).
- Reach-averaged slope vs. time: This plot helps in identifying steep and flat sections of the river, which is important for understanding flow velocity and sediment transport.
- Water surface elevation vs. distance: This plot shows the water surface elevation along the length of the river. This helps in understanding the gradient and potential energy changes along the river, which is important for stydying river hydraulics and sediment transport.
- Width vs. distance: This plot shows the width of the river at each node along the length of the river. This is ideal for studying river morphology or identifying areas prone to changes in width.
- Width-Elevation relationship plot: This is usually a scatter plot of river width against water surface elevation at different nodes along the river. This plot can help in identifying relationships between these two attributes, which is important for floodplain management and habitat analysis.

### Which variables are used for plots in SWOTViz?

The table below summarizes the variables and attributes currently available for visualization in the SWOTViz. These were sourced from the SWOT [Level 2 river single-pass vector data product description document](https://deotb6e7tfubr.cloudfront.net/s3-edaf5da92e0ce48fb61175c28b67e95d/podaac-ops-cumulus-docs.s3.us-west-2.amazonaws.com/web-misc/swot_mission_docs/pdd/D-56413_SWOT_Product_Description_L2_HR_RiverSP_20240913.pdf?A-userid=None&Expires=1730321287&Signature=rg4D-~S-ER9REWunw3nQQAHRSJOJq-868z3hyNRMHRFkicw0IoogsvDL72W4N1o7o7jT6svuvSlCk4jBkGX7qpStZv1FCzzckWArKsF35FTHANhstF~8pVLZpyDUkZqbZ7Msytd91M55YLZ8o4YBHzIhzy7tEzbHF3anF5p2ztelEywKV6qj9u8ChlOieEc6OrrdEywUkZ6TY02tR~-t5P9n2teBLsDUWJTI-NTPmHMM4ZpTsVaISlS36lfo82Yy36NcTwWDMhP6NwujmQuVdb0JMx5-sIhy3ZKyMzj3RFBjJFHcCFrJhXI4QCj8bexnseLIHi9wY25fREnuLhwXSg__&Key-Pair-Id=K2ECMKQ3SIJ8HS). Future updates of this table will include the lake products sourced from the SWOT [Level 2 lake single-pass vector data product description document](https://deotb6e7tfubr.cloudfront.net/s3-edaf5da92e0ce48fb61175c28b67e95d/podaac-ops-cumulus-docs.s3.us-west-2.amazonaws.com/web-misc/swot_mission_docs/pdd/SWOT-TN-CDM-0673-CNES_Product_Description_L2_HR_LakeSP_20240906_DraftRevC_clean.pdf?A-userid=None&Expires=1730325573&Signature=B9EUUEPcVRE0lRLHErbXWDZBYbJG3lQOO2glhd3kaqsjdyUfAeMbZNFWSmDnndfUmhUGDDtxcFa3L2SjENSw3peAV8V6iLfVWfnuvG4ADszCzPKLo-FMviL8HSc2vwdCrDaXyVe-ddm0T3NW6O8D2UoBNgQm6j5kkGu5wngsBFn9S9kCmpy6tEidkLVXGnf7NRztzE~tlkqQM65dIb8QQ1nKrD~dreBT4PBzME4zBNTmUNmJEgCLYIiZ~KH5nJ-X-gPZUtgaO6QhqIMWWi-CES9buYbPPJGzKAWVvta9YP5C5Eu9b8UnxUVvobVXQyzclXp3w~5EQzZBCQE7xS0xjA__&Key-Pair-Id=K2ECMKQ3SIJ8HS). Note that some variables have the same code for both reach and node levels. For these variables, we combined both in a single row to avoid repetition and explained the differences in the description column.

| Aggregation Level | Variable Code      | Variable Long Name                                 | Description                                                                                                                                                                                                                                                                                                                                                                                   | Unit |
| ----------------- | ------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| Reach             | _reach_id_         | Reach ID with which node is associated             | Unique reach identifier from the SWORD (prior river database). The format of the identifier is CBBBBBRRRRT, where C=continent, B=basin, R=reach, T=type.                                                                                                                                                                                                                                      |
| Reach             | _slope_            | Water Surface slope with respect to the geoid      | Fitted water surface slope relative to the geoid, and with the same corrections and geophysical fields applied as wse. The units are m/m. The upstream or downstream direction is defined by the prior river database. A positive slope means that the downstream WSE is lower                                                                                                                | m/m  |
| Reach/Node        | _width_            | Reach/Node width                                   | At the reach level, it is given as an average width across the entire reach. At the node level, it provides the width measured specifically at each individual node location.                                                                                                                                                                                                                 | m    |
| Reach/Node        | _wse_              | Water surface elevation, with respect to geoid     | Fitted reach/node water surface elevation, relative to the provided model of the geoid (geoid_hght), with all corrections for media delays (wet and dry troposphere, and ionosphere), crossover correction, and tidal effects (solid_tide, load_tidef, and pole_tide) applied.                                                                                                                | m    |
| Reach/Node        | _area_total_       | Total water surface area including dark water      | At the reach level, it provides the overall surface area for the entire reach, including dark water that may not have been directly detected as water in the SWOT observation but was identified using a prior water likelihood map. At the node level, it provides the estimated surface area around each individual node, with similar inclusion of dark water based on the likelihood map. | m    |
| Reach/Node        | _reach_q_/_node_q_ | Summary quality indicator for the reach or node    | Summary quality indicator for the reach measurement. A value of 0 indicates a nominal measurement, 1 indicates a suspect measurement, 2 indicates a degraded measurement, and 3 indicates a bad measurement.                                                                                                                                                                                  |
| Reach/Node        | _p_dist_out_       | Distance from the reach or each node to the outlet | Along-stream distance to the outlet. If measured at the reach level, it indicates the distance from the center of the reach to the outlet. If measured at the node level, it indicates the distance from each individual node to the outlet. Data is sourced from SWORD.                                                                                                                      | m    |
| Node              | _node_id_          | Node ID of the node in the SWORD                   | Unique node identifier from the SWORD. The format of the identifier is CBBBBBRRRRNNNT, where C=continent, B=basin, R=reach, N=node, T=type.                                                                                                                                                                                                                                                   |

### What does data quality mean?

All plots generated by SWOTViz include all measurements by default. However, users have the flexibility to filter the types of measurements they wish to display on the plots, allowing them to toggle different data quality levels on or off. A value of 0 indicates a nominal (good) measurement, 1 indicates a suspect measurement, 2 indicates a degraded measurement, and 3 indicates a bad measurement.

## Scientific Use-Case Examples

---

Jupyter Notebook examples will be added soon!

## SWOTViz Project Team

---

<div style="display: flex; flex-wrap: wrap; justify-content: space-between;">

<div style="flex: 1 10%; padding: 5px; margin: 5px; border: solid 1px lightgray;">
  <h4>Anthony Castronova</h4>
  <img src="https://www.cuahsi.org/uploads/team/img/_headshot/TCastronova.jpg" alt="Anthony Castronova" style="width: 120px; height: auto;">
  <h3 style="color: gray; font-size: 18px;">Senior Research Hydrologist</h3>
  <h3 style="color: gray; font-size: 14px;">CUAHSI</h3>
  <h3 style="color: skyblue; font-size: 15px;">acastronova@cuahsi.org</h3> 
</div>

<div style="flex: 1 10%; padding: 5px; margin: 5px; border: solid 1px lightgray;">
  <h4>Devin Cowan</h4>   
  <img src="https://www.cuahsi.org/uploads/team/img/_headshot/Devin-Cowan.jpg" alt="Devin Cowan" style="width: 120px; height: auto;">
  <h3 style="color: gray; font-size: 18px;">Research Programmer</h3>
  <h3 style="color: gray; font-size: 14px;">CUAHSI</h3>
  <h34 style="color: skyblue; font-size: 15px;">dcowan@cuahsi.org</h3>
</div>

</div>

<div style="display: flex; flex-wrap: wrap; justify-content: space-between;">

<div style="flex: 1 10%; padding: 5px; margin: 5px; border: solid 1px lightgray;">
  <h4>Irene Garousi-Nejad</h4> 
  <img src="https://www.cuahsi.org/uploads/team/img/_headshot/Irene_headshot03.jpg" alt="Irene Garousi-Nejad" style="width: 120px; height: auto;">
  <h3 style="color: gray; font-size: 18px;">Research Scientist</h3>
  <h3 style="color: gray; font-size: 14px;">CUAHSI</h3>
  <h3 style="color: skyblue; font-size: 15px;">igarousi@cuahsi.org</h3>
</div>

<div style="flex: 1 10%; padding: 5px; margin: 5px; border: solid 1px lightgray;">
  <h4>Martin Seul</h4>
  <img src="https://www.cuahsi.org/uploads/team/img/_headshot/Martin.jpg" alt="Martin Seul" style="width: 120px; height: auto;">
  <h3 style="color: gray; font-size: 18px;">Technical Director</h3>
  <h3 style="color: gray; font-size: 14px;">CUAHSI</h3>
  <h3 style="color: skyblue; font-size: 15px;">mseul@cuahsi.org</h3>
</div>

</div>

<div style="display: flex; flex-wrap: wrap; justify-content: space-between;">

<div style="flex: 1 10%; padding: 5px; margin: 5px; border: solid 1px lightgray;">
  <h4>Michael Durand</h4> 
  <img src="https://earthsciences.osu.edu/sites/default/files/styles/people_profile_image/public/pictures/2024-01/durand_photo_2.jpg?h=29a016df&itok=vzT0pXTJ" alt="Michael Durand" style="width: 120px; height: auto;">
  <h3 style="color: gray; font-size: 18px;">Professor</h3>
  <h3 style="color: gray; font-size: 14px;">Ohio State University</h3>
  <h3 style="color: skyblue; font-size: 15px;">durand.8@osu.edu</h3>
</div>

<div style="flex: 1 10%; padding: 5px; margin: 5px; border: solid 1px lightgray;">
  <h4>Bidhyananda Yadav</h4>
  <img src="https://byrd.osu.edu/sites/default/files/styles/people_profile_image/public/pictures/2021-05/bidhya-yadav.jpg?h=c78a7939&itok=FBsU4kiQ" alt="Bidhyananda Yadav" style="width: 120px; height: auto;">
  <h3 style="color: gray; font-size: 18px;">Research Associate</h3>
  <h3 style="color: gray; font-size: 14px;">Ohio State University</h3>
  <h3 style="color: skyblue; font-size: 15px;">yadav.111@osu.edu</h3>
</div>

</div>

## Other Useful Resources

---

### Tutorials

- [Hydrocron Tutorial](https://podaac.github.io/hydrocron/hydrocron_tutorial.html)
- [PO.DAAC Cookbook](https://podaac.github.io/tutorials/)
- [SWOT Hydrology Data Tutorials](https://swot-community.github.io/SWOT-galleries/hydrology/hydrology.html)

### Product links

- [SWOT River Database](https://www.swordexplorer.com/)
- [SWOT Prior Lake Database](https://hydroweb.next.theia-land.fr/)
- [PO.DAAC SWOT River Vector Data](https://podaac.jpl.nasa.gov/dataset/SWOT_L2_HR_RiverSP_2.0)
- [PO.DAAC SWOT Lake Vector Data](https://podaac.jpl.nasa.gov/dataset/SWOT_L2_HR_LakeSP_2.0)

### Product description

- [SWOT Data User Handbook](https://deotb6e7tfubr.cloudfront.net/s3-edaf5da92e0ce48fb61175c28b67e95d/podaac-ops-cumulus-docs.s3.us-west-2.amazonaws.com/web-misc/swot_mission_docs/D-109532_SWOT_UserHandbook_20240502.pdf?A-userid=None&Expires=1730307449&Signature=SMCPbqRjyqAMoNbzj-jjErP3ZXJ24v~-aGibyR2RGG~MfTtpRJ6pXWN8SXMOIPNwg-9It1l5cYDIqAFX6bJVahuBx3gSH4pBY7IU1Zbt5Rd4krHhli9WY0uoY5XNvwVAHSkoWcs1KaFjd6Gz8J6d-UvCTXE~erzOAe~57PqNO6RAb2E2BTN1DqObRyBPr1QQs9-Pqhg5FnEPdFvEWvuof52mal4JiVkJgJBhwcJx27oVUeSQ46Pz~ApTcPNKM6TDukkS7BPMv2s1wninqqhBvSvmn1Ja5TT-Y07n5YFFnDnk60OEiB9Qmf39iUXcaTG~bKxJ2MwLPWcAxt076VOsbQ__&Key-Pair-Id=K2ECMKQ3SIJ8HS)
- [SWOT Level 2 **Lake** Single-Pass Vector Data Product, Version C](https://deotb6e7tfubr.cloudfront.net/s3-edaf5da92e0ce48fb61175c28b67e95d/podaac-ops-cumulus-docs.s3.us-west-2.amazonaws.com/web-misc/swot_mission_docs/pdd/SWOT-TN-CDM-0673-CNES_Product_Description_L2_HR_LakeSP_20240906_DraftRevC_clean.pdf?A-userid=None&Expires=1730325573&Signature=B9EUUEPcVRE0lRLHErbXWDZBYbJG3lQOO2glhd3kaqsjdyUfAeMbZNFWSmDnndfUmhUGDDtxcFa3L2SjENSw3peAV8V6iLfVWfnuvG4ADszCzPKLo-FMviL8HSc2vwdCrDaXyVe-ddm0T3NW6O8D2UoBNgQm6j5kkGu5wngsBFn9S9kCmpy6tEidkLVXGnf7NRztzE~tlkqQM65dIb8QQ1nKrD~dreBT4PBzME4zBNTmUNmJEgCLYIiZ~KH5nJ-X-gPZUtgaO6QhqIMWWi-CES9buYbPPJGzKAWVvta9YP5C5Eu9b8UnxUVvobVXQyzclXp3w~5EQzZBCQE7xS0xjA__&Key-Pair-Id=K2ECMKQ3SIJ8HS)
- [SWOT Level 2 **River** Single-Pass Vector Data Product, Version C](https://deotb6e7tfubr.cloudfront.net/s3-edaf5da92e0ce48fb61175c28b67e95d/podaac-ops-cumulus-docs.s3.us-west-2.amazonaws.com/web-misc/swot_mission_docs/pdd/D-56413_SWOT_Product_Description_L2_HR_RiverSP_20240913.pdf?A-userid=None&Expires=1730321287&Signature=rg4D-~S-ER9REWunw3nQQAHRSJOJq-868z3hyNRMHRFkicw0IoogsvDL72W4N1o7o7jT6svuvSlCk4jBkGX7qpStZv1FCzzckWArKsF35FTHANhstF~8pVLZpyDUkZqbZ7Msytd91M55YLZ8o4YBHzIhzy7tEzbHF3anF5p2ztelEywKV6qj9u8ChlOieEc6OrrdEywUkZ6TY02tR~-t5P9n2teBLsDUWJTI-NTPmHMM4ZpTsVaISlS36lfo82Yy36NcTwWDMhP6NwujmQuVdb0JMx5-sIhy3ZKyMzj3RFBjJFHcCFrJhXI4QCj8bexnseLIHi9wY25fREnuLhwXSg__&Key-Pair-Id=K2ECMKQ3SIJ8HS)

## SWOT Partners

---

<div style="display: flex; align-items: center;">

<div style="flex: 1;">
<p>SWOT is being jointly developed by NASA and <a href="https://cnes.fr/projets/swot">Centre National D'Etudes Spatiales</a> (CNES) with contributions from the <a href="https://www.asc-csa.gc.ca/eng/">Canadian Space Agency</a> (CSA) and <a href="https://www.gov.uk/government/organisations/uk-space-agency">United Kingdom Space Agency</a>.</p>
</div>

<div style="flex: 1; text-align: right;">
<img src="https://www.hydroshare.org/resource/fd04a07eddaf44ea86730dcc271223fa/data/contents/swot_partners_logo.jpg" width="150" height="140" alt="SWOT-Partners">
</div>

</div>

## Acknowledgements

---

The research was carried out in part at the Jet Propulsion Laboratory, California Institute of Technology, under a contract with the National Aeronautics and Space Administration (80NM0018D0004).

## SWOT Data and SWOTViz Tool Citation Policy

---

SWOT Data hosted by the PO.DAAC is openly shared, without restriction, in accordance with NASA's Earth Science program Data and Information Policy. Please refer to the PO.DAAC [Data Use and Citation Policy](https://podaac.jpl.nasa.gov/CitingPODAAC).

SWOTViz is licensed under the GNU General Public License v3.0. This license allows users to freely use, modify, and distribute the software as long as they credit the original authors, share any modifications under the same license, and provide access to the source code. There are no warranties, and modifications must be clearly marked.

## References

---

- Altenau, E. H., Pavelsky, T. M., Durand, M. T., Yang, X., Frasson, R. P. d. M., & Bendezu, L. (2021). The surface water and ocean topography (SWOT) mission river database (SWORD): A global river network for satellite data products. Water Resources Research, 57, e2021WR030054. https://doi.org/10.1029/2021WR030054
- Altenau, E. H., Pavelsky, T. M., Durand, M., T., Yang, X., Frasson, R. P. d. M., & Bendezu, L. (2023). SWOT River Database (SWORD) (Version v16) [Data set]. Zenodo. https://doi.org/10.5281/zenodo.10013982
- Feng D, Gleason CJ, Yang X, Allen GH, Pavelsky TM. How Have Global River Widths Changed Over Time? Water Resour Res. 2022 Aug;58(8):e2021WR031712. doi: 10.1029/2021WR031712. Epub 2022 Aug 22. PMID: 36249279; PMCID: PMC9541693.
- JPL D-105505, 2023. “SWOT Algorithm Theoretical Basis Document: Level 2 KaRIn High Rate River Single Pass (L2_HR_RiverSP) Science Algorithm Software,” Jet Propulsion Laboratory Internal Document.
- Yamazaki, D., Ikeshima, D., Sosa, J., Bates, P. D., Allen, G., & Pavelsky, T. (2019). MERIT Hydro: A high-resolution global hydrography map based on latest topography datasets. Water Resources Research. https://doi.org/10.1029/2019WR024873.

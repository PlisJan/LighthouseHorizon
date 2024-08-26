# Lighthouse Horizon

This is a small project visualizing the position of lighthouses from a given position at the horion.

## Thanks

> Thanks to Segelschule WELL SAILING for their great [document](http://www.well-sailing.de/fileadmin/dateien-richard/SBF-See/scriptsbfleuchtf.PDF) of different light types.

> Also thanks to [openseamap.org](https://www.openseamap.org) for the lighthouse data they collected.

> And thanks to [overpass-turbo.eu](https://overpass-turbo.eu/) for their great tool to fetch OSM data

## Getting the Lighthouse data

Use this [Link](<https://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%3B%0A(%0A%20%20%0A%20%20node%5B%22seamark%3Atype%22~%22light_float%7Clight_vessel%7Cminor_light%7Cmajor_light%7Clight%22%5D(%7B%7Bbbox%7D%7D)%3B%3E%3B%0A%20%20way%5B%22seamark%3Atype%22~%22light_float%7Clight_vessel%7Cminor_light%7Cmajor_light%7Clight%22%5D(%7B%7Bbbox%7D%7D)%3B%3E%3B%0A)%3B%0Aout%3B&C=54.25881;12.63153;8&R>) to fetch the GeoJson data using [overpass-turbo](https://overpass-turbo.eu/)

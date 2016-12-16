#!/bin/bash

# NoSQL Project Master BigData 2016
# Steven Golovkine
# Download the databases

curl https://data.cityofnewyork.us/api/views/9mhd-na2n/rows.csv?accessType=DOWNLOAD > population.csv
curl https://data.cityofnewyork.us/api/views/5uac-w243/rows.csv?accessType=DOWNLOAD > crime2016.csv
curl https://data.cityofnewyork.us/api/views/qgea-i56i/rows.csv?accessType=DOWNLOAD > crimeHistoric.csv
curl https://data.cityofnewyork.us/api/views/jd4g-ks2z/rows.csv?accessType=DOWNLOAD > wifi.csv
#!/bin/bash

# NoSQL Project Master BigData 2016
# Steven Golovkine
# Load the databases

pop=$(locate population.csv)
crime2016=$(locate crime2016.csv)
crimeHistoric=$(locate crimeHistoric.csv)
wifi=$(locate wifi.csv)

awk '{print toupper($0);}' $pop > $(echo $pop | sed 's/population.csv//')/pop.csv 

sed 's/SI/STATEN ISLAND/g' $wifi | sed 's/BK/BROOKLYN/g' | sed 's/MN/MANHATTAN/g' | sed 's/BX/BRONX/g' | sed 's/QU/QUEENS/g' | sed 's/QN/QUEENS/g' > $(echo $wifi | sed 's/wifi.csv//')/wif.csv 

mongoimport -d Test -c Population --type csv --file $(echo $pop | sed 's/population.csv//')/pop.csv --headerline
mongoimport -d Test -c Crimes --type csv --file $crime2016 --headerline
mongoimport -d Test -c Crimes --type csv --file $crimeHistoric --headerline
mongoimport -d Test -c Wifi --type csv --file $(echo $wifi | sed 's/wifi.csv//')/wif.csv  --headerline
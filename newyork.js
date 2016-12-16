//NoSQL Project Master BigData 2016
// Steven Golovkine
// Process, query and display the data

// The name of the MongoDB database which is used
use Test;

// Count all the crimes by borough and create the collection Borough
db.Crimes.aggregate([
    { $group: { _id : "$BORO_NM", Total_Crimes : { $sum: 1 } } },
    { $out: "Borough" }
]);

// Count all the ccrimes by precinct and by borough
var precinctCrime = db.Crimes.aggregate([
    { $group: { _id : {Borough: "$BORO_NM", Precinct: "$ADDR_PCT_CD"} , Total_Crimes: {$sum: 1} } }
]);

// Add the precinct to the Borough collection
precinctCrime.forEach(function (x) {
    db.Borough.update(
                    {_id: x._id.Borough},
                    {$addToSet: 
                        {
                            Precinct: {Number: x._id.Precinct, Crime: x.Total_Crimes}       
                         }
                     }
               );
});

// Find the number of habitants in each borough in 2010
var pop_borough = db.Population.find({}, {"BOROUGH":1, "2010 POPULATION":1, _id:0});

// Add the population number in the Borough collection
pop_borough.forEach(
            function (x){
                db.Borough.update(
                    {_id: x.BOROUGH},
                    {$set: {Total_Population: x["2010 POPULATION"]}}
               );
            }
        );

// Count the number of hotspots in each borough
var hotspotNumber = db.Wifi.aggregate([
    { $group: { _id : "$BORO", Hotspot_Number: {$sum: 1} } }
]);
    
// Add the number of hotspots in each borough in the Borough collection
hotspotNumber.forEach(function (x) {
    db.Borough.update(
                    {_id: x._id},
                    {$set: {Hotspot_Number: x.Hotspot_Number} }
               );
});

// Remove from the Borough collection the null id
db.getCollection('Borough').remove( { _id: "" } )

// Convert some data into integer
db.getCollection('Borough').find({}).forEach(
    function(obj) {
        obj.Total_Crimes = new NumberInt(obj.Total_Crimes);
        obj.Total_Population = new NumberInt(obj.Total_Population);
        
        for (var i = 0; i < obj.Precinct.length; i++) {
                obj.Precinct[i].Crime = new NumberInt(obj.Precinct[i].Crime);
        }
        
        db.Borough.save(obj);
    });
    
// Display the borough with the lowest crime rate
db.getCollection('Borough').aggregate([
    { $project: {_id: 1, crime_rate: {$divide: ["$Total_Crimes", "$Total_Population"] } } },
    { $sort: { "crime_rate" : 1 } },
    { $limit: 1 }
]).forEach(
    function (obj){
        print("The borough with the lowest crime rate is", obj._id, ". The crime rate is", obj.crime_rate, ".");
    }
);

// Display the precinct in the Queens which have the lowerst number of crime
db.getCollection('Borough').find({_id: "QUEENS"}).forEach(
    function (obj) {
        var crime = 100000;
        var number = 0;
        for (var i = 0; i < obj.Precinct.length; i++) {
            if (crime > obj.Precinct[i].Crime) {
                crime = obj.Precinct[i].Crime
                number = obj.Precinct[i].Number
            }    
        }
        print("In the Queens, the precinct with the lowest number of crime is the precinct", number, "with", crime, "crimes.");
    }
);

// Display the number of hotspots in every borough
db.getCollection('Borough').aggregate([
    { $project: {_id: 1, Hotspot_Number: 1} },
    { $sort: { "Hotspot_Number" : -1 } },
]).forEach(
    function (obj){
        print("The borough", obj._id, "has", obj.Hotspot_Number, "free hotspot Wi-fi.");
    }
);

// Display the hotspots in the 100th precinct by type.
var hotspot = db.getCollection('Wifi').aggregate( [
    {
        $match: {
                 $or: [
                        { $and: [{ "LAT": {$gt: 40.542504} }, { "LAT": {$lt: 40.576413} }, { "LON": {$gt: -73.940418} }, { "LON": {$lt: -73.842915} }] },
                        { $and: [{ "LAT": {$gt: 40.555287} }, { "LAT": {$lt: 40.599486} }, { "LON": {$gt: -73.8738} }, { "LON": {$lt: -73.766512} }] }
                 ]
        }
    },
    {
        $group: {_id: "$TYPE", count: {$sum: 1}}
    }
]).toArray(); 
    
print("There are", (hotspot[0].count + hotspot[1].count), "hotspot Wi-fi in the 100th precinct but there are only", hotspot[1].count, "which are really free.");


// Display the location of the free hotspots in the 100th precinct
var hotspot_location = db.getCollection('Wifi').aggregate( [
    {
        $match: {
                 $or: [
                        { $and: [{ "LAT": {$gt: 40.542504} }, { "LAT": {$lt: 40.576413} }, { "LON": {$gt: -73.940418} }, { "LON": {$lt: -73.842915} }, {"TYPE": "Free"}] },
                        { $and: [{ "LAT": {$gt: 40.555287} }, { "LAT": {$lt: 40.599486} }, { "LON": {$gt: -73.8738} }, { "LON": {$lt: -73.766512} }, {"TYPE": "Free"}] }
                 ]
        }
    }
]).toArray();   
    
for (var i = 0; i < hotspot_location.length; i++){
    print("The location of the hotspot number", (i+1), "is", hotspot_location[i].LOCATION, ".")
};

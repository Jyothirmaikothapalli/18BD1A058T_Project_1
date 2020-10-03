
var express=require("express");
var app=express();

let server =require('./server');
let middleware=require('./middleware');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


//BASIC PAGE
app.get('/',function(req,res){
   res.send("Information of  hospital and ventilaors status");

});


//CONNECTING TO DATABASE
const MongoClient=require('mongodb').MongoClient;
const url='mongodb://127.0.0.1:27017';
const dbName='hospitalInventory';
let db
MongoClient.connect(url, (err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
})


//READ HOSPITAL DETAILS
app.get('/hospitaldetails',middleware.checkToken,(req,res) => {
    console.log("Fetching data from hospital collection");
    var data =db.collection('hospital').find().toArray().
    then(result => res.json(result));
    
})

//READ VENTILATOR DETAILS
app.get('/ventilatordetails',middleware.checkToken,(req,res) => {
    console.log("Fetching data from ventilator collection");
    var data =db.collection('ventilator').find().toArray().
    then(result => res.json(result));
});


//SEARCH VENTILATOR BY STATUS
app.post('/ventilatorbystatus',middleware.checkToken,(req,res) => {
    var status = req.body.status;
    console.log("searching by status");
    var query ={"status" : status}
    var data =db.collection('ventilator').find(query).toArray().
    then(result => res.json(result));
});


//SEARCH HOSPITAL BY NAME
app.post('/hospitalbyname',middleware.checkToken,(req,res) => {
    var name =req.body.name;
    var query={"name" : new RegExp(name,'i')};
    var data =db.collection('hospital').find(query).toArray().
    then(result => res.json(result));
});


//SEARCH VENTILATOR BY HOSPITAL NAME
app.post('/ventilatorbyhospital',middleware.checkToken,(req,res) => {
    var name = req.query.name;
    console.log("Searching by hospital name ");
    var query1={"name":new RegExp(name,'i')};
    var data =db.collection('ventilator').find(query1).toArray().
    then(result => res.json(result));
});

//UPDATE VENTILATOR
app.put('/updateventilator',middleware.checkToken, (req,res) => {
    console.log("updating the ventilator");
    var ventid ={ventilaorId: req.body.ventilatorId};
    var query={$set: {status:req.body.status} };
    db.collection('ventilator').updateOne(ventid,query, function(err,result) {
        res.json('1 document updated');
        if (err) throw err;
    });
});


//ADDING A VENTILATOR
app.post('/addventilator',middleware.checkToken, (req,res) => {
    var hId=req.body.hId;
    var ventilatorId=req.body.ventilatorId;
    var status=req.body.status;
    var name=req.body.name;
    var query={
        hId:hId,ventilatorId:ventilatorId, status:status, name:name
    };
    db.collection('ventilator').insertOne(query, function(err,result) {
        res.json('1 document inserted');
        if (err) throw err;
});
});


//DELETE THE VENTILATOR
app.post('/deleteventilator',middleware.checkToken, (req,res) => {
    console.log("deleting")
    var ventilatorId=req.query.ventilatorId;
    var query1={ "ventilatorId":ventilatorId };
    db.collection('ventilator').deleteOne(query1, function(err,result) {
        res.json('1 document deleted');
        if (err) throw err;
});
});

app.listen(1100);

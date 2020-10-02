
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
    console.log(status);
    var data =db.collection('ventilator').find({"status" : status}).toArray().
    then(result => res.json(result));
});


//SEARCH HOSPITAL BY NAME
app.post('/hospitalbyname',middleware.checkToken,(req,res) => {
    var name =req.body.name;
    var data =db.collection('hospital').find({"name" : new RegExp(name,'i')}).toArray().
    then(result => res.json(result));
});


//SEARCH VENTILATOR BY HOSPITAL NAME
app.post('/ventilatorbyhospital',middleware.checkToken,(req,res) => {
    var name = req.query.name;
    console.log(name);
    var data =db.collection('ventilator').find({"name":new RegExp(name,'i')}).toArray().
    then(result => res.json(result));
});

//UPDATE VENTILATOR
app.put('/updateventilator',middleware.checkToken, (req,res) => {
    var ventid ={ventilaorId: req.body.ventilatorId};
    console.log(ventid);
    var newvalues={$set: {status:req.body.status} };
    db.collection('ventilator').updateOne(ventid,newvalues, function(err,result) {
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
    var item={
        hId:hId,ventilatorId:ventilatorId, status:status, name:name
    };
    db.collection('ventilator').insertOne(item, function(err,result) {
        res.json('1 document inserted');
        if (err) throw err;
});
});


//DELETE THE VENTILATOR
app.post('/deleteventilator',middleware.checkToken, (req,res) => {
    var hId=req.body.hId;
    var ventilatorId=req.body.ventilatorId;
    var status=req.body.status;
    var name=req.body.name;
    var item={
        hId:hId,ventilatorId:ventilatorId, status:status, name:name
    };
    db.collection('ventilator').insertOne(item, function(err,result) {
        res.json('1 document deleted');
        if (err) throw err;
});
});

app.listen(1100);


let express = require('express');
let app = express();
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const dotenv = require('dotenv');
dotenv.config();
let port = process.env.PORT ||1230;
const mongourl = "mongodb+srv://pradeepgoud:WhA7fwepxC7zOoDk@cluster0.tojfe.mongodb.net/hotstar?retryWrites=true&w=majority";
const bodyParser = require('body-parser');
const cors = require('cors');

// middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());


app.get("/",(req,res) =>{
    res.send("welcome to express");
})

app.get('/location',(req,res)=>{
       db.collection('location').find().toArray((err,result)=>{
           if(err) throw err;
           res.send(result);
       })
})

//
app.get('/mealtype',(req,res)=>{
    db.collection('mealtype').find().toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    })
})
//
app.get('/restaurants/',(req,res)=>{
    let query = {}
     let stateid = Number(req.query.state_id);
     let meal_id = Number(req.query.meal_id);
     if(stateid){
         query = {state_id:stateid};
     }
     else if(meal_id){
         query = {'mealTypes.mealtype_id':meal_id }
     }
    db.collection('restaurantdata').find(query).toArray((err,result)=>{
        if(err) throw err;
        res.send(result);
    })
})
//
app.get('/filters/:mealid',(req,res)=>{
    
    let sort =  {cost:1}
    let mealid = Number(req.params.mealid)
   let cuisineid = Number(req.query.cuisineid)
    let lcost = Number(req.query.lcost)
    let hcost = Number(req.query.hcost)
   
       let query ={}
    if(req.query.sort){
        sort = {cost:Number(req.query.sort)}
    }
    if(cuisineid){
           query = {
               "mealTypes.mealtype_id":mealid,
               "cuisines.cuisine_id":cuisineid
           
    }
   }
    else if(lcost&&hcost){
          query = {
           "mealTypes.mealtype_id":mealid,
           $and:[{cost:{$gt:lcost,$lt:hcost}}]

          }
    }
    else{
        query = {
           "mealTypes.mealtype_id":mealid
        }
    }
   db.collection('restaurantdata').find(query).sort(sort).toArray((err,result)=>{
       if(err) throw err;
       res.send(result);
   })
})
//
app.get('/details/:id',(req,res)=>{
        let restid = mongo.ObjectId(req.params.id)
        db.collection('restaurantdata').find({_id:restid}).toArray((err,result)=>{
            if(err) throw err;
            res.send(result);
        })


})
//menu
app.get('/menu',(req,res) => {
    let query = {}
    let restId = Number(req.query.restId)
    if(restId){
        query = {restaurant_id:restId}
    }
    db.collection('restaurantmenu').find(query).toArray((err,result) => {
        if(err) throw err;
        res.send(result)
    })
})
//menu item
app.post('/menuitem/',(req,res)=>{
       if(Array.isArray(req.body)){
           db.collection('restaurantmenu').find({menu_id:{$in:req.body}}).toArray((err,result)=>{
               if(err) throw err;
               res.send(result);
           })
       }
       else{
           res.send('Invalid input')
       }
})
//place order
app.post('/placeorder/',(req,res)=>{
    db.collection('orders').insert(req.body,(err,result)=>{
        if(err) throw err;
        res.send("order placed")
    })
})
// view order
app.get('/vieworders/',(req,res)=>{
       db.collection('orders').find().toArray((err,result)=>{
           if(err) throw err;
           res.send(result);
       })
})

// delete orders
app.delete('/deleteorders',(req,res)=>{
    db.collection('orders').remove({},(err,result)=>{
        if(err) throw err;
        res.send('deleted')
    })
})
//update
app.put('/updateorders/:id',(req,res)=>{
    let oid = mongo.ObjectId(req.params.id);
    db.collection('orders').updateOne(
        {_id:oid},
        
            {$set:{
                "status":req.body.status,
                "bankname":req.body.bankname,
                "date": req.body.date
            }
        },(err,result)=>{
            if(err) throw err;
            res.send(`order updates to ${req.body.status}`)
        }
    )
})


// mongodb 
MongoClient.connect(mongourl,(err,client)=>{
    if(err) console.log("error while connecting");
      db = client.db('foodzone');
      app.listen(process.env.PORT || 5000,()=>{
          console.log(`server is running on port ${port}` )
      })

})

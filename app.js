const express = require('express');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}))

mongoose.set('strictQuery', false);
// Setting Up connection
mongoose.connect('mongodb://localhost:27017/stockDB' , {useNewUrlParser: true}).then(()=>{
    console.log("Mongo Connected");
}).catch(err=>{
    console.log("OH error");
    console.log(err);
});

const itemSchema = new mongoose.Schema({
    item: String,
    purchasePrice: Number,
    sellingPrice: Number,
    category: String,
    quantity: Number
})


const Item = mongoose.model("Item", itemSchema);

app.get("/", (req,res)=>{
    res.render("home");
})
app.get("/items", (req,res)=>{
    Item.find({item: {$ne: null}}, (err,foundItems)=>{
        if(err){
            console.log(err);
        }else{
            if(foundItems){
                res.render("items", {items: foundItems});
            }
        }
    });
})
app.get("/add-item", (req,res)=>{
    res.render("add-item");
})
app.get("/stock", (req,res)=>{
    Item.find({item: {$ne: null}}, (err,foundItems)=>{
        if(err){
            console.log(err);
        }else{
            if(foundItems){
                res.render("stock", {items: foundItems});
            }
        }
    });
});
app.post("/stock-in", (req,res)=>{
    Item.updateMany({_id: req.body.id}, { $set: { quantity: parseInt(req.body.currQuantity) + parseInt(req.body.quantity)}}, {$set: {purchasePrice: parseInt(req.body.pp)}}, (err)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("stock");
        }
    })
});
app.post("/stock-out", (req,res)=>{
    Item.updateMany({_id: req.body.id}, { $set: { quantity: parseInt(req.body.currQuantity) - parseInt(req.body.quantity)}}, {$set: {sellingPrice: parseInt(req.body.sp)}}, (err)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("stock");
        }
    })
});
app.post("/add-item", (req,res)=>{
    const newItem = new Item({
        item: req.body.itemName,
        purchasePrice: parseInt(req.body.pp),
        sellingPrice: parseInt(req.body.sp),
        category: req.body.category,
        quantity: parseInt(req.body.quantity)
    })
    newItem.save((err)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("items");
        }
    })
});

app.post("/delete-item", (req,res)=>{
    
})

app.listen(3000,()=>{
    console.log("Running on port 3000");
})
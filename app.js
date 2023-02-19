const express = require('express');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
var easyinvoice = require('easyinvoice');

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));

mongoose.set('strictQuery', false);
// Setting Up connection
mongoose.connect('mongodb://localhost:27017/stockDB' , {useNewUrlParser: true}).then(()=>{
    console.log("Mongo Connected");
}).catch(err=>{
    console.log("OH error");
    console.log(err);
});


const dataschema = mongoose.Schema({name:String , amount : Number , paymentStatus : String , borrowdate : Date})
const data = mongoose.model("data" , dataschema);

const itemSchema = new mongoose.Schema({
    item: String,
    purchasePrice: Number,
    sellingPrice: Number,
    category: String,
    quantity: Number
});
const Item = mongoose.model("Item", itemSchema);

const entrySchema = new mongoose.Schema({
    name: {type: String, default: "-"},
    item: String,
    quantity: Number,
    purchasePrice: Number,
    sellingPrice: Number,
    operation: String},{
    timestamps: true
});
const Entry = mongoose.model("Entry", entrySchema);

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
            const newEntry = new Entry({
                item: req.body.name,
                quantity: req.body.quantity,
                purchasePrice: req.body.pp,
                sellingPrice: req.body.sp,
                operation: "purchase",
                new: true
            });
            newEntry.save((err)=>{
                if(err){ console.log(err); }
                else{
                    res.redirect("stock")
                }
            })
        }
    })
});
app.post("/stock-out", (req,res)=>{
    Item.updateMany({_id: req.body.id}, { $set: { quantity: parseInt(req.body.currQuantity) - parseInt(req.body.quantity)}}, {$set: {sellingPrice: parseInt(req.body.sp)}}, (err)=>{
        if(err){
            console.log(err);
        }else{
            const newEntry = new Entry({
                item: req.body.name,
                quantity: req.body.quantity,
                purchasePrice: req.body.pp,
                sellingPrice: req.body.sp,
                operation: "sell",
                new: true
            });
            newEntry.save((err)=>{
                if(err){ console.log(err); }
                else{
                    res.redirect("stock")
                }
            })
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
    Item.findByIdAndDelete({_id: req.body.id}, (err)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("stock");
        }
    })
});

app.get("/entries", (req,res)=>{
    Entry.find({item: {$ne: null}}, (err,foundEntries)=>{
        if(err){
            console.log(err);
        }else{
            res.render("entries", {entries: foundEntries});
        }
    })
});

app.post("/bill", (req,res)=>{
    Entry.find({_id: req.body.id}, (err,entry)=>{
        if(err){
            console.log(err);
        }else{
            
        }
    })
})

app.get("/khatabook",async (req,res)=>{
    const users = await data.find();
    res.render('home.ejs',{users})
})

app.get('/add_data',(req,res)=>{
    res.render("add_data.ejs");
})

app.post('/add_data',async (req,res)=>{
  await data.insertMany({name:req.body.name,amount:req.body.amount,paymentStatus:"pending",borrowdate:req.body.date});
  res.redirect('/khatabook');
})

app.get("/show_pending",async(req,res)=>{
  const users = await data.find();
  res.render('show_pending.ejs',{users});
})

app.get("/show_paid",async(req,res)=>{
  const users = await data.find();
  res.render('show_paid.ejs',{users});
})

app.get("/clear_paid",async(req,res)=>{
  await data.deleteMany({paymentStatus:"paid"});
  res.redirect("/khatabook");
})

app.get("/topaid/:id",async(req,res)=>{
  const id = req.params.id;
  await data.findByIdAndUpdate(id,{paymentStatus:"paid"});
  res.redirect('/khatabook');
})

app.listen(3000,()=>{
    console.log("Running on port 3000");
})

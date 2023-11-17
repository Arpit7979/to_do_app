const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

main().catch(err => console.log(err));
async function main(){
    await mongoose.connect("mongodb+srv://arpitbuxar79:arpit79799@cluster0.fkqynjc.mongodb.net/todolistDB");
}
    const itemSchema = new mongoose.Schema({
       name:String
    });

    const Item = mongoose.model("Item",itemSchema);

    const reading = new Item ({
        name:"Reading books"
    });

    const playing = new Item ({
        name:"Playing footbal"
    });

    const eating = new Item ({
        name:"Eating lot of food"
    });

    const defultItems = [reading,playing,eating];

    

    app.get("/",async function(req,res){
        const foundItem = await Item.find({});
       if(foundItem.length===0){
        Item.insertMany(defultItems).then(function(){
         console.log("Data has been inserted.")
         }).catch(function(error){
         console.log(error)
         });
         res.redirect("/");
       }else{
        res.render("lists" ,{ todayDay:"Today" , newItems:foundItem} );
       }
    
    });

    const listSchema = mongoose.Schema({
        name:String,
        items:[itemSchema]
    });

    const List = mongoose.model("List",listSchema);

    app.get("/:topic",async function(req,res){
        const customListName = _.capitalize(req.params.topic);
        
        const foundList = await List.findOne({name:customListName});
        if(!foundList){
            const list = new List({
                name:customListName,
                items:defultItems
            });
            list.save();
            res.redirect("/"+customListName);
        }else{
            res.render("lists", { todayDay:foundList.name , newItems:foundList.items})
        }

    });


    app.post("/",function(req,res){
    const itemName = req.body.nextItem;
    const listName = req.body.list;

        const item = new Item({
            name:itemName
        });

      
        if(listName==="Today"){
            item.save();
            res.redirect("/");
        } else{
            List.findOne({name:listName}).then(function(foundList){
              foundList.items.push(item);
              foundList.save();
              res.redirect("/"+listName);
            })
        }

          
    });

    app.post("/delete",async function(req,res){
       const checkedItemId = req.body.checkbox;
       const listName = req.body.listName;
       if(listName==="Today"){
        await Item.findByIdAndRemove(checkedItemId).exec();
        res.redirect("/");
       } else{
        await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(){
            res.redirect("/"+listName);
        });
       }
       
    });



    app.listen(3000,function(){
        console.log("Server is working completely fine...");
    })


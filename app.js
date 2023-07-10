const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");



const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const DB =("mongodb+srv://samyakkamble4321:Samyak%402004@cluster0.wlubodw.mongodb.net/ToDoList-v1");

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
}).then(() => {
    console.log(`connection successfull`);
}).catch((err)=> console.log(`no connection`));

const itemsSchema ={
    name:String
};

const Item  = mongoose.model("Item",itemsSchema);

const item1 = new Item({
    name:"Welcome to your todolist"
});

const item2 = new Item({
    name:"Hit the + button to aff a new item"
});

const item3 = new Item({
    name:"<---Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
    name:String,
    items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){

  Item.find({},function(err,foundItems){

    if(foundItems.length === 0){

        Item.insertMany(defaultItems,function(err){
    if(err){
        console.log(err);
    }else{
        console.log("Successfully saved default items to db");
    }
});
res.redirect("/");
    }else{

    res.render("list",{listTitle:"Today" , newListitems: foundItems});
}
}); 
    
});



app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName) ;
     
    List.findOne({name:customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                //create a new list
                const list = new List({
                    name:customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName);

            }else{
                //Show an existing list
                res.render("list",{listTitle:foundList.name , newListitems: foundList.items});
            }
        }
    })



  
});

app.post("/",function(req, res){

   const itemName = req.body.newItem;
   const listName = req.body.list ;

   const item = new Item({
    name:itemName
   });


   if(listName=="Today"){
    item.save();
    res.redirect("/");
   }else{
    List.findOne({name:listName},function(err,foundList){
     foundList.items.push(item);
     foundList.save();
     res.redirect("/"+ listName );
    })
   }



});

app.post("/delete",function(req,res){

   const checkeItemId=req.body.checkbox ;
   const listName = req.body.listName;

   if(listName ==="Today"){
    Item.findByIdAndRemove(checkeItemId,function(err){
        if(!err){
            console.log("Successfully deleted checked item.");
            res.redirect("/");
        }
       });
   }else {

    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkeItemId}}},function(err,foundList){
        if(!err){
            res.redirect("/" + listName);
        }
    })
   }


  
});



app.get("/work", function(req,res){
    res.render("list", {listTitle: "Work List", newListitems: workItems});
})

app.get("/about",function(req,res){
    res.render("about");
})

app.listen(process.env.PORT || 3000,function(){
    console.log("server is running on 3000");
});
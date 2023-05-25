//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://admin-saumodeepdutta:saumo2002@cluster0.ngd0et1.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const Item = mongoose.model("Item",itemsSchema);

const List = mongoose.model("List", listSchema);

const food = new Item({
  name: "Cook Food",
})

const wash = new Item({
  name: "Wash Clothes",
})

const study = new Item({
  name: "Study",
})

const defaultItems = [food,wash,study];





app.get("/", function(req,res)
{
  Item.find({}, function(err,foundItems){

    if(foundItems.length===0)
    {
      Item.insertMany(defaultItems, function(err){
        if(err)
        {
          console.log(err);
        }
        else{
          console.log("Successfully saved !!");
        }
      })
      res.redirect("/");
    }

    else {
        res.render("list",{listTitle:"Today" , newListItem:foundItems});
    }

  })



});

app.post("/",function (req,res){
  var item=req.body.newItem;
  var listName=req.body.list;
  const addedItem = new Item({
    name: item
  })

  if(listName==="Today")
  {
    addedItem.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(addedItem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }


});

app.post("/delete",function(req,res){
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedId,function(err){
      if(err)
      {
        console.log(err);
      }
      else{
        console.log("Successfully saved !!");
      }
    })
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedId}}},function(err, deleteItem){
      if(err)
      {
        console.log(err);
      }
      else{
        console.log("Successfully saved !!");
      }
    })
    res.redirect("/"+listName);
  }


})



app.get("/:listTitle",function(req,res){
  var customListName = _.capitalize(req.params.listTitle);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err)
    {
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/"+customListName);
      }
      else
      {
        res.render("list",{listTitle:customListName , newListItem:foundList.items});
      }
    }
  })



});



app.listen(3000,function(){
  console.log("I am listening on port 3000");
});

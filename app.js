//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

const user = process.env.USERNAM;
const pass = process.env.PASSWORD;
const url = "mongodb+srv://"+user+":"+pass+"@cluster0.4qyk9.mongodb.net/bankDB";
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const customersSchema = {
    sr: Number,
    name: String,
    email: String,
    money: Number
};

const Customer = mongoose.model("Customer", customersSchema);


const historySchema = {
    sender : String,
    reciver : String,
    amount : Number,
    date : String
}

const History = mongoose.model("History", historySchema);

const customer1 = new Customer({
    sr: 1,
    name: "Rahul Singh",
    email: "rahul123@gmail.com",
    money: 35000
});

const customer2 = new Customer({
    sr: 2,
    name: "Mehul Kumar",
    email: "mehulkumar@gmail.com",
    money: 15000
});
const customer3 = new Customer({
    sr: 3,
    name: "Preeti Agarwal",
    email: "preeti2agarwal@gmail.com",
    money: 57000
});
const customer4 = new Customer({
    sr: 4,
    name: "Lokesh Gupta",
    email: "lokgupta@gmail.com",
    money: 17000
});
const customer5 = new Customer({
    sr: 5,
    name: "Lavesh Goyal",
    email: "lavesh21goyal@gmail.com",
    money: 57000
});
const customer6 = new Customer({
    sr: 6,
    name: "Shivam Sharma",
    email: "sharma1shivam@gmail.com",
    money: 26000
});
const customer7 = new Customer({
    sr: 7,
    name: "Reshama Bhatt",
    email: "bhatt123@gmail.com",
    money: 31000
});
const customer8 = new Customer({
    sr: 8,
    name: "Mohit Kumar",
    email: "rahul123@gmail.com",
    money: 95000
});
const customer9 = new Customer({
    sr: 9,
    name: "Honey Patil",
    email: "patilhoney@gmail.com",
    money: 75000
});
const customer10 = new Customer({
    sr: 10,
    name: "Manish Verma",
    email: "manish8verma@gmail.com",
    money: 43000
});

app.get("/", function (req, res) {
    res.render("home");
});

const cust = [customer1, customer2, customer3, customer4, customer5, customer6, customer7, customer8, customer9, customer10];


app.get("/customers", function (req, res) {
    
    Customer.find({}, function (err, foundCustomers) {

        if (foundCustomers.length === 0) {
            Customer.insertMany(cust, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("success");
                }
            });
            res.redirect("/customers");
        } else
            res.render("customers", {
                customers: foundCustomers
            });
    })

});


app.get("/customers/:customerID", function (req, res) {
    const requestedId = req.params.customerID;


    Customer.find({}, function (err, foundCustomers) {

        Customer.findOne( { _id : requestedId }, function (err, docs) {
            if (err){
                console.log(err)
            }
            else{
                res.render("transaction", {
                    sender: requestedId,
                    name : docs.name,
                    email : docs.email,
                    money : docs.money,
                    customers: foundCustomers
                });
            }
        });
        
    });
});


app.get("/history",function(req,res){

    History.find({}, function (err, foundHistory) {
    res.render("history", {
        history : foundHistory
    });
})
})

app.post("/transaction", function (req, res) {
    
    const senderID = (req.body.sender);
    const reciverID = (req.body.person);
    const Amount = Number(req.body.Amount);

    if(Amount>0){
    Customer.findOne({
        _id: senderID
    }, function (err, cust) {
        var senderName = cust.name;
        if (!err) {
            if (cust.money >= Amount) {
                Customer.updateOne({
                    _id: senderID
                }, {
                    money: (cust.money - Amount)
                }, function (err, docs) {
                    if (err) {
                        console.log(err);
                        res.redirect("/customers")
                    } else {
                        console.log("Updated Docs : ", docs);      
                    }
                });

                Customer.findOne({
                    _id: reciverID
                }, function (err, rec) {
                    var reciverName = rec.name;
                    if (!err) {

                        Customer.updateOne({
                            _id: reciverID
                        }, {
                            money: (rec.money + Amount)
                        }, function (err, docs) {
                            if (err) {
                                console.log(err);
                                res.redirect("/customers")
                            } else {
                                console.log("Updated Docs : ", docs);
                            }
                        });
                    }
                    const Today = new Date();
                    const history = new History({
                        sender :senderName,
                        reciver : reciverName,
                        amount : Amount,
                        date : Today.toLocaleDateString() +" "+ Today.toLocaleTimeString()
                    });
                    history.save();
                });

            }
            
        } 
    });}
    res.redirect("/customers");
})

app.listen(3000, function () {
    console.log("server is running");
});
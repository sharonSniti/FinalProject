const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
require("dotenv").config(); // Load environment variables from .env file


const app = express();
const port = 8000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
const jwt = require("jsonwebtoken");


//const dbName = 'kindergarten1';


//const connectionString = "mongodb+srv://Nadav:Nc123456@cluster0.ohqxoec.mongodb.net/?retryWrites=true&w=majority"

//const connectionString = "mongodb+srv://Nadav:Nc123456@cluster0.ohqxoec.mongodb.net/kindergarten1";
const connectionString = process.env.MONGODB_CONNECTION_STRING;



const User = require("./user");
const Child = require("./child");
const Board = require("./board");


mongoose.connect(connectionString, {
    useNewUrlParser:true,
    useUnifiedTopology:true,
})
.then(()=>{
    console.log("Connected to MongoDB")
})
.catch((error)=> {
    console.error('Error connecting to MongoDB:', error)
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});





//Create toekn
const createToken = (userId) => {
    const payload = {
        userId:userId,
    };

    const token = jwt.sign(payload,"Q$r2k6W8n!jCw%Zk",{expiresIn: "1h"});   //generate token
    return token;
}



/********************************************************* */
///////                   app.post                      /////
/********************************************************* */

app.post("/login",(req,res)=>{
    const {username,password} = req.body;

    if(!username || !password){
        return res.status(400).json({message:"username or password are required"})
    }
    User.findOne({username}).then((user)=> {
        if(!user){
            return res.status(404).json({message:"user not found"})
        }
        if(user.password !== password){
            return res.status(401).json({message:"wrong password"})
        }
        const token = createToken(user._id);
        return res.status(200).json({token})
    }).catch((error) => {
        console.log("error finding user",error);
        return res.status(500).json({message:"server error"})
    })

});

app.post("/register", (req, res) => {
    const { username, password, email } = req.body;
    
    const newUser = new User({
        username: username,
        password: password,
        email: email
    });

    newUser.save().then(() => {
        res.status(200).json({ message: "Registered user" });
    }).catch((error) => {
        console.log("error registering", error);
        res.status(500).json({ message: "Registration error" });
    });
});



  app.post('/boards/:boardId/updateWords', async (req, res) => {
    const { boardId } = req.params;
    const { words } = req.body;
  
    try {
      // Find the board by ID and update the words field
      const updatedBoard = await Board.findByIdAndUpdate(
        boardId,
        { words },
        { new: true } // Return the updated board
      );
  
      if (!updatedBoard) {
        return res.status(404).json({ message: 'Board not found' });
      }
  
      res.status(200).json({ message: 'Words updated successfully', board: updatedBoard });
    } catch (error) {
      console.error('Error updating words:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  app.post('/boards/add', async (req, res) => {
    const { profileId, category } = req.body;
  
    try {
      // Create a new board using the Board model
      const newBoard = new Board({
        category: category,
        words: [], // You can add words if needed
      });
  
      // Save the new board to the database
      const savedBoard = await newBoard.save();
  
      // Update the child's boards with the new board's ID
      const updatedChild = await Child.findByIdAndUpdate(
        profileId,
        { $push: { boards: savedBoard._id } },
        { new: true }
      );
  
      res.status(201).json(savedBoard);
    } catch (error) {
      console.error('Error creating board:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  


  // Define a route to handle adding a new child profile
  app.post('/children/add', async (req, res) => {
    const { firstName, lastName } = req.body;

    try {
      const newProfile = new Child({
        firstName,
        lastName,
        // other profile properties
     });

     const savedProfile = await newProfile.save();

      res.status(201).json(savedProfile);
   } catch (error) {
      console.error('Error adding profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  




/********************************************************* */
///////                   app.get                       /////
/********************************************************* */

  // Fetch the children data from database using the Child model
app.get("/children", (req, res) => {
    
    Child.find()
      .then((children) => {
        res.status(200).json(children);
      })
      .catch((error) => {
        console.log("Error fetching children:", error);
        res.status(500).json({ message: "Server error" });
      });
  });


  app.get('/children/:profileId', async (req, res) => {
    const { profileId } = req.params;
  
    try {
      const child = await Child.findById(profileId).populate('boards');
      res.status(200).json(child);
    } catch (error) {
      console.log('Error fetching child:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/boards/:boardId', async (req, res) => {
    const { boardId } = req.params;
  
    try {
      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }
  
      res.status(200).json(board);
    } catch (error) {
      console.log('Error fetching board:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
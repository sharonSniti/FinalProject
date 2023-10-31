const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const multer = require('multer');
const LocalStrategy = require("passport-local").Strategy;
require("dotenv").config(); // Load environment variables from .env file


const app = express();
const port = process.env.PORT || 8000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
const jwt = require("jsonwebtoken");


// Configure multer for handling image uploads
const storage = multer.memoryStorage(); // Store the image in memory
const upload = multer({ storage: storage });



const connectionString = process.env.MONGODB_CONNECTION_STRING;



const User = require("./user");
const Child = require("./child");
const Board = require("./board");
const Word = require("./word");


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



app.post('/words/add', upload.single('image'), async (req, res) => {
  const { boardId, text } = req.body;

  try {
    // Find the board by ID
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const newWord = new Word({
      text,
    });

    if (req.file) {
      newWord.image.contentType = req.file.mimetype;
      newWord.image.data = req.file.buffer;
    }

    const savedWord = await newWord.save();

    // Add the new word to the board's words array
    board.words.push(savedWord);
    await board.save();

    res.status(201).json(savedWord);
  } catch (error) {
    console.error('Error creating word:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




  app.post('/boards/add', upload.single('image'), async (req, res) => {
    const { profileId, category } = req.body;
  
    try {
      const newBoard = new Board({
        category: category,
        words: [], 
      });
  
      if (req.file) {                       // If an image was uploaded, store its details in the board
        
        newBoard.image.contentType = req.file.mimetype;
        newBoard.image.data = req.file.buffer;          // Use req.file.buffer to get the image buffer
      }
  
      const savedBoard = await newBoard.save();
      await Child.findByIdAndUpdate(
        
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
  


  
  app.post('/children/add', upload.single('image'), async (req, res) => {
    const { firstName, lastName } = req.body;
    const { buffer, mimetype } = req.file; // Get image data from multer
  
    try {
      const newProfile = new Child({
        firstName,
        lastName,
        image: {
          data: buffer, // Save the image buffer
          contentType: mimetype, // Save the image content type
        },
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



app.get("/children", async (req, res) => {
  try {
    const children = await Child.find().select('firstName lastName image'); // Ensure 'image' is selected

    // Map children to send a simplified version to the frontend
    const simplifiedChildren = children.map((child) => ({
      _id: child._id,
      firstName: child.firstName,
      lastName: child.lastName,
      image: {
        data: child.image.data.toString('base64'), // Convert binary data to base64
        contentType: child.image.contentType,
      },
    }));

    res.status(200).json(simplifiedChildren);
  } catch (error) {
    console.log("Error fetching children:", error);
    res.status(500).json({ message: "Server error" });
  }
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



  app.get('/boards/:boardId/words', async (req, res) => {
    const { boardId } = req.params;
  
    try {
      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }
  
      // Assuming 'words' is an array of Word IDs in your Board schema,
      // you can fetch the actual Word documents here.
      const words = await Word.find({ _id: { $in: board.words } });
  
      res.status(200).json(words);
    } catch (error) {
      console.log('Error fetching board words:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const multer = require('multer');
const crypto = require('crypto');
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

// Keep-alive endpoint
const jobObject = require('./cron.js');
const job = jobObject.job; // Access the 'job' property from the exported object
job.start();



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



// Hash password and generate a random salt
const hashPassword = async (password) => {
   // Generate a random salt
  const salt = crypto.randomBytes(16).toString('hex');

  // Hash the password with the generated salt
  const hashedPassword = crypto
  .createHash('sha256')
  .update(password + salt)
  .digest('hex');
  return { hashedPassword, salt };
}



const deleteChildren = async (childrenIds) => {
  for(const childId of childrenIds) {
      try {
          await Child.findByIdAndRemove(childId);
      }catch(error) {
          console.error(`Error deleting child with ID ${childId}:`, error);
      }
  }
}

const deleteBoards = async (boardsIds) => {
  for(const boardId of boardsIds) {
      try {
          await Board.findByIdAndRemove(boardId);
      }catch(error) {
          console.error(`Error deleting board with ID ${boardId}:`, error);
      }
  }
}

const deleteWords = async (wordsIds) => {
  for(const wordId of wordsIds) {
      try {
          await Word.findByIdAndRemove(wordId);
      }catch(error) {
          console.error(`Error deleting board with ID ${wordId}:`, error);
      }
  }
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
         // Retrieve hashed password and salt from the database based on the provided username
        const storedHashedPassword = user.password;

        // Combine the received password from the login screen, with the stored salt
        const saltedPassword = password + user.salt;

         // Hash the combined password and salt
         const hashedPassword = crypto
            .createHash('sha256')
            .update(saltedPassword)
            .digest('hex');

        if(hashedPassword !== storedHashedPassword){
            return res.status(401).json({message:"wrong password"})
        }
        const token = createToken(user._id);
        return res.status(200).json({token})
    }).catch((error) => {
        console.log("error finding user",error);
        return res.status(500).json({message:"server error"})
    })

});

app.post("/users/add", upload.single('image'), async (req, res) => {
  const { username, password, email, userType, firstName, lastName } = req.body;
  const { hashedPassword, salt } = await hashPassword(password);
  //console.log("hashedPassword = ",hashedPassword);
  //console.log("salt = ",salt);

  const newUser = new User({
      username: username,
      password: hashedPassword,
      salt: salt,
      email: email,
      userType: userType
  });

   // Check if the username or email is already in use
   const existingUser = await User.findOne({ $or: [{ username }, { email }] });

   if (existingUser) {
    let message;
    
    if (existingUser.username === username) {
      message = "שם משתמש תפוס";
    } else {
      message = "אימייל תפוס";
    }
  
    return res.status(400).json({ message });
  }

  const newChild = new Child({
    firstName: firstName,
    lastName: lastName,
  });

  // Check if an image was uploaded
  if (req.file) {
    newChild.image = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
  }

  if (userType === 'child'){
    newChild.save();
    newUser.child.push(newChild);
  }  

  newUser.save().then(() => {
      res.status(200).json({ message: "Registered user" });
  }).catch((error) => {
      console.log("error registering", error);
      res.status(500).json({ message: "Registration error" });
  });
});



app.post('/words/add', upload.single('image'), async (req, res) => {
  const { boardId, text , color } = req.body;

  try {
    // Find the board by ID
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const newWord = new Word({
      text,
      color,
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


app.post('/addChildId', upload.none(), async (req, res) => {
  const { username, email, teacherId } = req.body;

  try {
    // Find the teacher by ID
    const teacher = await User.findById(teacherId);

    if (!teacher) 
      return res.status(404).json({ message: 'Teacher not found' });

    let childUser;

    if (username) 
      childUser = await User.findOne({ username: new RegExp(username, 'i') }); // 'i' makes it case-insensitive

    else if (email) 
      childUser = await User.findOne({ email: new RegExp(email, 'i') }); // 'i' makes it case-insensitive

    if (!childUser) 
      return res.status(404).json({ message: 'Child not found' });

    if (teacher.child.includes(childUser.child[0])) {
      return res.status(400).json({ message: 'Child is already associated with this teacher' });
    }

    teacher.child.push(childUser.child[0]);  // Add the child to the teacher's children array

    await teacher.save();   //update the child association

    //res.status(200).json({ message: 'Child added to the teacher' });

    const childObject = await Child.findById(childUser.child[0]);

    const image = childObject.image.data ? 
        {
          data: childObject.image.data.toString('base64'), // Convert binary data to base64
          contentType: childObject.image.contentType,
        } : undefined;

      const simplifiedChild = {
        _id: childObject._id,
        firstName: childObject.firstName,
        lastName: childObject.lastName,
        image,
        // Add more properties as needed
      };

    res.status(200).json({ child: simplifiedChild });

  } catch (error) {
    console.error('Error adding child to teacher:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



  


/********************************************************* */
///////                   app.get                       /////
/********************************************************* */


app.get("/user", async (req, res) => {
  try {
    const username = req.query.username;


    const user = await User.findOne({ username: username });
    let profilePicture;

    if (user) {
      const firstChildId = user.child[0];                                     //For children - get their child id
      const firstChild = await Child.findById(firstChildId);                  //Find the actual user

      if (firstChild) {
        profilePicture = firstChild.image.data.toString('base64');
      }

      res.status(200).json({ user , profilePicture });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log("Error fetching user type:", error);
    res.status(500).json({ message: "Server error" });
  }
});




app.get("/children", async (req, res) => {
  const childIds = req.query.child; // Assuming child is an array of IDs
  console.log("childIds =",childIds);

  try {
    const simplifiedChildren = [];

    for (const childId of childIds) {
      const child = await Child.findById(childId);
      if (!child) {
        console.log(`Child not found for ID: ${childId}`);
        continue; // Skip if user not found
      }

      // Map the user data to a simplified version, including image conversion
      const image = child.image.data ? 
        {
          data: child.image.data.toString('base64'), // Convert binary data to base64
          contentType: child.image.contentType,
        } : undefined;

      const simplifiedChild = {
        _id: child._id,
        firstName: child.firstName,
        lastName: child.lastName,
        image,
        // Add more properties as needed
      };

      simplifiedChildren.push(simplifiedChild);
    }
    res.status(200).json(simplifiedChildren);
  } catch (error) {
    console.log("Error fetching children:", error);
    res.status(500).json({ message: "Server error" });
  }
});


  // finds the ids to display in the profiles selection
  app.get('/children/findIds/:teacherId', async (req, res) => {
    const { teacherId } = req.params;
    try {
      const teacher = await User.findById(teacherId); // Make sure to use await here
      const childIds = teacher.child;
      res.status(200).json(childIds);
    } catch (error) {
      console.log('Error finding ids:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });


    // finds the ids to display in the boards selection
    app.get('/boards/findIds/:profileId', async (req, res) => {
      const { profileId } = req.params;
      try {
        const child = await Child.findById(profileId); // Make sure to use await here
        const boardsIds = child.boards;
        res.status(200).json(boardsIds);
      } catch (error) {
        console.log('Error finding ids:', error);
        res.status(500).json({ message: 'Server error' });
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
  
      const words = await Word.find({ _id: { $in: board.words } });

  
      res.status(200).json(words);
    } catch (error) {
      console.log('Error fetching board words:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });


  app.get('/findTeacherId', async (req, res) => {
    const { username } = req.query; 
  
    try {
      const teacher = await User.findOne({ username });
  
      if (!teacher) 
        return res.status(404).json({ message: 'Teacher not found' });
  
      res.status(200).json({ teacherId: teacher._id });
    } catch (error) {
      console.error('Error finding teacher by username:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  



  
/********************************************************* */
///////                   app.delete                    /////
/********************************************************* */

app.delete('/removeChildFromTeacher/', async (req, res) => {
  const { profileIds, teacherId } = req.body;
  console.log("in backend profileIds to delete: ",profileIds);

  try {
    // Check if the teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Update the teacher's children array directly in the database
    await User.findByIdAndUpdate(teacherId, {
      $pull: { child: { $in: profileIds } },   // Remove specified profiles from the teacher's children array
    });
    //console.log("removed child ${} from teacher ${}")

    res.status(200).json({ message: 'Children removed from teacher successfully' });
  } catch (error) {
    console.error('Error removing children from teacher:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.delete('/deleteChildren', async (req, res) => {
  const { childrenIds } = req.body;
  console.log("childrenIds to delete: ", childrenIds);

try {
  const children = await Child.find({ _id: { $in: childrenIds } }).populate('boards');
  
  for (const child of children) {
    for (const boardId of child.boards) {
      deleteWords(boardId.words);  // delete the words in the boards
    }
    deleteBoards(child.boards);   // delete the boards
  }

   await User.updateMany(
    { children: { $in: childrenIds } },                     // Remove references from user documents
    { $pull: { children: { $in: childrenIds } } }
  );

  deleteChildren(childrenIds);  // delete the children

  await User.deleteMany({ child: { $in: childrenIds } });     // Delete the child users


  res.status(200).json({ message: 'Children deleted successfully' });
} catch (error) {
  console.error('Error deleting children:', error);
  res.status(500).json({ message: 'Internal server error' });
}

});



app.delete('/deleteBoards', async (req, res) => {
  const { boardsIds } = req.body;

  console.log("boardsIds to delete: ", boardsIds);

  try {
    const boards = await Board.find({ _id: { $in: boardsIds } }).populate('words');
    
    for(const board of boards) {
      deleteWords(board.words);  //delete the words in the boards
    }
      deleteBoards(boardsIds);   // delete the boards
    

    await Child.updateMany(
      { boards: { $in: boardsIds } },                     // Remove references from children documents
      { $pull: { boards: { $in: boardsIds } } }
    );


    res.status(200).json({ message: 'Children deleted successfully' });
  } catch (error) {
    console.error('Error deleting children:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})




app.delete('/deleteWords', async (req, res) => {
  const { wordsIds } = req.body;
  console.log("wordsIds to delete: ", wordsIds);

  deleteWords(wordsIds);         //delete the words

  await Board.updateMany(
    { words: { $in: wordsIds } },                     // Remove references from children documents
    { $pull: { words: { $in: wordsIds } } }
  );
  res.status(200).json({ message: 'Words deleted successfully' });
})


/********************************************************* */
///////                   app.patch                   /////
/********************************************************* */



app.post('/profile/update/add', upload.single('image'), async (req, res) => {
  try {
    const { _id, firstName, lastName } = req.body;
    const updateFields = {
      firstName,
      lastName,
    };

    // Check if there is a file attached in the request
    if (req.file) {
      updateFields.image = {
        data: req.file.buffer, 
        contentType: req.file.mimetype,
      };
    }

    // Update the child profile with the appropriate fields
    const updatedChild = await Child.findOneAndUpdate(
      { _id },
      updateFields,
    );
    if (!updatedChild) {
      console.log('Profile not found');
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




app.post('/board/update/add', upload.single('image'), async (req, res) => {
  try {
    const { _id, category } = req.body;
    const updateFields = {
      category,
    };

    // Check if there is a file attached in the request
    if (req.file) {
      updateFields.image = {
        data: req.file.buffer, 
        contentType: req.file.mimetype,
      };
    }

    // Update the child profile with the appropriate fields
    const updatedBoard = await Board.findOneAndUpdate(
      { _id },
      updateFields,
    );
    if (!updatedBoard) {
      console.log('Board not found');
      return res.status(404).json({ message: 'Board not found' });
    }
    
    res.status(200).json({ message: 'Board updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
require('dotenv').config();

console.log("MongoDB URI:", process.env.MONGODB_URI);  // Debugging line

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Handling the strictQuery deprecation warning
mongoose.set('strictQuery', true);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// MongoDB Schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  }
});

const Post = mongoose.model('Post', postSchema);

// Home Route
app.get("/", (req, res) => {
  Post.find({}, (err, posts) => {
    if (!err) {
      res.render('home', { startingContent: homeContent, posts });
    }
  });
});

// About Route
app.get("/about", (req, res) => {
  res.render("about", { aboutContent: aboutContent });
});

// Contact Route
app.get("/contact", (req, res) => {
  res.render("contact", { contactContent: contactContent });
});

// Compose Route - GET
app.get("/compose", (req, res) => {
  res.render("compose");
});

// Compose Route - POST
app.post("/compose", (req, res) => {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  post.save(err => {
    if (!err) {
      console.log("Successfully composed new post.");
      res.redirect("/");
    }
  });
});

// Delete Route - GET
app.get("/delete", (req, res) => {
  Post.find({}, (err, posts) => {
    if (!err) {
      res.render('delete', { posts });
    }
  });
});

// Delete Route - POST
app.post('/delete', (req, res) => {
  const deletePostId = req.body.deleteButton;

  Post.deleteOne({ _id: deletePostId }, err => {
    if (!err) {
      console.log(`Successfully deleted post with id: ${deletePostId}`);
      res.redirect("/delete");
    } else {
      console.log(err);
    }
  });
});

// Individual Post Route
app.get("/posts/:postId", (req, res) => {
  const requestedId = req.params.postId;

  Post.findOne({ _id: requestedId }, (err, post) => {
    if (!err) {
      res.render("post", { title: post.title, content: post.content });
    } else {
      console.log(err);
    }
  });
});

// Server Listening
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

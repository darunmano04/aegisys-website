
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'your_mongodb_uri';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const User = require('./models/User');
const Blog = require('./models/Blog');
const Contact = require('./models/Contact');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'aegisys-secret', resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).send('User already exists');
  const user = new User({ name, email, password });
  await user.save();
  res.send('User registered');
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).send('Invalid credentials');
  req.session.user = user;
  res.send('Login successful');
});

app.post('/api/contact', async (req, res) => {
  const contact = new Contact(req.body);
  await contact.save();
  res.send('Message received');
});

app.get('/api/blogs', async (req, res) => {
  const blogs = await Blog.find();
  res.json(blogs);
});

app.post('/api/blogs', async (req, res) => {
  const blog = new Blog(req.body);
  await blog.save();
  res.send('Blog posted');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

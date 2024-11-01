import express from 'express';
import mongoose from 'mongoose';
import articleRouter from './routes/articles.js';
import Article from './models/article.js';
import User from './models/user.js';
import methodOverride from 'method-override';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import slugify from 'slugify';
import createDomPurifier from 'dompurify';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';

const app = express();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/uploads', express.static(join(__dirname, 'uploads')));
const dompurify = createDomPurifier(new JSDOM().window);

mongoose.connect('mongodb://localhost:27017/blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.json());

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Set upload directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  }
});
const upload = multer({ storage });

app.get('/', async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' });
  res.render('articles/index', { articles: articles });
});

app.get('/api', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: 'desc' });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/blogs', upload.single('file'), async (req, res) => {
  try {
    const { title, description, markdown } = req.body;
    const article = new Article({
      title,
      description,
      markdown,
      createdAt: new Date(),
      imagePath: req.file ? req.file.path : null,
      slug: slugify(title, { lower: true, strict: true }),
      sanitizedHtml: dompurify.sanitize(marked(markdown)),
    });

    const savedArticle = await article.save();
    res.status(201).json(savedArticle);
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/articles/:slug', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug });
  if (article == null) res.redirect('/');
  res.json(article);
});

app.get('/api/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/edit/:id', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, markdown } = req.body;

    if (!title || !markdown) {
      return res.status(400).json({ error: 'Title and Markdown are required.' });
    }

    // Prepare the update data
    const updateData = { title, description, markdown };

    // Handle the uploaded file
    if (req.file) {
      updateData.imagePath = req.file.path; // Save the new image path
    }

    const updatedArticle = await Article.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(updatedArticle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedArticle = await Article.findByIdAndDelete(id);
    if (!deletedArticle) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id }, 'your_secret_key', { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

app.use('/articles', articleRouter);

app.listen(5001, () => {
  console.log('Server is running on port 5001');
});

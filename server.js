const express = require('express')
const mongoose = require('mongoose')
const articleRouter = require('./routes/articles')
const Articles = require('./models/article')
const Article = require('./models/article')
const methodOverride = require('method-override')
const app = express()
const User = require('./models/user')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');


mongoose.connect('mongodb://localhost:27017/blog', {  })

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(express.json());

app.get('/', async (req, res) => {

    const articles = await Articles.find().sort({ createdAt: "desc"})
    res.render('articles/index', { articles: articles})
})

app.get("/api", async (req, res) => {
    const articles = await Articles.find().sort({ createdAt: "desc"})
    res.json(articles)
})

app.post('/api/blogs', async (req, res) => {
    try {
      const { title, description, markdown } = req.body;
      const article = new Article({
        title,
        description,
        markdown,
        createdAt: new Date(),
      });
      const savedArticle = await article.save();
      res.status(201).json(savedArticle);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

app.get("/api/articles/:slug", async (req, res) => {
    const article = await Article.findOne({ slug: req.params.slug })
    if (article == null) res.redirect('/')
    res.json(article)
})

// Get article by ID
app.get("/api/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.put("/api/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, markdown } = req.body;

    if (!title || !markdown) {
      return res.status(400).json({ error: "Title and Markdown are required." });
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { title, description, markdown },
      { new: true }
    );

    if (!updatedArticle) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json(updatedArticle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/articles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedArticle = await Article.findByIdAndDelete(id);

    if (!deletedArticle) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.status(200).json({ message: "Article deleted successfully" });
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
    console.error("Registration error:", error);
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


app.use('/articles',articleRouter)

app.listen(5001, () => {
  console.log("server is running")
})
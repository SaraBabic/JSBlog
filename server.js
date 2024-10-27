const express = require('express')
const mongoose = require('mongoose')
const articleRouter = require('./routes/articles')
const Articles = require('./models/article')
const Article = require('./models/article')
const methodOverride = require('method-override')
const app = express()

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




app.use('/articles',articleRouter)

app.listen(5001)
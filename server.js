const express = require('express')
const mongoose = require('mongoose')
const articleRouter = require('./routes/articles')
const Articles = require('./models/article')
const methodOverride = require('method-override')
const app = express()

mongoose.connect('mongodb://localhost:27017/blog', {  })

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.get('/', async (req, res) => {

    const articles = await Articles.find().sort({ createdAt: "desc"})
    res.render('articles/index', { articles: articles})
})

app.get("/api", async (req, res) => {
    const articles = await Articles.find().sort({ createdAt: "desc"})
    res.json(articles)
})

app.use('/articles',articleRouter)

app.listen(5001)
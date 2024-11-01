import express from 'express';
import multer from 'multer';
import Article from '../models/article.js';
import createDomPurifier from 'dompurify';
import slugify from 'slugify';
import { marked } from 'marked';
import { JSDOM } from 'jsdom';

const router = express.Router();
const dompurify = createDomPurifier(new JSDOM().window);
const upload = multer({ dest: 'uploads/' });


router.get('/new', (req, res) => {
    res.render('articles/new', { article: new Article() });
});

router.get('/edit/:id', async (req, res) => {
    const article = await Article.findById(req.params.id);
    res.render('articles/edit', { article: article });
});

router.get('/:slug', async (req, res) => {
    const article = await Article.findOne({ slug: req.params.slug });
    if (article == null) res.redirect('/');
    res.render('articles/show', { article: article });
});

router.post('/', upload.single('file'), async (req, res, next) => {
    req.article = new Article();
    next(); // Proceed to the next middleware (saveArticleAndRedirect)
}, saveArticleAndRedirect('new'));

router.put('/:id', upload.single('file'), async (req, res, next) => {
    req.article = await Article.findById(req.params.id);
    next();
}, saveArticleAndRedirect('edit'));

router.delete('/:id', async (req, res) => {
    await Article.findByIdAndDelete(req.params.id);
    res.redirect('/');
});

function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let article = req.article;
        article.title = req.body.title;
        article.description = req.body.description;
        article.markdown = req.body.markdown;

        // Handle the uploaded image
        if (req.file) {
            article.imagePath = req.file.path; // Save the new image path
        }

        // Generate slug and sanitized HTML for the article
        article.slug = slugify(article.title, { lower: true, strict: true });
        article.sanitizedHtml = dompurify.sanitize(marked(article.markdown));

        try {
            // Save the article to MongoDB
            article = await article.save();
            res.redirect(`/articles/${article.slug}`);
        } catch (e) {
            console.error('ERROR:', e);
            res.render(`articles/${path}`, { article: article });
        }
    };
}


export default router;

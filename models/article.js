import mongoose from 'mongoose';
import { marked } from 'marked';
import slugify from 'slugify';
import createDomPurifier from 'dompurify';
import { JSDOM } from 'jsdom';

const dompurify = createDomPurifier(new JSDOM().window);

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    markdown: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    sanitizedHtml: {
        type: String,
        required: true,
    },
});

export default mongoose.model('Article', articleSchema);

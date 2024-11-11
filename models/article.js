import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'image'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        required: true,
    },
});

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    imagePath: {
        type: String,
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
    },
    sections: [sectionSchema], // Dodajemo sekcije kao niz
});

export default mongoose.model('Article', articleSchema);

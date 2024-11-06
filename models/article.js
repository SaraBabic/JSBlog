import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
    text: {
        type: String,
    },
    imagePath: {
        type: String,
    },
    order: {
        type: Number,
        required: true,
    },
    alignment: {
        type: String,
        enum: ['left', 'center', 'right'],
    },
    style: {
        type: String,
    },
});

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
    },
    sections: [sectionSchema], // Dodajemo sekcije kao niz
});

export default mongoose.model('Article', articleSchema);

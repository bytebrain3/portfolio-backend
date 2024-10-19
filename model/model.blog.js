import mongoose from 'mongoose';

const BlogPost = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		unique: true,
	},
	blog: {
		type: String,
		required: true,
	},
	slug: {
		type: String,
		
		unique: true,
	},
	poster: {
		type: String,
	},
	iframe: {
		type: String,
	},
	technology_use: {
		type: [String],
		required: true,
	},
	read: {
		type: Number,
	},
	ips: {
		type: [String],
	},
});

// Corrected model creation
const Blog = mongoose.model('project_over_view',BlogPost); 

export default Blog;

import mongoose from 'mongoose';

// Define the schema for the project
const projectSchema = new mongoose.Schema({
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
		required: true,
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
});

// Create the model
const Projects = mongoose.model('project', projectSchema);

export default Projects;

// Controller function to add a new project

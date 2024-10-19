import mongoose from 'mongoose';  

const AdminSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	super_user : {
		type: String,
		default : 'not_superuser'
	},
	username: {
		type: String,
		required: true,
		unique: true 
	},
	password: {
		type: String,
		required: true
	},
	otp : {
	    type: String
	},
	otp_expair : {
	    type: Date
	},
	ip: {
		type: [String],
		default: null
	},
	login_status: {
		type: Date,
		default: null
	}
});

const Admin = mongoose.model('admin', AdminSchema); // Fix the parameters order
export default Admin;

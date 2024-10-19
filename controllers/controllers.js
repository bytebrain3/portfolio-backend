import bcryptjs from "bcryptjs";
import mongoose from 'mongoose';
import slugify from 'slugify';
import crypto from 'crypto'; 


import Admin from '../model/model.admin.js'
import Blog from '../model/model.blog.js'
import Projects from '../model/model.project.js'

import GenaretTokenAndSetCookies from '../utils/genaretToeknAndRefreshToken.js'
import {
    send_login_confirm_code
} from '../utils/send_mail.js'

export const login = async (req, res) => {
	try {
		// Destructure email, password, and username from request body
		const { email, password, username } = req.body;
		
		// Extract token and refresh_token from cookies, if they exist
		const { token, refresh_token } = req.cookies || {};
		

		if (!token || !refresh_token) {
			console.log("Token not found");
		}

		// Find admin by email
		const admin = await Admin.findOne({ email });
		
		
		
		// Check if admin exists
		if (!admin) {
			return res.status(400).json({
				success: false,
				message: 'Admin not found'
			});
		}

		// Compare provided password with the stored hashed password
		const isPasswordValid = await bcryptjs.compare(password, admin.password);
		
		if (!isPasswordValid) {
			return res.status(400).json({
				success: false,
				message: 'Invalid credentials'
			});
		}
		
		if(username !== admin.username){
		    return res.status(400).json({
				success: false,
				message: 'Invalid credentials'
			});
		}
		
		
		
		
		const buffer = crypto.randomBytes(3);  
        const otp = parseInt(buffer.toString('hex'), 16).toString().substring(0, 6);
		
		const forwarded = req.headers['x-forwarded-for'];
		
		
		
    	const ip = forwarded ? forwarded.split(',')[0] : req.ip
    	const otp_expair = new Date();
        otp_expair.setMinutes(otp_expair.getMinutes() + 10);
	    admin.login_status = Date.now()
	    admin.ip = [ip]
	    admin.otp = otp;
		admin.otp_expair = otp_expair
		admin.save()
		await send_login_confirm_code(email,otp)
		
		
		res.status(200).json({
			success: true,
			message: 'Logged in successfully!',
			username: admin.username
		});
	} catch (err) {
		// Handle any errors
		res.status(500).json({
			success: false,
			message: 'Error: ' + err.message
		});
	}
};
export const logout = async (req, res) => {
	res.clearCookie('token', { path: '/' }); 
	res.clearCookie('refreshToken', { path: '/' });
	res.status(200).json({
		success: true,
		message: "Logout successful"
	});
};
export const verify_otp = async (req, res) => {
    try {
        const { otp } = req.body;

        // Step 1: Validate OTP exists in request
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required"
            });
        }

        // Step 2: Find the OTP in the database
        const check_otp = await Admin.findOne({ otp });

        // Step 3: Validate if OTP exists in database
        if (!check_otp) {
            return res.status(404).json({
                success: false,
                message: "OTP not found"
            });
        }

        // Step 4: Check if the OTP matches
        if (otp !== check_otp.otp) {
            return res.status(400).json({
                success: false,
                message: "OTP does not match"
            });
        }

        // Step 5: Check if OTP has expired
        const now = new Date();
        if (now > check_otp.otp_expair) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }
        GenaretTokenAndSetCookies(res,check_otp._id)
        // Step 6: OTP is valid
        return res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (err) {
        // Handle any errors
        return res.status(500).json({
            success: false,
            message: "Server error: " + err.message
        });
    }
};
export const change_super = async (req, res) => {
	try {
	    const { key , id } = req.body;

	    if(!key){
	        return res.status(400).json({
    			success: false,
    			message: 'No key provided'
    		});
	    }
	    
	    if(key === process.env.API_KEY){
	        const give_access = await Admin.findOne({ id }); // use await
	        
	        if(!give_access){
	            return res.status(404).json({
    				success: false,
    				message: 'No Admin Found'
    			});
	        }
	        
	        // Update and save the found admin
	        give_access.super_user = "superUser";
	        await give_access.save();  // Save the updated admin
	        
	        return res.status(200).json({
    			success: true,
    			message: 'Admin role updated to ' + give_access.super_user
    		});
	    }
	    
	    return res.status(403).json({
			success: false,
			message: 'Invalid API key'
		});
	} catch (err) {
		// Handle any unexpected errors
		return res.status(500).json({
			success: false,
			message: 'Server error: ' + err.message
		});
	}
};





export const write_blog = async (req, res) => {
	try {
		const { title, blog, custom_slug, poster, iframe, technology_use , id } = req.body;
		
		const superUser = Admin.findOne({id})
		
		if("not_superuser" == superUser.super_user)
		{
		    return res.status(400).json({
				success: false,
				message: "you has password access but your not had any permissions to perform any task",
			});
		}
		
		if (!technology_use || !title || !blog) {
			return res.status(400).json({
				success: false,
				message: "All fields (technology_use, title, blog) are required",
			});
		}
		const slug = slugify(title, {
			lower: true, // Convert to lowercase
			strict: true, // Remove special characters
		});
		
		// Create a new blog post instance
		const newBlogPost = new Blog({
			title,
			blog,
			technology_use,
			slug:  custom_slug ||slug,   // Assuming slug is the same as title
		});

		// Set either poster or iframe based on the input
		if (poster) {
			newBlogPost.poster = poster;
		} else if (iframe) {
			newBlogPost.iframe = iframe;
		}

		// Save the new blog post to the database
		await newBlogPost.save();

		// Send a success response
		res.status(201).json({
			success: true,
			message: 'Blog post created successfully!',
		});
	} catch (err) {
		// Handle any errors
		res.status(500).json({
			success: false,
			message: 'Error: ' + err.message,
		});
	}
};
export const edit_blog = async (req,res) => {
    try{
        const {title} = req.params
        const {id} = res.body
        const superUser = Admin.findOne({id})
        if("not_superuser" == superUser.super_user)
		{
		    return res.status(400).json({
				success: false,
				message: "you has password access but your not had any permissions to perform any task",
			});
		}
        console.log(title)
        const blog = await Blog.findOne({title})
        
        res.status(200).json({
            success : true,
            message: {
                id : blog.id,
        		title: blog.title,
        		blog: blog.blog,
        		slug: blog.slug,
        		technology_use: blog.technology_use,
        	}
        })
        
    }catch(err){
        res.status(500).json({
			success: false,
			message: 'Error: ' + err.message,
		});
    }
}
export const save_blog = async (req, res) => {
	try {
		const { bid, title, blog: blogContent, slug, technology_use , id} = req.body;
		const superUser = Admin.findOne({id})
        if("not_superuser" == superUser.super_user)
		{
		    return res.status(400).json({
				success: false,
				message: "you has password access but your not had any permissions to perform any task",
			});
		}
		// Fetch the blog by id (or slug) instead of title
		const blog = await Blog.findById(bid);
		
		if (!blog) {
			return res.status(404).json({
				success: false,
				message: 'Blog not found',
			});
		}

		// If the user changes the title, check if the new title is already used by another blog
		if (title !== blog.title) {
			const titleExists = await Blog.findOne({ title });
			if (titleExists) {
				return res.status(400).json({
					success: false,
					message: 'A blog with this title already exists. Please choose another title.',
				});
			}
		}

		// Update the blog properties
		blog.title = title;
		blog.blog = blogContent;  // Use the renamed blogContent here
		blog.slug = slug;
		blog.technology_use = technology_use;

		// Save the updated blog
		await blog.save();

		// Respond with success
		res.status(200).json({
			success: true,
			message: 'Blog updated successfully',
		});
	} catch (err) {
		// Handle errors
		res.status(500).json({
			success: false,
			message: 'Error: ' + err.message,
		});
	}
};
export const delete_blog = async (req, res) => {
	try {
		const { bid } = req.params; // Get the blog ID from the request body
		const { id } = req.body
		const superUser = Admin.findOne({id})
        if("not_superuser" == superUser.super_user)
		{
		    return res.status(400).json({
				success: false,
				message: "you has password access but your not had any permissions to perform any task",
			});
		}
		
		// Use findByIdAndDelete correctly
		const blog = await Blog.findByIdAndDelete(bid); // Await the deletion operation

		if (!blog) {
			return res.status(404).json({
				success: false,
				message: 'Blog not found',
			});
		}

		// Respond with success
		res.status(200).json({
			success: true,
			message: 'Blog deleted successfully',
			
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'Error: ' + err.message,
		});
	}
};
export const blog_list = async (req, res) => {
	try {

		const current_index = parseInt(req.body.current_index, 10) || 1;
		const limit = 6;  // Number of blogs to fetch per page
		const startIndex = (current_index - 1) * limit;  // Calculate the starting index

		// Fetch paginated blogs
		const blogs = await Blog.find({})
			.skip(startIndex)
			.limit(limit);

		// Get the total count of blog documents
		const totalBlogs = await Blog.countDocuments(); // Total blog count

		// Respond with paginated data
		res.status(200).json({
			success: true,
			message: 'Blogs fetched successfully',
			data: blogs,
			total: totalBlogs,  // Total number of blogs in the collection
			current_index,  // Current page number
			totalPages: Math.ceil(totalBlogs / limit),  // Total pages based on the limit and total blogs
		});

	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'Error: ' + err.message,
		});
	}
};





export const add_project = async (req, res) => {
	try {
		const { title, poster, custom_slug, iframe, technology_use, blog ,id } = req.body;
		const superUser = Admin.findOne({id})
        if("not_superuser" == superUser.super_user)
		{
		    return res.status(400).json({
				success: false,
				message: "you has password access but your not had any permissions to perform any task",
			});
		}
		// Check if required fields are provided
		if (!technology_use || !title || !blog) {
			return res.status(400).json({
				success: false,
				message: "All fields (technology_use, title, blog) are required",
			});
		}

		// Use slugify to generate a proper slug from the title
		const slug = slugify(custom_slug || title, {
			lower: true, // Convert to lowercase
			strict: true, // Remove special characters
		});
		
		// Create a new project instance
		const newProject = new Projects({
			title,
			blog,
			technology_use,
			slug,  // Use the slugified title or custom slug
		});

		// Set poster or iframe based on the input
		if (poster) {
			newProject.poster = poster;
		} else if (iframe) {
			newProject.iframe = iframe;
		}

		// Save the new project to the database
		await newProject.save();

		// Send a success response
		res.status(201).json({
			success: true,
			message: 'Project created successfully!',
		});
	} catch (err) {
		// Handle any errors
		res.status(500).json({
			success: false,
			message: 'Error: ' + err.message,
		});
	}
};
export const edit_project = async (req,res) => {
    try{
        const {pid} = req.params
        const { id } = req.body
        const superUser = Admin.findOne({id})
        if("not_superuser" == superUser.super_user)
		{
		    return res.status(400).json({
				success: false,
				message: "you has password access but your not had any permissions to perform any task",
			});
		}
        
        
        const blog = await Projects.findOne({pid})
        
        res.status(200).json({
            success : true,
            message: {
                id : blog.id,
        		title: blog.title,
        		blog: blog.content,
        		slug: blog.slug,
        		technology_use: blog.technology_use,
        	}
        })
        
    }catch(err){
        res.status(500).json({
			success: false,
			message: 'Error: ' + err.message,
		});
    }
}
export const save_project = async (req, res) => {
	try {
		const { pid, title, blog: blogContent, slug, technology_use , id} = req.body;
		const superUser = Admin.findOne({id})
        if("not_superuser" == superUser.super_user)
		{
		    return res.status(400).json({
				success: false,
				message: "you has password access but your not had any permissions to perform any task",
			});
		}
		// Fetch the blog by id (or slug) instead of title
		const blog = await Projects.findById(pid);

		if (!blog) {
			return res.status(404).json({
				success: false,
				message: 'Project not found',
			});
		}

		if (title !== blog.title) {
			const titleExists = await Blog.findOne({ title });
			if (titleExists) {
				return res.status(400).json({
					success: false,
					message: 'A Project with this title already exists. Please choose another title.',
				});
			}
		}

		// Update the blog properties
		blog.title = title;
		blog.content = blogContent;  // Use the renamed blogContent here
		blog.slug = slug;
		blog.technology_use = technology_use;

		// Save the updated blog
		await blog.save();

		// Respond with success
		res.status(200).json({
			success: true,
			message: 'Project updated successfully',
		});
	} catch (err) {
		// Handle errors
		res.status(500).json({
			success: false,
			message: 'Error: ' + err.message,
		});
	}
};
export const delete_project = async (req, res) => {
	try {
		const { pid } = req.params; // Get the project ID from the request body
		const { id } = res.body
		const superUser = Admin.findOne({id})
        if("not_superuser" == superUser.super_user)
		{
		    return res.status(400).json({
				success: false,
				message: "you has password access but your not had any permissions to perform any task",
			});
		}
		// Use findByIdAndDelete correctly
		const project = await Projects.findByIdAndDelete(pid); // Await the deletion operation

		if (!project) {
			return res.status(404).json({
				success: false,
				message: 'Project not found',
			});
		}

		// Respond with success
		res.status(200).json({
			success: true,
			message: 'Project deleted successfully',
			
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'Error: ' + err.message,
		});
	}
};
export const project_list = async (req, res) => {
	try {
		const { current_index } = req.body;
		const limit = 2;
		const startIndex = (current_index - 1) * limit;

		// Fetch paginated projects
		const projects = await Projects.find({})
			.skip(startIndex)
			.limit(limit);

		// Get the total count of projects
		const totalProjects = await Projects.countDocuments(); 
		
		
		// Respond with the paginated data
		res.status(200).json({
			success: true,
			message: 'Projects fetched successfully',
			data: projects,
			total: totalProjects, // Corrected the reference here
			current_index,
			totalPages: Math.ceil(totalProjects / limit),
		});
		
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'Error: ' + err.message,
		});
	}
};

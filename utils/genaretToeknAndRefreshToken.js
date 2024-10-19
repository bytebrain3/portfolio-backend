import jwt from 'jsonwebtoken';

// Function to generate tokens and set cookies
const GenaretTokenAndSetCookies = (res, id) => {
	// Convert id to string if necessary
	const stringifiedId = JSON.stringify(id);
	
	// Generate access token
	const token = jwt.sign({ id: stringifiedId }, process.env.JWT_SECRET, {
		expiresIn: '7d',
	});
	
	// Generate refresh token
	const refreshToken = jwt.sign({ id: stringifiedId }, process.env.JWTSECRET_REFRESH, {
		expiresIn: '15d',
	});
	
	// Determine if in production environment
	const environment = process.env.NODE_ENV === 'production';
	
	// Set access token cookie
	res.cookie('token', token, {
		httpOnly: true,
		secure: environment,
		sameSite: 'None',
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
	});
	
	// Set refresh token cookie
	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: environment,
		sameSite: 'None',
		maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
	});
};

export default GenaretTokenAndSetCookies;


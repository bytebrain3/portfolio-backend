import jwt from 'jsonwebtoken';


const refreshAccessToken = (req, res) => {
	const { refreshToken } = req.cookies; // Correctly access the refresh token from cookies
	
	if (!refreshToken) {
		return res.status(404).json({
			success: false,
			message: 'refreshToken not found',
		});
	}

	try {
		// Verify the refresh token
		const decoded = jwt.verify(refreshToken, process.env.JWTSECRET_REFRESH);
		
		// Generate a new access token
		const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
			expiresIn: '7d',
		});
		
		// You likely do not want to issue a new refresh token here without user re-authentication.
		// But if you want to issue a new one, uncomment below
		// const newRefreshToken = jwt.sign({ id: decoded.id }, process.env.JWTSECRET_REFRESH, {
		// 	expiresIn: '15d',
		// });

		// Set new access token cookie
		const environment = process.env.NODE_ENV === 'production';
		res.cookie('token', newAccessToken, {
			httpOnly: true, // Usually set to true for security
			secure: environment,
			sameSite: 'None',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
		});

		// Optionally set a new refresh token cookie if needed
		// res.cookie('refreshToken', newRefreshToken, {
		// 	httpOnly: true,
		// 	secure: environment,
		// 	sameSite: 'None',
		// 	maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
		// });

		// Respond with the new access token (optional)
		return res.json({
			success: true,
			accessToken: newAccessToken,
			// refreshToken: newRefreshToken // If you're issuing a new one
		});
	} catch (error) {
		console.error('Error verifying refresh token:', error);
		return res.status(403).json({ success: false, message: 'Invalid refresh token' });
	}
};

export default refreshAccessToken;

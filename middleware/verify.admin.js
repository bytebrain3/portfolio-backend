import jwt from "jsonwebtoken";

export const verifiedAuth = (req, res, next) => {
	const { token, refreshToken } = req.cookies;

	// Check if the access token is present
	if (!token) {
		return res.status(400).json({
			success: false,
			message: 'Token not found',
		});
	}

	try {
		// Verify the access token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.id = decoded.id; // Attach the user ID to the request for later use
		next();
	} catch (err) {
		// Check if the token expired
		if (err.name === "TokenExpiredError") {
			// If access token expired, check for the refresh token
			if (!refreshToken) {
				return res.status(401).json({
					success: false,
					message: 'Refresh token not found, login again',
				});
			}

			// Verify the refresh token
			try {
				const decodedRefresh = jwt.verify(refreshToken, process.env.JWTSECRET_REFRESH);

				// Generate a new access token
				const newAccessToken = jwt.sign({ id: decodedRefresh.id }, process.env.JWT_SECRET, {
					expiresIn: '7d',
				});

				// Set the new access token in the cookies
				const environment = process.env.NODE_ENV === 'production';
				res.cookie('token', newAccessToken, {
					httpOnly: true,
					secure: environment, // Ensure this is true in production
					sameSite: 'None',
					maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
				});

				req.id = decodedRefresh.id; // Attach the user ID to the request
				next(); // Continue to the next middleware
			} catch (refreshError) {
				return res.status(403).json({
					success: false,
					message: 'Refresh token invalid or expired, login again',
				});
			}
		} else {
			// Handle other errors such as invalid access token
			return res.status(400).json({
				success: false,
				message: 'Invalid token'+err,
			});
		}
	}
};

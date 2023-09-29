
const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../middlewares/MulterMiddleware");
const { google } = require("googleapis");
require("dotenv").config();
const REDIRECT = process.env.REDIRECT
// const LIST = process.env.LIST;
const oauth2Client = new google.auth.OAuth2(
	"17808230510-bdlmru3p16g7apftqicnqu2b2n1kmmes.apps.googleusercontent.com",
	"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",
	`${REDIRECT}/google/redirect`
);

const {
	login,
	registerUser,
	upload,
	order
} = require("../controllers/authControllers");

// Set the scopes for Google Drive access
const SCOPES = [
	"https://www.googleapis.com/auth/drive.file",
	"https://www.googleapis.com/auth/drive.readonly",
	"https://www.googleapis.com/auth/drive"
];

router.post("/signin", login);
router.post("/register", registerUser);
router.get("/api/get", order);
router.post("/api/save", uploadMiddleware.single("photo"), upload);


router.get("/auth", (req, res) => {
  try {
	  // Generate the OAuth2 authentication URL
	  console.log("Error in auth");
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });

    // Send the authentication URL to the client
    res.json({ authUrl });
  } catch (error) {
    console.error("Error generating authentication URL:", error);
    res.status(500).json({ error: "Error generating authentication URL" });
  }
});

router.get("/google/redirect", async (req, res) => {
	const { code } = req.query;

	try {
		// Exchange the authorization code for tokens
		const { tokens } = await oauth2Client.getToken(code);
		oauth2Client.setCredentials(tokens);

		// Redirect to the desired route after successful authentication
		
		res.redirect("localhost:3000/listVideos");
	} catch (error) {
		console.error("Error retrieving access token:", error);
		res.status(500).json({ error: "Error retrieving access token" });
	}
});

router.get("/listVideos", async (req, res) => {
	const drive = google.drive({ version: "v3", auth: oauth2Client });

	try {
		const folderId = "1ZA4rpS3Bz41ZEvLShBSFAwaZDUQh42CM"; // Replace with your college folder ID
		const response = await drive.files.list({
			q: `'${folderId}' in parents and mimeType='video/mp4'`,
		});

		const videos = response.data.files.map((video) => ({
			id: video.id,
			name: video.name,
			src: `https://drive.google.com/uc?export=download&id=${video.id}`,
			type: "video/mp4", // Set the MIME type to video/mp4
		}));
		res.json(videos);
	} catch (error) {
		console.error("Error listing videos:", error);
		res.status(500).json({ error: "Error listing videos" });
	}
});



module.exports = router;

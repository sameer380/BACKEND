const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

require("dotenv").config();
const BASE_URL = process.env.BASE_URL;
const DATABASE = process.env.DATABASE;
// Use the express.json() middleware
app.use(express.json());
const cors = require("cors");
app.use(cors());
// Allow requests from the frontend domain
app.use(
	cors({
		origin: {BASE_URL},
		credentials: true, // Enable cookies and other credentials
	})
);



// Include your routes
app.use("/", require("./routes/authRouthes"));
app.use(express.static("public"));
const mongoose = require("mongoose");

mongoose
	.connect(DATABASE, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("DB connected"))
	.catch((e) => console.log("ERROR connecting DB", e));
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});



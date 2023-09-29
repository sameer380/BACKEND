const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uploadSchema = require("../model/uploadModel");
const USER = require("../model/user"); 
// const Cloudinary = require("../helper/cloudinaryconfig.js");
const Cloudinary = require("../helper/cloudinaryconfig.js");



const registerUser = async (req, res) => {
	try {
		// Get all data from the request body

		const { firstName, lastName, email, password } = req.body;

		if (!(firstName && lastName && email && password)) {
			return res.status(400).json({ error: "All fields are compulsory" });
		}

		USER.findOne({ email: email } || { password: password }).then(
			(existingUser) => {
				if (existingUser) {
					return res.status(422).json({
						error: "User already exists with that email or roll number",
					});
				}
				// console.log(firstName, lastName, email, password);
				bcrypt.hash(password, 12).then((hashedPassword) => {
					const user = new USER({
						firstName: firstName,
						lastName: lastName,
						email: email,
						password: hashedPassword,
					});

					user
						.save()
						.then((user) => {
							console.log(user);
							res.json({ message: "Saved successfully" });
						})
						.catch((err) => {
							console.log(err);
							res.status(500).json({ error: "Could not save user" });
						});
				});
			}
		);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "An error occurred during registration" });
	}
};   
const login = async (req, res) => {
	const { email, password } = req.body;
	console.log(email);
	console.log([password]);
	if (!email || !password) {
		return res.status(422).json({ error: "Please provide email and Rollno" });
	}

	USER.findOne({ email: email })
		.then((savedUser) => {
			if (!savedUser.email) {
				return res.status(422).json({ error: "Invalid email" });
			}

			if (!savedUser.password) {
				return res.status(500).json({ error: "User Roll-Number not found" });
			}

			bcrypt
				.compare(password, savedUser.password)
				.then((match) => {
					if (match) {
						const token = jwt.sign({ _id: savedUser.id }, "sasass");
						const { firstName, lastName, email, userName } = savedUser;
						res.json({
							token,
							user: { firstName, lastName, email, userName },
						});
					} else {
						return res
							.status(422)
							.json({ error: "User Roll-Number not found" });
					}
				})
				.catch((err) => {
					console.log(err);
					return res
						.status(500)
						.json({ error: "Error comparing Roll Numbers" });
				});
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).json({ error: "User Not Found, Signup before login" });
		});
};


const order = async (req, res) => {
	const allPhotos = await uploadSchema.find().sort({ createdAt: "descending" });
	res.send(allPhotos);
}




// const upload = async (req, res) => {
//   try {
//     const upload = await Cloudinary.uploader.upload(req.file.path);
//     const photo = upload.secure_url; // Use the secure_url from Cloudinary

//     console.log(photo);

//     uploadSchema
//       .create({ photo }) // Use 'photo' as the field name
//       .then((data) => {
//         console.log("Uploaded Successfully...");
//         console.log(data);
//         res.send(data);
//       })
//       .catch((err) => {
//         console.log(err);
//         res.status(500).send(err); // Handle errors gracefully
//       });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send(err); // Handle errors gracefully
//   }
// };
const upload = async (req, res) => {
  try {
    // Define Cloudinary transformations to optimize the image
    const transformations = [
      { width: 1000, crop: "scale" }, // Resize to a maximum width of 1000px
      { quality: "auto" }, // Automatically adjust the image quality
      { fetch_format: "auto" } // Automatically select the best format (e.g., WebP)
    ];

    const upload = await Cloudinary.uploader.upload(req.file.path, {
      transformation: transformations
    });

    const photo = upload.secure_url; // Use the secure_url from Cloudinary

    console.log(photo);

    uploadSchema
      .create({ photo }) // Use 'photo' as the field name
      .then((data) => {
        console.log("Uploaded Successfully...");
        console.log(data);
        res.send(data);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err); // Handle errors gracefully
      });
  } catch (err) {
    console.error(err);
    res.status(500).send(err); // Handle errors gracefully
  }
};

module.exports = upload;


module.exports = {
	login,
	registerUser,
	upload,
	order,

};

const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dagab1ofs', 
  api_key: '887196284369533', 
  api_secret: 'doOP8zGUk-EDWXqUqxUMgzUbXS8' 
});

module.exports = cloudinary;

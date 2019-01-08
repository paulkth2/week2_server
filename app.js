// serverjs

// [LOAD PACKAGES]
var express     = require('express');
var mongodb     = require('mongodb');
var app         = express();
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
var multer      = require('multer');
var fs          = require('fs');
var path = require('path');
var crypto = require('crypto');

var genRandomString = function(length) {
   return crypto.randomBytes(Math.ceil(length/2))
      .toString('hex')
      .slice(0, length);
};

var sha512 = function(password, salt) {
   var hash = crypto.createHmac('sha512', salt);
   hash.update(password);
   var value = hash.digest('hex');
   return {
      salt:salt,
      passwordHash:value
   };
};

function saltHashPassword(userPassword) {

   var salt = genRandomString(16);
   var passwordData = sha512(userPassword, salt);
   return passwordData;
}

function checkHashPassword(userPassword, salt){
   var passwordData = sha512(userPassword, salt);
   return passwordData;
}


var form = "<!DOCTYPE HTML><html><body>" +
"<form method='post' action='/upload' enctype='multipart/form-data'>" +
"<input type='file' name='upload'/>" +
"<input type='submit' /></form>" +
"</body></html>";
var path = require('path');
var crypto = require('crypto');
//var router      = express.Router();

storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
      return crypto.pseudoRandomBytes(16, function(err, raw) {
        if (err) {
          return cb(err);
        }
        return cb(null, file.originalname);
      });
    }
  });

var upload      = multer({ storage: storage })




// [ CONFIGURE mongoose ]

// CONNECT TO MONGODB SERVER
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
});

mongoose.connect('mongodb://localhost/mongodb_tutorial');


// [CONFIGURE APP TO USE bodyParser]
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('uploads'));
//app.use('/user', express.static('uploads'));
app.set('view engine', 'jade');



app.get('/upload', function (req, res){
  res.writeHead(200, {'Content-Type': 'text/html' });
  res.end(form);

});
/*
app.get('/upload', function(req, res){
  res.render('upload');
})
*/




app.post('/upload', upload.single('userfile'), function(req, res){
  res.set('Uploaded : '+ req.file);
})
*/
app.post(
  "/upload",
  multer({
    storage: storage
  }).single('upload'), function(req, res) {
    console.log(req.file);
    console.log(req.body);
    res.redirect("/uploads/" + req.file.filename);
    console.log(req.file.filename);
    return res.status(200).end();
  });

app.get('/uploads/:upload', function (req, res){
  file = req.params.upload;
  console.log(req.params.upload);
  var img = fs.readFileSync(__dirname + "/uploads/" + file);
  res.writeHead(200, {'Content-Type': 'image/png' });
  res.end(img, 'binary');

});



// DEFINE MODEL
var User = require('./models/user');
var Image = require('./models/image');
var Login = require('./models/login');

//Registration
app.post('/register',(request, response, next) => {
   var post_data = request.body;
   var plaint_password = post_data.password;
   var hash_data = saltHashPassword(plaint_password);

   var password = hash_data.passwordHash;
   var salt = hash_data.salt;

   var name = post_data.name;
   var email = post_data.email;
   var insertJson = {
      'email' : email,
      'password': password,
      'salt' : salt,
      'name' : name
   }

   // check exist email
   Login.find({'email':email}).count(function(err, number){
         if(number != 0) {
            response.json('Email already exists');
            console.log('Email already exists');
         } else {
            Login.insertOne(insertJson, function(error, res){
                  response.json('Registration success');
                  console.log('Registration success');
               })
         }
   })
});

// login

app.post('/login', (request, response, next) => {
   var post_data = request.body;

   var email = post_data.email;
   var userPassword = post_data.password;

    Login.find({'email':email}).count(function(err, number) {
         if(number == 0) {
            response.json('email not exists');
            console.log('email not exists');
         } else {
            Login.findOne({'email':email}, function(error, user) {
                  var salt = user.salt;
                  var hashed_password = checkHashPassword(userPassword, salt).passwordHash;
                  var encrypted_password = user.password;
                  if(hashed_password == encrypted_password) {
                     response.json('login success');
                     console.log('login success');
                  } else { // wrong password
                     response.json('wrong password');
                     console.log('wrong password');
                  }
               })
         }
      })
});
// GET ALL BOOKS
app.get('/api/users', function(req,res){
    User.find(function(err, users){
        if(err) return res.status(500).send({error: 'database failure'});
        res.json(users);
    })
});

// GET SINGLE BOOK
app.get('/api/users/:user_id', function(req, res){
    User.findOne({_id: req.params.user_id}, function(err, user){
        if(err) return res.status(500).json({error: err});
        if(!user) return res.status(404).json({error: 'user not found'});
        res.json(user);
    })
});

// GET BOOK BY AUTHOR
app.get('/api/users/name/:name', function(req, res){
    User.find({name: req.params.name}, function(err, users){
        if(err) return res.status(500).json({error: err});
        if(users.length === 0) return res.status(404).json({error: 'user not found'});
        res.json(users);
    })
});

// CREATE BOOK
app.post('/api/users', function(req, res){
    var user = new User();
    user.image = req.body.image;
    user.name = req.body.name;
    user.job = req.body.job;
    user.birthDate = req.body.birthDate;
    user.country = req.body.country;
    user.phoneNumber = req.body.phoneNumber;
    user.email = req.body.email;
    user.gender = req.body.gender;
    user.bloodGroup = req.body.bloodGroup;
    user.education = req.body.education;

    user.save(function(err){
        if(err){
            console.error(err);
            res.json({result: 0});
            return;
        }

        res.json({result: 1});

    });
});

// UPDATE THE BOOK
app.put('/api/users/:user_id', function(req, res){
    User.update({ _id: req.params.user_id }, { $set: req.body }, function(err, output){
        if(err) res.status(500).json({ error: 'database failure' });
        console.log(output);
        if(!output.n) return res.status(404).json({ error: 'user not found' });
        res.json( { message: 'user updated' } );
    })
/* [ ANOTHER WAY TO UPDATE THE BOOK ]
        User.findById(req.params.user_id, function(err, user){
        if(err) return res.status(500).json({ error: 'database failure' });
        if(!user) return res.status(404).json({ error: 'user not found' });
        if(req.body.title) user.title = req.body.title;
        if(req.body.author) user.author = req.body.author;
        if(req.body.published_date) user.published_date = req.body.published_date;
        user.save(function(err){
            if(err) res.status(500).json({error: 'failed to update'});
            res.json({message: 'user updated'});
        });
    });
*/
});

// DELETE BOOK
app.delete('/api/users/:user_id', function(req, res){
    User.remove({ _id: req.params.user_id }, function(err, output){
        if(err) return res.status(500).json({ error: "database failure" });

        /* ( SINCE DELETE OPERATION IS IDEMPOTENT, NO NEED TO SPECIFY )
        if(!output.result.n) return res.status(404).json({ error: "user not found" });
        res.json({ message: "user deleted" });
        */

        res.status(204).end();
    })
});

//GET LIST OF IMAGES WITH CERTAIN User
app.get('/images/:email', function(req, res){
    Image.find({email: req.params.email}, function(err, users){
        if(err) return res.status(500).json({error: err});
        if(users.length === 0) return res.status(404).json({error: 'image matching email not found'});
        res.json(users);
    })
});

app.get('/images', function(req,res){
    Image.find(function(err, users){
        if(err) return res.status(500).send({error: 'database failure'});
        res.json(users);
    })
});
// CREATE BOOK
app.post('/images', function(req, res){
    var image = new Image();
    image.email = req.body.email;
    image.imageName = req.body.imageName;

    image.save(function(err){
        if(err){
            console.error(err);
            res.json({result: 0});
            return;
        }

        res.json({result: 1});

    });
});


// [CONFIGURE SERVER PORT]

var port = process.env.PORT || 80;

// [CONFIGURE ROUTER]






// [RUN SERVER]
var server = app.listen(port, function(){
 console.log("Express server has started on port " + port)
});

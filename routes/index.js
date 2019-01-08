
module.exports = function(app, User)
{



    app.get('/upload', function(req, res){
      res.render('upload');
    });

    app.post('/upload', upload.single('userfile'), function(req, res){
      res.set('Uploaded : '+req.file);
    })

}

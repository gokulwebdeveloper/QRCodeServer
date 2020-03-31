const port = 3002;

var express = require('express'),
    app = express();
const cors = require('cors');
var fs = require('fs');
var url = require('url');
app.use(cors())    
var bodyParser = require('body-parser');
var mimeTypes = require('mimetypes');
const {Storage} = require('@google-cloud/storage');
const storage = new Storage({
  projectId: 'qrgeneratorui',
  keyFilename: './qrgeneratorui-8c81253c6c6f.json'
});


app.use('/qrcode', express.static(process.cwd() + '/qrcode'));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
   extended: true
}));
app.use(bodyParser.json());
function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
app.get('/',function(req,res){
  console.log("test");
});
app.post('/',function(req,res){
  /*var requrl = url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.originalUrl,
});
     res.setHeader('Access-Control-Allow-Origin', '*');
   let base64String = req.body[0].data; // Not a real image
    let base64Image = base64String.split(';base64,').pop();
    let filename =  makeid(7);
    fs.writeFile(filename+'.png', base64Image, {encoding: 'base64'}, function(err) {
      console.log('File created');
  });
    res.json({'qrCodeURL':requrl+filename+'.png'});*/
    res.setHeader('Access-Control-Allow-Origin', '*');
   var image = req.body[0].data,
    mimeType = image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1],
    fileName =  makeid(7)+ mimeTypes.detectExtension(mimeType),
    base64EncodedImageString = image.replace(/^data:image\/\w+;base64,/, ''),
    imageBuffer = new Buffer(base64EncodedImageString, 'base64');

    bucket = storage.bucket('qrgenerator');

      // Upload the image to the bucket
      var file = bucket.file('qrcode/' + fileName);

    file.save(imageBuffer, {
            metadata: { contentType: mimeType },
            public: true,
            validation: 'md5'
        }, function(error) {
             console.log(error);
            if (error) {
                return res.serverError('Unable to upload the image.');
            }
           const publicUrl = `https://storage.googleapis.com/${bucket.name}/qrcode/${fileName}`;
            return res.json({'qrCodeURL': publicUrl});
        });
    //return  res.json({'qrCodeURL':file});
});

app.listen();
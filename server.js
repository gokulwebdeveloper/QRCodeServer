const port = 8080;

var express = require('express'),
    app = express();
const cors = require('cors');
const qr = require('qr-image');
var fs = require('fs');
var url = require('url');
var buffer = require('buffer/').Buffer;
app.use(cors());    
var bodyParser = require('body-parser');
var mimeTypes = require('mimetypes');
const {Storage} = require('@google-cloud/storage');
const storage = new Storage({
  projectId: 'qrgeneratorui',
  keyFilename: './qrgeneratorui-8c81253c6c6f.json'
});


app.use('/qrcode', express.static(process.cwd() + '/qrcode'));
app.use('/auto-zone', express.static(process.cwd() + '/auto-zone'));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
   extended: true
}));

app.get('/auto-zone', (req, res) => {
    res.sendFile('./auto-zone', { root: __dirname });
});
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
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
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //console.log(req.body.data);
    var image = buffer.from(JSON.stringify(req.body.data)).toString('base64');
    var qr_png = qr.imageSync(image,{ type: 'png',size: 2})
    // Generate a random file name 
    let qr_code_file_name = new Date().getTime() + '.png';



    bucket = storage.bucket('qrgenerator');

      // Upload the image to the bucket
      var file = bucket.file('qrcode/' + qr_code_file_name);

    file.save(qr_png, {
            metadata: { contentType: 'png' },
            public: true,
            validation: 'md5'
        }, function(error) {
             console.log(error);
            if (error) {
                return res.serverError('Unable to upload the image.');
            }
           const publicUrl = `https://storage.googleapis.com/${bucket.name}/qrcode/${qr_code_file_name}`;
            return res.json({'qrCodeURL': publicUrl});
        });
    //return  res.json({'qrCodeURL':file});
});

app.listen(port);
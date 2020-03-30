const port = 3002;

var express = require('express'),
    app = express();
const cors = require('cors');
var fs = require('fs');
var url = require('url');
var chmodr = require('chmodr');

app.use(cors())    
var bodyParser = require('body-parser');
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

app.post('/',function(req,res){
	var requrl = url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.originalUrl,
});
     res.setHeader('Access-Control-Allow-Origin', '*');
   let base64String = req.body[0].data; // Not a real image
    let base64Image = base64String.split(';base64,').pop();
    let filename =  makeid(7);
    chmodr('qrcode/', 0o777, (err) => {
      if (err) {
        console.log('Failed to execute chmod', err);
      } else {
        console.log('Success');
      }
    });
     fs.writeFile('qrcode/'+filename+'.png', base64Image, {encoding: 'base64'}, function(err) {
	    console.log('File created');
	});
    res.json({'qrCodeURL':requrl+'qrcode/'+filename+'.png'});
});

app.listen(port);
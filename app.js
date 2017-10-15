// node packages
let express = require("express");
let jade = require("jade");
//
let xfile = require("./src/business/xfile/xfile");

let app = express();

let src = __dirname + '/src';
app.use(express.static(src));

app.set('views', `${__dirname}/src/views`);
app.set('view engine', 'jade');

app.get('/', (req, res) => {
  let jadeOptions = {
      title:'xFile Demo'
  };
  res.render('index.jade', jadeOptions);
});

app.get('/result', (req, res) => {
    let xFileDirectory = req.query.path? req.query.path : null;
    let xFileOptions = {
        mtime:req.query.mtime? req.query.mtime : null,
        name:req.query.name? req.query.name : null,
        size:req.query.size? req.query.size : null,
        text:req.query.text? req.query.text : null,
    };

    let fileList = [];

    xfile.filter(xFileDirectory, xFileOptions).then((files)=>{
        fileList = files;

        let jadeOptions = {
            fileList:fileList,
        };

        res.render('file-list/file-list.jade', jadeOptions);
    });
});

app.listen(3000);
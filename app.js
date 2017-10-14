let xfile = require('./src/business/file.service');

let express = require('express');
let app = express();

app.set('views', `${__dirname}/src/views`);
app.set('view engine', 'jade');

app.get('/', (req, res) => {
  let jadeOptions = {
    title: 'xFile Demo',
    checkResult: xfile.filter('E:\\node.js\\FileFilter'),
  };
  res.render('index.jade', jadeOptions);
});

app.listen(3000);
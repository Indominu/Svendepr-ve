const fs = require('fs');
const pdf = require('html-pdf');

exports.getFile = (req, res, file) => {
    fs.readFile(`.${file}`, (err, html) => {
        if (err) throw err

        res.write(html);
        res.end();
    });
};

exports.report = (req, res, body) => {
   pdf.create(body, { format: 'Legal', orientation: "landscape" }).toFile('./test.pdf', function() {
       res.end(JSON.stringify("New report created"));
    });
};

exports.invalidRequest = (req, res) => {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Invalid Request');
};
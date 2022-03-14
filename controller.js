const http = require('http');
const url = require('url')
const NodeCache = require('node-cache');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const service = require('./service.js');
const dbService = require('./services/dbService');

const cache = new NodeCache({ stdTTL: 600 });

module.exports = http.createServer(async (req, res) => {

    const reqUrl = url.parse(req.url, true);
    let verified = false;

    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        const token = req.headers.authorization.split(' ')[1];
        verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
    }

    if (req.method === 'GET') {

        switch (reqUrl.pathname) {
            case '/':
                service.getFile(req, res, '/index.html');
                break;
            default:
                service.getFile(req, res, reqUrl.pathname);
                //service.invalidRequest(req, res);
                break;
        }

    } else if (req.method === 'POST') {

        res.setHeader('Content-Type', 'application/json');
        const buffers = [];

        for await (const chunk of req) {
            buffers.push(chunk);
        }

        const body = JSON.parse(Buffer.concat(buffers).toString())

        if (reqUrl.pathname === '/login') {
            dbService.login(req, res, body);
            //dbService.login(req, res, body).then((cacheData) => cache.set('allPosts', cacheData));
            return;
        }

        if (verified) {
            switch (reqUrl.pathname) {
                case '/register':
                    dbService.register(req, res, body);
                    break;
                case '/insert':
                    dbService.insert(req, res, body);
                    break;
                case '/search':
                    dbService.search(req, res, body);
                    break;
                case '/fields':
                    dbService.fields(req, res, body);
                    break;
                case '/report':
                    service.report(req, res, body);
                    break;
                default:
                    service.invalidRequest(req, res);
                    break;
            }
        } else {
            service.invalidRequest(req, res);
        }
    }

    function getBodyData() {

        let posts = cache.get(reqUrl.pathname);

        if (posts != null) {
            res.statusCode = 200;
            res.end(JSON.stringify(posts));
            return;
        }
    }

});
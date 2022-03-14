const {MongoClient, ServerApiVersion} = require("mongodb");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@cluster0.eotfv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
let client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1});
const fieldsNotToShow = ['_id', 'created', 'updated'];
let dbo;

;(async () => {
    client = await client.connect();
    dbo = client.db(process.env.DB_NAME);
})()

exports.create = (req, res, body) => {

    dbo.createCollection(body.table, (error, result) => {
        if (error) throw error;
        res.statusCode = 200;
        res.end();
    });
};

exports.login = async (req, res, body) => {
    const user = await dbo.collection(body.table).findOne({name: body.data.name});
    let result;

    if (user && (await bcrypt.compare(body.data.password, user.password))) {

        result = jwt.sign(
            { user_id: user._id, name: user.name },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "2h",
            }
        );

        res.statusCode = 200;
    } else {
        res.statusCode = 401;
        result = "Invalid Credentials";
    }

    res.end(JSON.stringify(result));
};

exports.register = async (req, res, body) => {
    const user = await dbo.collection(body.table).findOne({name: body.data.name});
    let result;

    if (user) {
        res.statusCode = 409;
        result = "User Already Exist";
    } else {
        body.data.password = await bcrypt.hash(body.data.password, 10);

        dbo.collection(body.table).insertOne(body.data);

        res.statusCode = 200;
        result = "New user created";
    }

    res.end(JSON.stringify(result));
};

exports.search = (req, res, body) => {

    const projection  = fieldsNotToShow.reduce((o, val) => { o[val] = 0; return o; }, {});
    dbo.collection(body.table).find(body.data).project(projection).toArray((error, result) => {
        if (error) throw error;
        res.statusCode = 200;
        res.end(JSON.stringify(result));
    });
};

exports.insert = (req, res, body) => {

    dbo.collection(body.table).insertOne(body.data, (error, result) => {
        if (error) throw error;
        res.end(JSON.stringify("New product registered"));
    });
};

exports.fields = (req, res, body) => {

    dbo.collection(body.table).find().limit(1000).forEach((doc) => {
        fieldValues(doc, body.table).then((result) => {
            res.statusCode = 200;
            res.end(JSON.stringify(result));
        });
    });
};

async function fieldValues(doc, table) {
    let keys = [];

    for (let key in doc){
        if(keys.indexOf(key) < 0 && !fieldsNotToShow.includes(key) && key !== 'merchandise'){

            keys.push(new Promise((resolve, reject) => {

                dbo.collection(table).distinct(key, (error, result) => {
                    if (error) reject(error);
                    else resolve({field: key, values: result});
                });
            }))
        }
    }

    return await Promise.all(keys);
}

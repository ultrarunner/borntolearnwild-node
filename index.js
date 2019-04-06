const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
    throw result.error;
}
// console.log(result.parsed);
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Parser = require('rss-parser');
const request = require('request');

const app = express();
const parser = new Parser();
const asyncMiddleware = require('./utils/asyncMiddleware')
const _defaultTake = 7;

app.use(cors());
// used to parse the body of the request
app.use(bodyParser.urlencoded({
    extended: true
}));

// asynchronous call with try/catch embeddded
app.get('/v1/rss', async (req, res, next) => {
    try {
        const feedUrl = req.query.url;
        const feed = await parser.parseURL(feedUrl);
        res.send(feed);
    } catch (e) {
        next(e);
    }
});

app.get('/v2/public', asyncMiddleware(async (req, res, next) => {
    var fileFeeds = require('./files/feeds.json');
    res.send(fileFeeds.feeds);
}));

// rss feeds api
app.get('/v2/rss', asyncMiddleware(async (req, res, next) => {
    let feed = {};
    const feedUrl = req.query.url;
    if (!feedUrl) {
        res.status(500).send('Missing URL parameter...');
    }
    const take = Number(req.query.take || _defaultTake) + 1;
    try {
        feed = await parser.parseURL(feedUrl);
        const topEntries = feed.items.slice(1, take);
        feed.items = topEntries;
    } catch (e) {
        console.log('An error occured while trying to parse the following RSS feed: ' + feedUrl);
    }
    res.send(feed);
}));

// nasa api
app.get('/v2/nasa', asyncMiddleware(async (req, res, next) => {
    const apikey = process.env.APIKEY_NASA;
    const apiURL = `https://api.nasa.gov/planetary/apod?api_key=${apikey}`;
    let feed = {};
    request.get({
        url: apiURL,
    }, (err, response, body) => {
        try {
            feed = JSON.parse(body);
            const take = Number(req.query.take || _defaultTake) + 1;
            const topEntries = feed.results.slice(1, take);
            feed.results = topEntries;
        } catch (e) {
            console.log('An error occured while trying to call the NASA API: ' + apiURL);
        }
        res.status(200).send(feed);
    })
}));

// new york times api
app.get('/v2/nyt/:section', asyncMiddleware(async (req, res, next) => {
    const apikey = process.env.APIKEY_NYT;
    const section = req.params.section;
    const take = req.params.take || _defaultTake;
    const apiURL = `https://api.nytimes.com/svc/topstories/v2/${section}.json`;
    let feed = {};
    if (!section) {
        res.status(500).send('Missing SECTION parameter...');
    }
    request.get({
        url: apiURL,
        qs: {
            'api-key': apikey,
            'take': take
        },
    }, (err, response, body) => {
        try {
            feed = JSON.parse(body);
            const take = Number(req.query.take || _defaultTake) + 1;
            const topEntries = feed.results.slice(1, take);
            feed.results = topEntries;
        } catch (e) {
            console.log('An error occured while trying to call the New York Times API: ' + apiURL);
            console.log(body);
        }
        res.status(200).send(feed);
    })
}));

var server = app.listen(3000, () => {
    const port = server.address().port;
    console.log(`Server running at http://localhost:${port}`);
});
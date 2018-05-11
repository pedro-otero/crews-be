`master-express` is an Express application that finds Spotify album credits in [Discogs](1). It exposes one endpoint that, given the album id, requests the album data from [Spotify API](2) and immediately after searches for it in Discogs. As it finds credits for it, it updates the Redux store with such information.

Application keys are needed for both [Spotify](2) and [Discogs](3).

Application is deployed at [Heroku](12)

[Try it out](11)

# Configuration

The app accepts the following environment configuration variables:

|Name          |Description|Required|Default|
|--------------|-----------|--------|-------|
|consumerKey   |Discogs `consumerKey` value, given when an app is created in the [Discogs developers site](3)|:white_check_mark:||
|consumerSecret|Discogs `consumerSecret` value, given when an app is created in the [Discogs developers site](3)|:white_check_mark:||
|throttleTime|Amount of milliseconds that the general queue of Discogs takes between operations. This is related to [Discogs API rate limits](6)||1100 (this is also the __recommended__ value)|
|PAUSE_NEEDED_AFTER_429|Amount of milliseconds that the queue of operations is paused after getting 429 from Discogs. That means that no Discogs requests are performed during that time||30000|
|clientId|Given by Spotify when creating a [new application](3)|:white_check_mark:||
|clientSecret|Given by Spotify when creating a [new application](3)|:white_check_mark:||
|clientId|Given by Spotify when creating a [new application](3)|:white_check_mark:||
|PORT|Port where Express listens to requests||3001|
|CORS_ALLOW_ORIGIN|Value of the `Access-Control-Allow-Origin` header in the response||`*`|

# Usage

1. Clone repo and  `npm install`
2. Create your [Spotify](2) and [Discogs](3) applications and have their keys handy
3. Drop your env vars in a `.env` file.
4. Run `npm start`.
4. Request an album at `localhost:<PORT>/data/album/:spotifyAlbumId`

You'll notice the app responds very quickly to the client with an empty `bestMatch` with 0 progress. That just means the search started. You can keep requesting the album and check how the progress goes, but the console will also inform you about it. Ideally, a web client should poll the endpoint to find out about new data and stop when `progress` is 100. Since the Discogs API is the main limitant here and it's restricted to one request per second, it's not recommended to request the album more than once per second, since there won't be anything new before that.

Once the search finishes the data remains in the Redux store for as long as the app is in memory, so subsequent requests for the album should show all the data found about the album.

# Search logic

The Discogs API exposes a [search endpoint](4). The details of the results then have to be fetched one by one using the [release endpoint](5).

Discogs API requests are [limited](6). Some albums can throw tens and even hundreds of results. This can make some searches very long to complete. It is possible though, and considerably likely, that the first results are the most relevant. With this in mind the app exhibits the following behaviors:

- All the requests made to Discogs are throttled to avoid reaching the limit. I made a specific NPM package ([throxy](7)) solely for this.
- The `429 Too Many Requests` has still been observed rarely (known issue) so it's handled.
- The album endpoint response has a `progress` value. This does not reflect found data, just how many __operations__ have been performed to complete the search. The total amount of operations is given by the sum of the times the Discogs search endpoint has to be called and the amount of releases that need to be individually requested.
- The album endpoint response has a `bestMatch` object that contains all the found data for the album. Subsequent requests to the album endpoint will have it updated or not as the `progress` increases.
- Search operations are performed in strict sequential behavior. Otherwise a single search would hog the operations queue (the one that [throxy](7) handles).

Clients are suppossed to poll the album endpoint until `progress` reaches 100. All this also allows to start many searches at the same time and use the Discogs API resources efficiently for all the clients.

# Logging

The app outputs info about the searches both to console and to disk (`/log` folder). In the console, a tag with the name of the album and artist being searched lets you know what every message is about. On disk, the logs folder contains a file for every album. The name of such file is the Spotify album ID. Logging is done using [winston](8)

# Tests

Test are contained in `*.spec.js` files along the module they're testing. Frameworks used are [mocha](10), [sinon](9) and Node's [assert](8).


[1]:https://www.discogs.com/
[2]:https://beta.developer.spotify.com/documentation/web-api/
[3]:https://www.discogs.com/developers/
[4]:https://www.discogs.com/developers/#page:database,header:database-search
[5]:https://www.discogs.com/developers/#page:database,header:database-release
[6]:https://www.discogs.com/developers/#page:home,header:home-rate-limiting
[7]:https://www.npmjs.com/package/throxy
[7]:https://github.com/winstonjs/winston
[8]:https://nodejs.org/api/assert.html
[9]:https://github.com/sinonjs/sinon
[10]:https://github.com/mochajs/mocha
[11]:http://master-express.herokuapp.com/data/album/3e3PxWKqv7lyZaR5d02abW
[12]:http://master-express.herokuapp.com

const SpotifyWebApi = require('spotify-web-api-node');

const spotifyConfig = require('../../spotify-config.json');

const spotifyApi = new SpotifyWebApi({
  clientId: spotifyConfig.keys.consumer,
  clientSecret: spotifyConfig.keys.secret,
  redirectUri: spotifyConfig.urls.redirect
});

const api = new Promise(function (resolve, reject) {
  spotifyApi.clientCredentialsGrant().then(response => {
    if (response.statusCode == 200) {
      const token = response.body.access_token;
      spotifyApi.setAccessToken(token);
      console.log('Spotify client authenticated succesfully');
      resolve(spotifyApi)
    } else {
      console.log('ERRROR AUTHENTICATING ' + JSON.stringify(response));
      reject(response);
    }
  });
});

module.exports = api;
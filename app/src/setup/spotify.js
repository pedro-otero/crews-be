const winston = require('winston');

const spotifyConfig = require('../../../spotify-config.json');

const { printf, combine } = winston.format;
const logger = winston.createLogger({
  level: 'info',
  format: combine(printf(info => `${info.message}`)),
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports = (SpotifyWebApi) => {
  let token;
  let lastLogin;
  let expiresIn;
  const spotifyApi = new SpotifyWebApi({
    clientId: spotifyConfig.keys.consumer,
    clientSecret: spotifyConfig.keys.secret,
    redirectUri: spotifyConfig.urls.redirect,
  });

  const promise = () => new Promise((resolve, reject) => {
    spotifyApi.clientCredentialsGrant().then((response) => {
      if (response.statusCode === 200) {
        token = response.body.access_token;
        lastLogin = new Date();
        expiresIn = response.body.expires_in;
        spotifyApi.setAccessToken(token);
        logger.info('Spotify client authenticated succesfully');
        resolve(spotifyApi);
      } else {
        logger.error(`ERROR AUTHENTICATING ${JSON.stringify(response)}`);
        reject(response);
      }
    }, reject).catch(reject);
  });

  return {
    getApi: () => new Promise(((resolve, reject) => {
      if (token) {
        resolve(spotifyApi);
      } else {
        promise().then(resolve, reject).catch(reject);
      }
    })),
  };
};

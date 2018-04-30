const winston = require('winston');

const spotifyConfig = require('../../../spotify-config.json');

const { printf, combine, timestamp } = winston.format;
const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), printf(info => `${info.timestamp} ${info.message}`)),
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports = (SpotifyWebApi) => {
  let token;
  let lastLogin;
  let expiresIn;
  let activeIntent;

  const spotifyApi = new SpotifyWebApi({
    clientId: spotifyConfig.keys.consumer,
    clientSecret: spotifyConfig.keys.secret,
    redirectUri: spotifyConfig.urls.redirect,
  });

  const loggedIn = () => {
    if (token) {
      const now = new Date().getTime();
      return (now - lastLogin) < expiresIn;
    }
    return false;
  };

  const deactivateIntent = reject => (error) => {
    reject(error);
    activeIntent = null;
  };

  const login = () => new Promise((resolve, reject) => {
    spotifyApi.clientCredentialsGrant().then((response) => {
      if (response.statusCode === 200) {
        token = response.body.access_token;
        lastLogin = new Date().getTime();
        expiresIn = response.body.expires_in * 1000;
        spotifyApi.setAccessToken(token);
        logger.info('Spotify client authenticated succesfully');
        resolve(spotifyApi);
      } else {
        logger.error(`ERROR AUTHENTICATING ${JSON.stringify(response)}`);
        reject(response);
      }
      activeIntent = null;
    }, deactivateIntent(reject)).catch(deactivateIntent(reject));
  });

  activeIntent = login();

  return {
    getApi: () => {
      if (loggedIn()) {
        return Promise.resolve(spotifyApi);
      }
      if (!activeIntent) {
        activeIntent = login();
      }
      return activeIntent;
    },
  };
};

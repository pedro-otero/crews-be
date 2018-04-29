const spotifyErrorMessages = require('./spotify-errors');

const searchPage = data => ({
  type: 'search',
  data,
});

module.exports = ({
  loginError: () => Error(spotifyErrorMessages.login),

  albumRejection: (reason) => {
    const code = String(reason.statusCode);
    if (code in spotifyErrorMessages.http) {
      return Error(spotifyErrorMessages.http[code]);
    }
    return Error(spotifyErrorMessages.general);
  },

  isTimeout: ({ code, errno }) => code === 'ETIMEDOUT' && errno === 'ETIMEDOUT',

  is429: ({ statusCode }) => statusCode === 429,

  sleep: time => new Promise(resolve => setTimeout(resolve, time)),

  isThereNext: ({ pagination: { page, pages } }) => page < pages,

  searchPage,

  searchNext: page => searchPage(page.pagination.page + 1),

  releaseTask: data => ({
    type: 'release',
    data,
  }),
});

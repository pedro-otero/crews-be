const searchPage= data => ({
  type: 'search',
  data,
});

module.exports = ({
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

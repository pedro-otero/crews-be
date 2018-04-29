const indicator = (current, total) => `${current}/${total}`;

module.exports = {

  resultsMsg: (tag, pageObject) => {
    const {
      pagination: { page, pages },
      results,
    } = pageObject;
    return `${tag} P ${indicator(page, pages)}: ${results.length} items`;
  },

  releaseMsg: (tag, release, lastPage, currentTask) => {
    const {
      pagination: { page, pages },
      results,
    } = lastPage;
    const { id: rId, master_id: masterId } = release;
    return `${tag} P(${indicator(page, pages)}) I(${indicator(currentTask.data + 1, results.length)}) R-${rId} (M-${masterId}) OK`;
  },

  albumMismatch: (tag, release, album) => `${tag} R-${release.id} tracklist length (${release.tracklist.length}) does not match the album's (${album.tracks.items.length})`,

  searchPageTimeout: (tag, page) => `${tag} SEARCH P-${page} TIMEOUT`,

  releaseTimeout: (tag, releaseId, releaseNumber, releasesLength) => `${tag} R-${releaseId} P-(${indicator(releaseNumber, releasesLength)}) TIMEOUT`,

  exception: (tag, error) => `${tag} EXCEPTION. Search removed. ${error}`,

  tooManyRequests: (tag, waitMs) => `${tag} A 429 was thrown (too many requests). Search will pause for ${waitMs / 1000}s`,

  finish: tag => `${tag} FINISHED`,
};

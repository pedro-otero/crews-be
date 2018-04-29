const indicator = (current, total) => `${current}/${total}`;

module.exports = tag => ({

  resultsMsg: (pageObject) => {
    const {
      pagination: { page, pages },
      results,
    } = pageObject;
    return `${tag} P ${indicator(page, pages)}: ${results.length} items`;
  },

  releaseMsg: (release, releaseNumber, lastPage) => {
    const {
      pagination: { page, pages },
      results,
    } = lastPage;
    const { id: rId, master_id: masterId } = release;
    return `${tag} P(${indicator(page, pages)}) I(${indicator(releaseNumber, results.length)}) R-${rId} (M-${masterId}) OK`;
  },

  albumMismatch: (release, album) => `${tag} R-${release.id} tracklist length (${release.tracklist.length}) does not match the album's (${album.tracks.items.length})`,

  searchPageTimeout: page => `${tag} SEARCH P-${page} TIMEOUT`,

  releaseTimeout: (releaseId, releaseNumber, releasesLength) => `${tag} R-${releaseId} P-(${indicator(releaseNumber, releasesLength)}) TIMEOUT`,

  exception: error => `${tag} EXCEPTION. Search removed. ${error}`,

  tooManyRequests: waitMs => `${tag} A 429 was thrown (too many requests). Search will pause for ${waitMs / 1000}s`,

  finish: () => `${tag} FINISHED`,
});

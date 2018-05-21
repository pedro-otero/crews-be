const indicator = (current, total) => `${current}/${total}`;

module.exports = album => ({

  results: (pageObject) => {
    const {
      pagination: { page, pages },
      results,
    } = pageObject;
    return `P ${indicator(page, pages)}: ${results.length} items`;
  },

  release: (release, releaseNumber, lastPage) => {
    const {
      pagination: { page, pages },
      results,
    } = lastPage;
    const { id: rId, master_id: masterId } = release;
    return `P(${indicator(page, pages)}) I(${indicator(releaseNumber, results.length)}) R-${rId} (M-${masterId}) OK`;
  },

  albumMismatch: release => `R-${release.id} tracklist length (${release.tracklist.length}) does not match the album's (${album.tracks.length})`,

  searchPageTimeout: page => `SEARCH P-${page} TIMEOUT`,

  releaseTimeout: (releaseId, releaseNumber, releasesLength) => `R-${releaseId} P-(${indicator(releaseNumber, releasesLength)}) TIMEOUT`,

  exception: error => `EXCEPTION. Search removed. ${error}`,

  tooManyRequests: waitMs => `A 429 was thrown (too many requests). Search will pause for ${waitMs / 1000}s`,

  finish: () => 'FINISHED',
});

const indicator = (current, total) => `${current}/${total}`;

const tag = album => `${new Date().toLocaleString()} ${album.artists[0].name} - ${album.name} (${album.id}) ::`;

module.exports = album => ({

  results: (pageObject) => {
    const {
      pagination: { page, pages },
      results,
    } = pageObject;
    return `${tag(album)} P ${indicator(page, pages)}: ${results.length} items`;
  },

  release: (release, releaseNumber, lastPage) => {
    const {
      pagination: { page, pages },
      results,
    } = lastPage;
    const { id: rId, master_id: masterId } = release;
    return `${tag(album)} P(${indicator(page, pages)}) I(${indicator(releaseNumber, results.length)}) R-${rId} (M-${masterId}) OK`;
  },

  albumMismatch: release => `${tag(album)} R-${release.id} tracklist length (${release.tracklist.length}) does not match the album's (${album.tracks.items.length})`,

  searchPageTimeout: page => `${tag(album)} SEARCH P-${page} TIMEOUT`,

  releaseTimeout: (releaseId, releaseNumber, releasesLength) => `${tag(album)} R-${releaseId} P-(${indicator(releaseNumber, releasesLength)}) TIMEOUT`,

  exception: error => `${tag(album)} EXCEPTION. Search removed. ${error}`,

  tooManyRequests: waitMs => `${tag(album)} A 429 was thrown (too many requests). Search will pause for ${waitMs / 1000}s`,

  finish: () => `${tag(album)} FINISHED`,
});

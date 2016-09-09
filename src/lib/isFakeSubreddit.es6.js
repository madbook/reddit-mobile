const randomSubs = ['random', 'randnsfw', 'myrandom'];
const fakeSubs = ['all', 'mod', 'friends'].concat(randomSubs);

export { fakeSubs, randomSubs };

export default function isFakeSubreddit(subredditName) {
  return !!subredditName && (
    subredditName.indexOf('+') > -1 ||
    subredditName.indexOf('-') > -1 ||
    fakeSubs.includes(subredditName)
  );
}

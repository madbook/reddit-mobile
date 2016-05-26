const RANDOM_SUBS = ['random', 'randnsfw', 'myrandom'];
const FAKE_SUBS = ['all', 'mod', 'friends'].concat(RANDOM_SUBS);

export { FAKE_SUBS, RANDOM_SUBS };

export default function isFakeSubreddit(subredditName) {
  return (
    !subredditName ||                     // the frontpage
    subredditName.indexOf('+') > -1 ||    // multis
    subredditName.indexOf('-') > -1 ||    // reddit gold filtering
    FAKE_SUBS.includes(subredditName)     // special subreddits
  );
}

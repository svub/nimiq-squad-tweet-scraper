export const bearerToken = process.env.BEARER_TOKEN;
export const maxTweets = parseInt(process.env.MAX_TWEETS_PER_USER);
export const keepLog = (process.env.DETAILED_LOG ?? '').toLocaleLowerCase() === 'yes';
export const resultsFile = 'results.csv';
export const errorFile = 'errors.log';
export const detailedLog = 'detailed.log';

if (!bearerToken) throw new Error('Bearer token not found. Make sure you copied sample.env to .env and entered the right info in .env.')

export const options = {
  headers: {
    "User-Agent": "v2UserTweetsJS",
    "authorization": `Bearer ${bearerToken}`,
  }
}

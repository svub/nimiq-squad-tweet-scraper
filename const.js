export const bearerToken = process.env.BEARER_TOKEN;
export const maxTweets = parseInt(process.env.MAX_TWEETS_PER_USER);
export const keepLog = (process.env.FULL_LOG ?? '').toLocaleLowerCase() === 'yes';

if (!bearerToken) throw new Error('Bearer token not found. Make sure you copied sample.env to .env and entered the right info in .env.')

export const options = {
  headers: {
    "User-Agent": "v2UserTweetsJS",
    "authorization": `Bearer ${bearerToken}`,
  }
}

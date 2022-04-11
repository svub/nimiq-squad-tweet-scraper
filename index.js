import 'dotenv/config';
import { stringify } from 'csv-stringify/sync';
import { getUserTweets } from './twitter.js';
import { dir, log, warn } from 'console';
import { writeFile } from 'fs/promises';

const userIds = process.env.USER_IDS.split(',');
const maxTweetsPerUser = process.env.MAX_TWEETS_PER_USER;
const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
const startTime = `2022-${month}-01T00:00:00Z`; // YYYY-MM-DDTHH:mm:ssZ

let csv = stringify([['text', 'uid', 'name', 'date', 'type', 'flagged']]);
let count = 0;

log(`Let's do it. 🚀\nGetting up to ${maxTweetsPerUser} Tweets each for ${userIds.length} users starting from ${startTime}`);
if (userIds.length * maxTweetsPerUser / 100 > 900) warn('This might fail due to rate limiting.');

while (userIds.length > 0) {
  const userId = userIds.pop();
  const tweets = await getUserTweets(userId)
  count += tweets.length;

  // Text, uid, uName, time, type(Tweet,Retweet or Reply), flagged-as-sensitive?
  const transformed = tweets.map(tweet => [ tweet.text, tweet.author_id, tweet.author_name, tweet.created_at, (tweet.referenced_tweets ? tweet.referenced_tweets[0].type : 'tweet'), tweet.possibly_sensitive ] );
  csv += stringify(transformed);
};

await writeFile('results.csv', csv);

log(`Done. 🤓\nReceived ${count} Tweets. Results are stored in results.csv. `);


import 'dotenv/config';
import { stringify } from 'csv-stringify/sync';
import { getUserIds, getUserTweets } from './twitter.js';
import { log, warn } from 'console';
import { spawnSync } from 'child_process';
import { detailedLog, errorFile, keepLog, resultsFile } from './const.js';
import { rmSync, writeFileSync } from 'fs';

if (keepLog) rmSync(detailedLog, { force: true });

const maxTweetsPerUser = process.env.MAX_TWEETS_PER_USER;
const month = (new Date().getMonth()); // previous month
const year = new Date().getFullYear();
const startTime = `${year}-${month.toString().padStart(2, '0')}-01T00:00:00Z`; // YYYY-MM-DDTHH:mm:ssZ (ISO 8601/RFC 3339)
const endTime = `${year}-${(month + 1).toString().padStart(2, '0')}-01T00:00:00Z`;

let csv = stringify([['text', 'uid', 'name', 'date', 'type', 'flagged']]);
let errorLog = []
let count = 0;

const userIds = await getUserIds();

log("\nReady for lift-off! 🚀");
log(`Getting up to ${maxTweetsPerUser} Tweets between ${startTime} and ${endTime} for each of the ${userIds.length} user IDs`);
if (userIds.length * maxTweetsPerUser / 100 > 900) warn('Note: This might fail due to rate limiting.');
log("\nPress any key to continue or Ctrl+C to abort.");
spawnSync("read _ ", {shell: true, stdio: [0, 1, 2]});

while (userIds.length > 0) {
  const userId = userIds.pop();
  try {
    const tweets = await getUserTweets(userId, startTime, endTime)
    count += tweets.length;

    // Text, uid, uName, time, type(Tweet,Retweet or Reply), flagged-as-sensitive?
    const transformed = tweets.map(tweet => [ tweet.text, tweet.author_id, tweet.author_name, tweet.created_at, (tweet.referenced_tweets ? tweet.referenced_tweets[0].type : 'tweet'), tweet.possibly_sensitive ] );
    csv += stringify(transformed);
  } catch (e) {
    errorLog.push(e);
  }
};

await writeFileSync(resultsFile, csv);
await writeFileSync(errorFile, errorLog.join("\n"));

log(`Done. 🌟\nReceived ${count} Tweets. Results are stored in ${resultsFile}. Errors are stored in ${errorFile}.`);


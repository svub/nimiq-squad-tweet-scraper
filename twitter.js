// https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/quick-start

import { log, warn } from 'console';
import { appendFileSync } from 'fs';
import needle from 'needle';
import { maxTweets, options, keepLog } from './const.js';

export async function getUserTweets(userId, startTime, endTime) {
  const url = `https://api.twitter.com/2/users/${userId}/tweets`;
  let userTweets = [];


  let params = {
    "max_results": 100, // 100 is maximum possible
    "start_time": startTime,
    "end_time": endTime,
    "tweet.fields": "id,author_id,created_at,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets",
    "media.fields": "type,url",
    "expansions": "author_id", // requesting author_id expansion to retrieve user name
  }

  let hasNextPage = true;
  let nextToken = null;
  let userName;

  while (hasNextPage) {
    let resp = await getPage(url, params, options, nextToken);
    if (keepLog) appendFileSync('full.log', JSON.stringify(resp, undefined, ' ') + "\n");
    if (resp && resp.errors) {
      throw new Error(resp.errors[0].detail);
    }
    if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
      userName = resp.includes.users[0].username;
      if (resp.data) {
        resp.data.forEach(entry => entry.author_name = userName);
        userTweets.push(...resp.data);
      }
      if (resp.meta.next_token && userTweets.length < maxTweets) {
        nextToken = resp.meta.next_token;
      } else {
        hasNextPage = false;
      }
    } else {
      hasNextPage = false;
    }
  }

  log(`Got ${userTweets.length} Tweets from ${userName} (user ID ${userId}).`);
  return userTweets;
}

const getPage = async (url, params, options, nextToken) => {
  if (nextToken) {
    params.pagination_token = nextToken;
  }
  try {
    const resp = await needle('get', url, params, options);

    if (resp.statusCode != 200) {
      warn(`Request failed: ${resp.statusCode} ${resp.statusMessage}:\n${JSON.stringify(resp.body, undefined, ' ')}`);
      return;
    }
    return resp.body;
  } catch (error) {
    throw new Error(`Request failed: ${error}`);
  }
}

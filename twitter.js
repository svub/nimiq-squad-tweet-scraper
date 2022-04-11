// https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/quick-start

import { log, dir } from 'console';
import needle from 'needle';

const bearerToken = process.env.BEARER_TOKEN;
const maxTweets = parseInt(process.env.MAX_TWEETS_PER_USER);
if (!bearerToken) throw new Error('Bearer token not found. Make sure you copied sample.env to .env and entered the right info in .env.')

export async function getUserTweets(userId) {
  const url = `https://api.twitter.com/2/users/${userId}/tweets`;
  let userTweets = [];


  let params = {
    "max_results": 100, // 100 is maximum possible
    "tweet.fields": "id,author_id,created_at,geo,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets",
    "expansions": "author_id", // requesting author_id expansion to retrieve user name
  }

  const options = {
    headers: {
      "User-Agent": "v2UserTweetsJS",
      "authorization": `Bearer ${bearerToken}`,
    }
  }

  let hasNextPage = true;
  let nextToken = null;
  let userName;

  while (hasNextPage) {
    let resp = await getPage(url, params, options, nextToken);
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
      warn(`Request failed: ${resp.statusCode} ${resp.statusMessage}:\n${resp.body}`);
      return;
    }
    return resp.body;
  } catch (error) {
    throw new Error(`Request failed: ${error}`);
  }
}

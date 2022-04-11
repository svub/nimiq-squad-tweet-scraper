# Tweet scraper

> A command line tool to get all latest tweets for a list of IDs of Twitter users. Results will be stored as `results.csv`.

## Setup

Copy `sample.env` to `.env` and edit values as needed.

## Run

```sh
node index.js
```

## Rate limiting

Normal Twitter limit is 900 requests per 15 minutes. The API returns up to 100 Tweets per request. You can do the math. :) But the program will also write a warning if the rate limit could be hit.

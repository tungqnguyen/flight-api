/* eslint-disable max-len */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
const NodeCache = require('node-cache');
const filter = require('../utility/filter');
const util = require('../utility/util');

// stdTTL: time to live in seconds for every generated cache element.
const cache = new NodeCache({ stdTTL: 30 * 60 });

function set(req, res, next) {
  const url = util.getUrlFromRequest(req);
  const parsedUrl = new URL(url);
  const key = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
  // console.log('pathname', key);
  cache.set(key, res.locals.data);
}

function get(req, res, next) {
  const url = util.getUrlFromRequest(req);
  const parsedUrl = new URL(url);
  const link = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
  // expect raw data
  const content = cache.get(link);
  if (content) {
    console.log('found cache', content);
    res.locals.cachedData = content;
  }
  return next();
}

module.exports = { get, set };

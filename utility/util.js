const util = {
  getUrlFromRequest(req) {
    const url = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
    return url;
  },
  getParams(url) {
    const parsedUrl = new URL(url);
    const params = {};
    parsedUrl.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  },
};

module.exports = util;

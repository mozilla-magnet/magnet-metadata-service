const fetch = require('node-fetch');
const parser = require('./parser.js');
const jsdom = require('jsdom').jsdom;
const config = require('../config.js');
const parseContentType = require('content-type').parse;
const ICAL = require('ical.js');

/**
 * Wrapper around the function fetchAndParse that adds
 * two methods for pre and post processing
 */
function process(url) {
  return preProcess(url).then((preResult) => {
    if (preResult) {
      return Promise.resolve(preResult);
    }

    return fetchAndParse(url);
  }).then((metadata) => {
    return postProcess(url, metadata).then((result) => {
      return Promise.resolve(result);
    });
  });
}

function preProcess(url) {
  return Promise.resolve(null);
}

function postProcess(url, data) {
  return Promise.resolve(data);
}

const contentProcessors = {
  'text/html': function(url, finalUrl, res) {
    return new Promise((resolve) => {
      res.text().then((dom) => {
        var doc = jsdom(dom, {
          'userAgent': 'Gecko Like ;)'
        });
        resolve(doc);
      });
    }).then((doc) => {
      return parser.parse(finalUrl, doc);
    }).catch((err) => {
      console.info('Error parsing url ', url, ':: ', err);
    });
  },
  'text/calendar': function(url, finalUrl, res) {
    return res.text().then((ical) => {
      const jcal = ICAL.parse(ical);
      const icalComponent = new ICAL.Component(jcal);
      const events = icalComponent.getAllSubcomponents('vevent').map(vevent => new ICAL.Event(vevent));


      const calendarEvents = events.map(function(event) {
        return {
          summary: event.summary,
          description: event.description,
          organizer: event.organizer,
          attendee_count: event.attendees.length,
          duration_seconds: event.duration.toSeconds(),
          start: event.startDate.toJSDate().getTime() / 1000,
          end: event.endDate.toJSDate().getTime() / 1000,
          location: event.location
        };
      });

      const metadata = {
        type: 'calendar',
        calendar: calendarEvents
      };

      return metadata;
    });
  }
}

/**
 * Given a url string, fetch the contents and tryies to build a jsdom
 * object with the result to send it to the parsing module.
 */
function fetchAndParse(url) {
  var finalUrl = url;
  return fetch(url, {
    timeout: config.fetch_timeout || 3000,
    headers: {
        // Pretend to be Chrome for UA sniffing sites
        "User-Agent":
            "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36" }
  }).then((res) => {
    if (res.status !== 200) {
      return null;
    }

    // After following redirections keep the final url
    if (res.url !== finalUrl) {
      finalUrl = res.url;
    }

    const contentType = parseContentType(res.headers.get("content-type") || "text/html").type;

    if (contentType in contentProcessors) {
      const contentProcessor = contentProcessors[contentType];

      return contentProcessor(url, finalUrl, res);
    }

    console.log("Unkown content type");
    return null;
  });
}

function refresh(url) {
  return Promise.resolve(true);
}

module.exports = {
  process,
  refresh
};


/**
 * Dependencies
 */

const ICAL = require('ical.js');

/**
 * Exports
 */

module.exports = function(response) {
  const jcal = ICAL.parse(response.body);
  const icalComponent = new ICAL.Component(jcal);
  const name = icalComponent.getFirstPropertyValue('x-wr-calname');
  const events = icalComponent
    .getAllSubcomponents('vevent')
    .map(vevent => new ICAL.Event(vevent));

  const calendarEvents = events.map(event => {
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

  return {
    type: 'calendar',
    title: name,
    calendar: calendarEvents
  };
};

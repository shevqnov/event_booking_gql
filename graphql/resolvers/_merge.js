const Event = require('../../models/event')
const User = require('../../models/user')
const { formatDate } = require('../../helpers')

const events = eventIds =>
  Event.find({ _id: { $in: eventIds } })
    .then(events => events.map(event => transformEvent(event)))
    .catch(err => {
      throw err
    })

const user = userId =>
  User.findById(userId)
    .then(user => ({ ...user._doc, id: user.id, createdEvents: events.bind(this, user._doc.createdEvents) }))
    .catch(err => {
      throw err
    })

const singleEvent = async eventId => {
  try {
    const event = await Event.findById(eventId)
    return transformEvent(event)
  } catch (err) {
    throw err
  }
}

const transformEvent = event => ({
  ...event._doc,
  _id: event.id,
  creator: user.bind(this, event._doc.creator),
  date: formatDate(event._doc.date)
})

const transformBooking = booking => ({
  ...booking._doc,
  _id: booking.id,
  user: user.bind(this, booking._doc.user),
  event: singleEvent.bind(this, booking._doc.event),
  createdAt: formatDate(booking._doc.createdAt),
  updatedAt: formatDate(booking._doc.updatedAt)
})

const transformUser = user => ({ ...user._doc, _id: user.id })

module.exports = {
  transformBooking,
  transformEvent,
  transformUser
}

const Event = require('../../models/event')
const User = require('../../models/user')
const { formatDate } = require('../../helpers')
const { transformEvent } = require('./_merge')

exports.eventQuery = {
  // @TODO: rewrite all promise chains to async/await constructions
  events: () =>
    Event.find()
      .populate('creator')
      .then(events => events.map(event => transformEvent(event)))
      .catch(err => {
        throw err
      })
}

exports.eventMutation = {
  createEvent: ({ eventInput }, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated')
    }
    const event = new Event({
      ...eventInput,
      date: formatDate(eventInput.date),
      creator: req.userId
    })
    let createdEvent
    return event
      .save()
      .then(event => {
        createdEvent = transformEvent(event)
        return User.findById(req.userId)
      })
      .then(user => {
        if (!user) throw new Error('User donesn\'t exists')
        user.createdEvents.push(event)
        return user.save()
      })
      .then(() => createdEvent)
      .catch(err => {
        throw err
      })
  }
}

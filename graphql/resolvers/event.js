const Event = require('../../models/event')
const User = require('../../models/user')
const { formatDate } = require('../../helpers')
const { transformEvent } = require('./_merge')

module.exports = {
  // @TODO: rewrite all promise chains to async/await constructions
  events: () =>
    Event.find()
      .populate('creator')
      .then(events => events.map(event => transformEvent(event)))
      .catch(err => {
        throw err
      }),

  createEvent: ({ eventInput }) => {
    const event = new Event({
      ...eventInput,
      date: formatDate(eventInput.date),
      creator: '5cc5778b6cfad52093c70035'
    })
    let createdEvent
    return event
      .save()
      .then(event => {
        createdEvent = transformEvent(event)
        // hardcoded while hadn't auth
        return User.findById('5cc5778b6cfad52093c70035')
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

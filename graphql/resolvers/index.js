const bcrypt = require('bcryptjs')

const Event = require('../../models/event')
const User = require('../../models/user')

const user = userId =>
  User.findById(userId)
    .then(user => ({ ...user._doc, id: user.id, createdEvents: events.bind(this, user._doc.createdEvents) }))
    .catch(err => {
      throw err
    })
const events = eventIds =>
  Event.find({ _id: { $in: eventIds } })
    .then(events =>
      events.map(event => ({
        ...event._doc,
        _id: event.id,
        creator: user.bind(this, event._doc.creator),
        date: new Date(event._doc.date).toISOString()
      }))
    )
    .catch(err => {
      throw err
    })

module.exports = {
  events: () =>
    Event.find()
      .populate('creator')
      .then(events =>
        events.map(event => ({
          ...event._doc,
          _id: event.id,
          creator: user.bind(this, event._doc.creator),
          date: new Date(event._doc.date).toISOString()
        }))
      )
      .catch(err => {
        throw err
      }),
  createEvent: ({ eventInput }) => {
    const event = new Event({
      ...eventInput,
      date: new Date(eventInput.date),
      creator: '5cc5432ef89d4318e167fd3f'
    })
    let createdEvent
    return event
      .save()
      .then(event => {
        createdEvent = {
          ...event._doc,
          _id: event.id,
          creator: user.bind(this, event._doc.creator),
          date: new Date(event._doc.date).toISOString()
        }
        return User.findById('5cc5432ef89d4318e167fd3f')
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
  },
  createUser: ({ userInput: { email, password } }) =>
    User.findOne({ email })
      .then(user => {
        if (user) throw new Error('User alredy exists')
        return bcrypt.hash(password, 12)
      })
      .then(password =>
        new User({
          email,
          password
        }).save()
      )
      .then(user => ({ ...user._doc, _id: user.id }))
      .catch(err => {
        throw err
      })
}

const bcrypt = require('bcryptjs')

const Event = require('../../models/event')
const User = require('../../models/user')
const Booking = require('../../models/booking')

const formatDate = timestamp => new Date(timestamp).toISOString()
const user = userId =>
  User.findById(userId)
    .then(user => ({ ...user._doc, id: user.id, createdEvents: events.bind(this, user._doc.createdEvents) }))
    .catch(err => {
      throw err
    })
const singleEvent = async eventId => {
  try {
    const event = await Event.findById(eventId)
    return { ...event._doc, _id: event.id, creator: user.bind(this, event.creator), date: formatDate(event._doc.date) }
  } catch (err) {
    throw err
  }
}
const events = eventIds =>
  Event.find({ _id: { $in: eventIds } })
    .then(events =>
      events.map(event => ({
        ...event._doc,
        _id: event.id,
        creator: user.bind(this, event._doc.creator),
        date: formatDate(event._doc.date)
      }))
    )
    .catch(err => {
      throw err
    })

module.exports = {
  // @TODO: rewrite all promise chains to async/await constructions
  events: () =>
    Event.find()
      .populate('creator')
      .then(events =>
        events.map(event => ({
          ...event._doc,
          _id: event.id,
          creator: user.bind(this, event._doc.creator),
          date: formatDate(event._doc.date)
        }))
      )
      .catch(err => {
        throw err
      }),
  // like that
  bookings: async () => {
    try {
      const bookings = await Booking.find()
      return bookings.map(booking => ({
        ...booking._doc,
        _id: booking.id,
        user: user.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: formatDate(booking._doc.createdAt),
        updatedAt: formatDate(booking._doc.updatedAt)
      }))
    } catch (err) {
      throw err
    }
  },

  createEvent: ({ eventInput }) => {
    const event = new Event({
      ...eventInput,
      date: formatDate(eventInput.date),
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
          date: formatDate(event._doc.date)
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
      }),
  bookEvent: async ({ eventId }) => {
    try {
      const event = await Event.findOne({ _id: eventId })
      const booking = new Booking({
        user: '5cc5432ef89d4318e167fd3f',
        event
      })
      const newBooking = await booking.save()
      return {
        ...newBooking._doc,
        _id: newBooking.id,
        user: user.bind(this, newBooking._doc.user),
        event: singleEvent.bind(this, newBooking._doc.event),
        createdAt: formatDate(newBooking._doc.createdAt),
        updatedAt: formatDate(newBooking._doc.updatedAt)
      }
    } catch (err) {
      throw err
    }
  },
  cancelBooking: async ({ bookingId }) => {
    try {
      const booking = await Booking.findById(bookingId).populate('event')
      const event = {
        ...booking.event._doc,
        _id: booking.event.id,
        creator: user.bind(this, booking.event._doc.creator)
      }
      await Booking.deleteOne({ _id: bookingId })
      return event
    } catch (err) {
      throw err
    }
  }
}

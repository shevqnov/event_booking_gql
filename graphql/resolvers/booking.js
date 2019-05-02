const Booking = require('../../models/booking')
const Event = require('../../models/event')
const { transformBooking, transformEvent } = require('./_merge')

exports.bookingQuery = {
  bookings: async (_, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated')
    }
    try {
      const bookings = await Booking.find()
      return bookings.map(booking => transformBooking(booking))
    } catch (err) {
      throw err
    }
  }
}

exports.bookingMutation = {
  bookEvent: async ({ eventId }, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated')
    }
    try {
      const event = await Event.findOne({ _id: eventId })
      const booking = new Booking({
        user: req.userId,
        event
      })
      const newBooking = await booking.save()
      return transformBooking(newBooking)
    } catch (err) {
      throw err
    }
  },
  cancelBooking: async ({ bookingId }, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated')
    }
    try {
      const booking = await Booking.findById(bookingId).populate('event')
      const event = transformEvent(booking.event)
      await Booking.deleteOne({ _id: bookingId })
      return event
    } catch (err) {
      throw err
    }
  }
}

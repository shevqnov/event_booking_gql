const Booking = require('../../models/booking')
const Event = require('../../models/event')
const { transformBooking, transformEvent } = require('./_merge')

module.exports = {
  // like that
  bookings: async () => {
    try {
      const bookings = await Booking.find()
      return bookings.map(booking => transformBooking(booking))
    } catch (err) {
      throw err
    }
  },

  bookEvent: async ({ eventId }) => {
    try {
      const event = await Event.findOne({ _id: eventId })
      const booking = new Booking({
        user: '5cc5778b6cfad52093c70035',
        event
      })
      const newBooking = await booking.save()
      return transformBooking(newBooking)
    } catch (err) {
      throw err
    }
  },
  cancelBooking: async ({ bookingId }) => {
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

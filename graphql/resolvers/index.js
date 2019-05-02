const { bookingQuery, bookingMutation } = require('./booking')
const { eventQuery, eventMutation } = require('./event')
const { userQuery, userMutation } = require('./user')

module.exports = {
  Query: {
    ...bookingQuery,
    ...eventQuery,
    ...userQuery
  },
  Mutation: {
    ...bookingMutation,
    ...eventMutation,
    ...userMutation
  }
}

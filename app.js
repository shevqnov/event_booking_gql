const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const Event = require('./models/event')
const User = require('./models/user')

const app = express()

app.use(bodyParser.json())

app.use(
  '/graphql',
  graphqlHttp({
    schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type User {
        _id: ID!
        email: String!
        password: String
      }

      input UserInput {
        email: String!
        password: String!
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type RootQuery {
         events: [Event!]!
      }

      type RootMutation {
         createEvent(eventInput: EventInput!): Event
         createUser(userInput: UserInput!): User
      }

      schema {
        query: RootQuery
        mutation: RootMutation 
      }
    `),
    rootValue: {
      events: () =>
        Event.find()
          .then(events => events.map(({ _doc: event }) => ({ ...event, _id: event._id.toString() })))
          // eslint-disable-next-line no-console
          .catch(err => console.error(err)),
      createEvent: ({ eventInput }) => {
        const event = new Event({
          ...eventInput,
          date: new Date(eventInput.date)
        })
        return (
          event
            .save()
            .then(({ _doc: event }) => ({ ...event, _id: event._id.toString() }))
            // eslint-disable-next-line no-console
            .catch(err => console.error(err))
        )
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
          // eslint-disable-next-line no-console
          .catch(err => console.error(err))
    },
    graphiql: true
  })
)
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-dngap.mongodb.net/${
      process.env.MONGO_DB
    }?retryWrites=true`
  )
  .then(app.listen(3000))
  // eslint-disable-next-line no-console
  .catch(err => console.error(err))

const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const authMiddleware = require('./middleware/auth')
const typeDefs = require('./graphql/schema')
const resolvers = require('./graphql/resolvers')

const server = new ApolloServer({ typeDefs, resolvers })
const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(authMiddleware)

server.applyMiddleware({ app })

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-dngap.mongodb.net/${
      process.env.MONGO_DB
    }?retryWrites=true`
  )
  .then(app.listen(process.env.PORT))
  // eslint-disable-next-line no-console
  .then(console.log(`App listening on http://localhost:${process.env.PORT}/graphql`))
  .catch(err => {
    throw err
  })

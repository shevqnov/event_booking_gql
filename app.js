const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const mongoose = require('mongoose')
const cors = require('cors')

const authMiddleware = require('./middleware/auth')
const schema = require('./graphql/schema')
const resolvers = require('./graphql/resolvers')

const app = express()

app.use(bodyParser.json())
app.use(cors())
app.use(authMiddleware)

app.use(
  '/graphql',
  graphqlHttp({
    schema,
    rootValue: resolvers,
    graphiql: true
  })
)
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-dngap.mongodb.net/${
      process.env.MONGO_DB
    }?retryWrites=true`
  )
  .then(app.listen(process.env.PORT))
  .then(console.log(`App listening on http://localhost:${process.env.PORT}/graphql`))
  .catch(err => {
    throw err
  })

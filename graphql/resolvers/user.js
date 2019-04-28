const User = require('../../models/user')
const bcrypt = require('bcryptjs')
const { transformUser } = require('./_merge')

module.exports = {
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
      .then(user => transformUser(user))
      .catch(err => {
        throw err
      })
}

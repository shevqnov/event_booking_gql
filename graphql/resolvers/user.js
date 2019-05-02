const User = require('../../models/user')
const bcrypt = require('bcryptjs')
const { transformUser } = require('./_merge')
const jwt = require('jsonwebtoken')

exports.userQuery = {
  login: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email })
      if (!user) {
        throw new Error('User does not exsists!')
      }

      const isEqual = await bcrypt.compare(password, user.password)
      if (!isEqual) {
        throw new Error('Password is incorrect!')
      }
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.TOKEN_SECRET, {
        expiresIn: '1h'
      })
      return { userId: user.id, token, tokenExpiration: 1 }
    } catch (err) {
      throw err
    }
  }
}

exports.userMutation = {
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

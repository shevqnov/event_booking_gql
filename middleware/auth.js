const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization')
  if (!authHeader) {
    return next()
  }
  const token = authHeader.split(' ')[1]
  if (!token) {
    return next()
  }
  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.TOKEN_SECRET)
  } catch (err) {
    return next()
  }
  if (!decodedToken) {
    return next()
  }
  req.isAuth = true
  req.userId = decodedToken.userId
  next()
}

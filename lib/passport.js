const passport = require('koa-passport')
const LocalStrategy = require('passport-local')
const JwtStrategy = require('passport-jwt').Strategy
const { ExtractJwt } = require('passport-jwt')
const bcrypt = require('bcrypt')
const db = require('./db')

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  db.select('*')
    .from('admins')
    .where('id', id)
    .first()
    .then(user => {
      done(null, user)
    })
    .catch(err => {
      done(err)
    })
})

/**
 * Sign in using Email and Password.
 */
passport.use(
  'local',
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    db.select('*')
      .from('admins')
      .where('email', email.trim().toLowerCase())
      .first()
      .then(user => {
        if (!user) {
          done(null, false, { message: `Email ${email} not found.` })
          return
        }

        bcrypt
          .compare(password, user.password)
          .then(isCorrect => {
            if (isCorrect) {
              done(null, user)
              return
            }
            done(null, false, { message: 'Invalid email or password.' })
          })
          .catch(err => {
            done(err)
          })
      })
      .catch(err => {
        done(err)
      })
  }),
)

/**
 * Sign in with JWT.
 */
passport.use(
  'jwt',
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET,
    },
    (payload, done) => {
      db.select('*')
        .from('admins')
        .where('id', payload.sub)
        .first()
        .then(user => {
          done(null, user)
        })
        .catch(err => {
          done(err)
        })
    },
  ),
)

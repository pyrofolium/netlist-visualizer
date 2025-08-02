import bcrypt from 'bcrypt'
import cors from 'cors'
import express, {Router} from 'express'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import passport from 'passport'
import {Strategy as JWTStrategy, ExtractJwt} from 'passport-jwt'
import {Strategy as LocalStrategy} from 'passport-local'
import path from 'path'
import {DatabaseError} from 'pg'
import {UNKNOWN_ERROR, SERVER_PORT} from '../constants'
import {LoginInputSchema, type User, UserSchema} from '../login/login'
import {NetListTableScehma, NetListRowSchema} from '../netlist/netlist'
import {handleError} from '../utils/true-or-error'
import {insertUser} from './common'
import {debugRouter} from './debug'
import {pool} from './pool'

const app = express()
const upload = multer()
app.use(cors())
app.use(express.json())
app.use(passport.initialize())

// Serve static files from the 'build/public' directory where compiled assets are located
app.use(express.static(path.join(process.cwd(), 'build/public')))

const JWT_SECRET = process.env.JWT_SECRET || 'change-me'


// Local strategy: verify username/password
passport.use(new LocalStrategy(async (username, password, done) => {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username])
    if (result.rows.length === 0) return done(null, false, {message: 'User doesn\'t exist.'})
    if (result.rows.length > 1) return done(Error('more then 1 user detected for id'))

    const user: User = UserSchema.parse(result.rows[0])
    const ok = await bcrypt.compare(password.trim(), user.password)
    if (!ok) {
        done(null, false, {message: 'Invalid password.'})
    } else {
        return done(null, user)
    }

}))

// JWT strategy: verify bearer token
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
}, async (payload, done) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [payload.sub])
        if (result.rows.length !== 1) return done(null, false)
        const userData = await UserSchema.safeParseAsync(result.rows[0])
        if (userData.success) {
            return done(null, userData.data)
        } else {
            return done(Error('server returned unexpected data'))
        }
    } catch (error) {
        return done(error)
    }
}))

const apiRouter = Router()
app.use('/api', apiRouter)
apiRouter.use('/debug', debugRouter)

apiRouter.post('/login',
    passport.authenticate('local', {session: false}),
    (req, res) => {
        const user = req.user as User
        const token = jwt.sign({sub: user.id}, JWT_SECRET, {expiresIn: '1h'})
        res.json({token, ...req.user})
    }
)

apiRouter.post('/register', async (req, res) => {
    try {
        const userInput = await LoginInputSchema.safeParseAsync(req.body)
        if (userInput.success) {
            const existingUser =
                await pool.query('SELECT * FROM users WHERE username = $1', [userInput.data.username])
            if (existingUser.rows.length > 0) {
                return res.status(409).json({
                    error: 'Username already exists'
                })
            }

            try {
                const newUser = await insertUser(userInput.data)
                const token = jwt.sign({sub: newUser.id}, JWT_SECRET, {expiresIn: '1h'})

                // Return success with token
                res.status(201).json({token, ...newUser})
            } catch (error: unknown) {
                const errorMessage = handleError(error)
                res.status(500).json(errorMessage)
            }

        } else {
            res.status(400).json({
                error: 'Invalid input'
            })
        }
    } catch (error) {
        if (error instanceof DatabaseError || error instanceof Error) {
            res.status(500).json({message: error.message})
        } else {
            res.status(500).json(UNKNOWN_ERROR)
        }
    }
})


apiRouter.get('/user', passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const queryResult =
                await pool.query('SELECT * FROM users WHERE id = $1', [(req.user as User).id])
            if (queryResult.rows.length === 0) {
                res.status(404).json({message: 'User not found.'})
            }
            if (queryResult.rows.length !== 1) {
                res.status(409).json({message: 'Multiple users found.'})
            }
            res.status(200).json(req.user)
        } catch (error: unknown) {
            if (error instanceof DatabaseError || error instanceof Error) {
                res.status(500).json({message: error.message})
            } else {
                res.status(500).json(UNKNOWN_ERROR)
            }
        }

    }
)

apiRouter.get('/netlist', passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const queryResult = await pool.query('SELECT * FROM netlists WHERE user_id = $1 ORDER BY created_at', [(req.user as User).id])
            const parsedQuery = await NetListTableScehma.safeParseAsync(queryResult.rows)
            if (!parsedQuery.success) {
                res.status(500).json({message: 'Received unexpected data from database.'})
            } else {
                return res.json(parsedQuery.data)
            }
        } catch (error: unknown) {
            if (error instanceof DatabaseError || error instanceof Error) {
                res.status(500).json({message: error.message})
            } else {
                res.status(500).json(UNKNOWN_ERROR)
            }
        }
    })

apiRouter.post('/upload', upload.single('file'),
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        if (req.file) {
            const serializedNetList = req.file.buffer.toString('utf-8')
            const userId = (req.user as User).id
            const name = req.file.originalname
            try {
                const rowData = await pool.query(
                    'INSERT INTO netlists (user_id, name, netlist) VALUES ($1, $2, $3) RETURNING *',
                    [userId, name, serializedNetList])
                if (rowData.rows.length !== 1) {
                    res.status(500).json({message: 'database needs to return one row on success, inserting json failed'})
                }
                const netListTableRow = await NetListRowSchema.safeParseAsync(rowData.rows[0])
                if (!netListTableRow.success) {
                    res.status(500).json({message: 'database returned malformed data, inserting json failed'})
                }
                res.json(netListTableRow.data)
            } catch (error: unknown) {
                const errorObj = handleError(error)
                res.status(500).json(errorObj)
            }
        } else {
            res.status(400).json({message: 'No file was uploaded'})
        }
    }
)

apiRouter.get('/hello', (_req, res) => {

    res.json({message: 'world'})
})

app.use((_req, res) => {
    res.sendFile(path.join(process.cwd(), 'build/public', 'index.html'))
})


process.on('uncaughtException', (error) => {
    console.error('\x1b[31m%s\x1b[0m', 'Uncaught Exception:')
    console.error(error)
    process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('\x1b[31m%s\x1b[0m', 'Unhandled Rejection at:', promise)
    console.error('Reason:', reason)
    process.exit(1)
})


const server =
    app.listen(SERVER_PORT, () => console.log('Listening on http://localhost:3000'))

server.on('error', (error: NodeJS.ErrnoException) => {
    console.error('terminating server:')
    console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
    })
    process.exit(1)
})

import bcrypt from 'bcrypt'
import {type LoginInput, UserSchema} from '../login/login'
import {pool} from './pool'

export async function insertUser(loginInput: LoginInput) {
    const hashedPassword = await bcrypt.hash(loginInput.password, 10)

    const result = await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
        [loginInput.username, hashedPassword]
    )

    return UserSchema.parse(result.rows[0])
}
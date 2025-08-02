import {type FormEvent, useState, useContext} from 'react'
import './UserComponent.css'
import type {ErrorType} from '../../utils/true-or-error'
import UserContext from '../context/UserContext'
import {handleErrorWithHook} from '../hooks/error'
import ErrorComponent from './ErrorComponent'

function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<ErrorType[]>([])
    const context = useContext(UserContext)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()
        setLoading(true)
        setErrors([])
        if (context) {
            try {
                const res = await context.loginWithPassword({username, password})
                if (res === true) {
                    return
                } else {
                    setErrors([{message: res.message}])
                }
            } catch (error: unknown) {
                handleErrorWithHook(error, setErrors)
            }
        } else {
            setErrors([{message: 'logic error, check login, context should not be missing'}])
        }
        setLoading(false)

    }

    return (
        <div>
            {errors.length > 0 &&
                <ErrorComponent subtitle="LOGIN ISSUE" messages={errors} onClick={() => setErrors([])}/>}
            <form onSubmit={handleSubmit}>
                <span>
                    <label htmlFor="username"> USERNAME: </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                    />
                </span>

                <span>
                    <label htmlFor="password"> PASSWORD: </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </span>
                <span>
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                </span>
            </form>
        </div>
    )
}

export default Login

import {type FormEvent, useState, useContext} from 'react'
import './UserComponent.css'
import {LoginInputSchema} from '../../login/login'
import type {ErrorType} from '../../utils/true-or-error'
import UserContext from '../context/UserContext'
import {handleErrorWithHook} from '../hooks/error'
import ErrorComponent from './ErrorComponent'

function Register() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<ErrorType[]>([])
    const context = useContext(UserContext)
    // Reset form
    const resetForm = () => {
        setUsername('')
        setPassword('')
        setConfirmPassword('')
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        setErrors([])

        // Check if passwords match
        if (password !== confirmPassword) {
            setErrors([{message: 'Passwords do not match'}])
            resetForm()
            setLoading(false)
            return
        }

        try {
            // Validate input using Zod schema
            const validationResult = LoginInputSchema.safeParse({username, password})

            if (!validationResult.success) {
                setErrors([{message: 'Invalid input: ' + validationResult.error.message}])
                setLoading(false)
                return
            }
            if (context === undefined) {
                setErrors([{message: 'Something is wrong with the code. context is undefined'}])
                return
            }
            const res = await context.register({username, password})
            if (res !== true) {
                setErrors([{message: res.message}])
                resetForm()
                return
            } else {
                resetForm()
            }
        } catch (error: unknown) {
            handleErrorWithHook(error, setErrors)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            {errors.length > 0 &&
                <ErrorComponent subtitle="REGISTRATION ISSUE" messages={errors} onClick={() => setErrors([])}/>}
            <form onSubmit={handleSubmit}>
                <span className="form-group">
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
                    <label htmlFor="confirmPassword"> CONFIRM PASSWORD: </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </span>

                <span>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </span>
            </form>
        </div>
    )
}

export default Register
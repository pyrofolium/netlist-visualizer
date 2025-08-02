import {useContext, useState} from 'react'
import './Profile.css'
import type {ErrorType} from '../../utils/true-or-error'
import UserContext from '../context/UserContext'
import ErrorComponent from './ErrorComponent'

function Profile() {
    const [errors, setErrors] = useState<ErrorType[]>([])
    const context = useContext(UserContext)
    if (!context) {
        setErrors([{message: 'something is wrong, context must be defined'}])
    }
    return (
        <>
            {errors.length > 0 && <ErrorComponent messages={errors} onClick={() => setErrors([])}/>}
            <span className="profile">
                👤 {context?.user?.username.toUpperCase()}
            </span>
        </>)
}

export default Profile
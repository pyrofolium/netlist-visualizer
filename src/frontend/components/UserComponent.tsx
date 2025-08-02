import {useState, useContext, type MouseEventHandler} from 'react'
import UserContext from '../context/UserContext'
import Login from './Login'
import Profile from './Profile'
import Register from './Register'
import './UserComponent.css'


function UserComponent() {
    const [isRegisterMode, setRegisterMode] = useState<boolean>(false)
    const userContext = useContext(UserContext)
    const loggedIn = userContext?.user !== undefined
    const handleOnClickRegisterMode: MouseEventHandler<HTMLAnchorElement> = (event) => {
        event.preventDefault()
        setRegisterMode(!isRegisterMode)
    }
    if (!loggedIn) {
        return (

            <div className="user-container">
                <div className="bar">
                    <div className="form">
                        {isRegisterMode ? <Register/> : <Login/>}
                    </div>
                </div>
                <div><span
                    className="switcher text-shadow">{isRegisterMode ? 'Already registered?: ' : 'Don\'t have an account?: '}
                    <a onClick={handleOnClickRegisterMode}>
                        {isRegisterMode ? 'Click here to login.' : 'Click here to register.'}
                    </a>
                </span>
                </div>
            </div>
        )
    } else {
        return (
            <div className="user-container">
                <div className="bar">
                    <Profile/>
                </div>
                <span className="switcher text-shadow"><a onClick={() => {
                    userContext?.logOut()
                    if (window.location.pathname !== '/') {
                        window.location.href = '/'
                    }
                }}>LOGOUT</a></span>
            </div>
        )

    }
}

export default UserComponent
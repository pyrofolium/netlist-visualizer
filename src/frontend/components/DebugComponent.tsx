import axios from 'axios'
import {useState, useEffect, useContext, type MouseEventHandler} from 'react'
import * as z from 'zod'
import {UserSchema, type User, type LoginInput} from '../../login/login'
import type {TestParameters} from '../../utils/test-utils'
import type {ErrorType} from '../../utils/true-or-error'
import UserContext from '../context/UserContext'
import {handleErrorWithHook} from '../hooks/error'
import ErrorComponent from './ErrorComponent'
import './DebugComponent.css'


function DebugComponent() {
    const [errors, setErrors] = useState<ErrorType[]>([])
    const [title, setTitle] = useState<string | undefined>(undefined)
    const [passwordIsHidden, setPasswordIsHidden] = useState<boolean>(true)
    const [loginInfo, setLoginInfo] = useState<[User, string][]>([] as [User, string][])

    const userContext = useContext(UserContext)


    const createLoginCallback = (loginInput: LoginInput): MouseEventHandler => {
        return async (e: React.MouseEvent) => {
            e.preventDefault()
            if (userContext) {
                await userContext.loginWithPassword(loginInput)
            } else {
                setErrors([{message: 'Logic error, userContext is not initialized'}])
            }
        }
    }

    const resetDb = async () => {

        try {
            await axios.post('/api/debug/resetdb')
            setLoginInfo([])
            userContext?.logOut()
            setTitle('Database was reset.')

        } catch (error: unknown) {
            handleErrorWithHook(error, setErrors)
        }
    }

    const getUserData = async () => {
        if (userContext && userContext.cachedUserData) {
            setLoginInfo(userContext.cachedUserData)
            setPasswordIsHidden(false)
            return
        }
        try {
            const resp = await axios.get('/api/debug/user-data')
            const parsedData = await z.array(UserSchema).safeParseAsync(resp.data)
            if (parsedData.success) {
                setPasswordIsHidden(true)
                setLoginInfo(parsedData.data.map((user) => [user, '<unknown>'] as const))
            } else {
                setErrors([{message: 'Malformed data returned by server'}])
            }
        } catch (error: unknown) {
            handleErrorWithHook(error, setErrors)
        }
    }

    const generateTestData = async () => {
        const testParameters: TestParameters = {
            maxComponentCount: 9,
            maxPins: 40,
            maxNetListCount: 30,
            maxUserCount: 30
        }

        try {
            const resp = await axios.post('/api/debug/generate-test-data', testParameters)
            const logins = await z.array(z.tuple([UserSchema, z.string()])).safeParseAsync(resp.data)
            if (logins.success) {
                setLoginInfo(logins.data)
                if (userContext) {
                    userContext.setUserCachedData(logins.data)
                }
                setPasswordIsHidden(false)
                userContext?.logOut()
                setTitle('Generated test data (A few NetLists are deliberately invalid for testing purposes):')
            } else {
                setErrors([{message: 'Malformed data returned by server.'}])
            }
        } catch (error: unknown) {
            setTitle(undefined)
            handleErrorWithHook(error, setErrors)
        }
    }

    useEffect(() => {
        (async () => getUserData())()
    }, [])

    return (
        <>
            {errors.length > 0 && <ErrorComponent messages={errors} onClick={() => setErrors([])}/>}

            <div className="generator-modal">
                <div className="title-info">
                    {title && <h4>{title}</h4>}
                </div>
                {loginInfo.length > 0 && <div className="bar">
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>USERNAME</th>
                            <th>PASSWORD</th>
                            <th>CREATED AT</th>
                            <th>UPDATED AT</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loginInfo.map(([{id, username, created_at, updated_at}, password]) => {
                            return (
                                <tr key={id}>
                                    <td>{id}</td>
                                    <td>{passwordIsHidden ? username :
                                        <a className="login-link"
                                           onClick={createLoginCallback({username, password})}>{username}</a>}</td>
                                    <td>{passwordIsHidden ? password :
                                        <a className="login-link"
                                           onClick={createLoginCallback({username, password})}>{password}</a>}</td>
                                    <td>{created_at.toDateString()}</td>
                                    <td>{updated_at.toDateString()}</td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>}
                <div className="footer">
                    <button onClick={generateTestData}>
                        Generate Test Data
                    </button>
                    <button onClick={resetDb}>
                        Reset SQL Schema
                    </button>
                </div>
            </div>
        </>
    )
}

export default DebugComponent


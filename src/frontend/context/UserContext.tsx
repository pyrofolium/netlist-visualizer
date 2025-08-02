import axios from 'axios'
import {type ReactNode, useState, createContext, useEffect, useCallback, useContext} from 'react'
import {type LoginInput, type User, UserSchema, TokenResponseSchema} from '../../login/login'
import {type ErrorType, type TrueOrError, handleError} from '../../utils/true-or-error'
import SvgCacheContext from './SvgCacheContext'


type UserContextType = {
    user?: User
    loginWithPassword: (_: LoginInput) => Promise<TrueOrError>
    loginWithToken: () => Promise<TrueOrError>
    register: (_: LoginInput) => Promise<TrueOrError>
    logOut: () => void
    cachedUserData?: [User, string][]
    setUserCachedData: (_: [User, string][] | undefined) => void

}

const UserContext = createContext<UserContextType | undefined>(undefined)


function UserContextProvider({children}: { children: ReactNode }) {

    const tokenKey = 'token'
    const [user, setUser] = useState<User | undefined>(undefined)
    const [cachedUserData, setUserCachedData] = useState<[User, string][] | undefined>(undefined)
    const svgCacheContext = useContext(SvgCacheContext)
    const loginWithPassword = async (loginInput: LoginInput): Promise<TrueOrError> => {
        try {
            const resp = await axios.post('/api/login', loginInput)
            const userData = await TokenResponseSchema.extend(UserSchema.shape).safeParseAsync(resp.data)
            if (userData.success) {
                localStorage.setItem('token', userData.data.token)
                setUser(userData.data)
                return true
            } else {
                return {message: 'server returned unexpected data.'}
            }
        } catch (error: unknown) {
            return handleError(error)
        }
    }

    const logOut = () => {
        setUser(undefined)
        localStorage.removeItem(tokenKey)
        if (svgCacheContext) {
            svgCacheContext.clear()
        }
    }

    const loginWithToken = useCallback(async (): Promise<TrueOrError> => {
        const token = localStorage.getItem(tokenKey)
        if (token === null) {
            logOut()
            return {message: 'no token saved'}
        }
        try {
            const resp = await axios.get('api/user', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const userData = await UserSchema.safeParseAsync(resp.data)
            if (userData.success) {
                setUser(userData.data)
                localStorage.setItem(tokenKey, token)
                return true
            } else {
                return {message: 'unexpected data returned from server'}
            }
        } catch (error: unknown) {
            logOut()
            return handleError(error)
        }
    }, [])


    const register = async (loginInput: LoginInput): Promise<true | ErrorType> => {
        try {
            const resp = await axios.post('/api/register',
                loginInput
            )
            const userData = await TokenResponseSchema.extend(UserSchema.shape).safeParseAsync(resp.data)
            if (userData.success) {
                localStorage.setItem(tokenKey, userData.data.token)
                setUser(userData.data)
                return true
            } else {
                return {message: 'server returned unexpected data.'}
            }
        } catch (error: unknown) {
            return handleError(error)
        }
    }

    useEffect(() => {
        (async () => {
            await loginWithToken()
        })()
    }, [loginWithToken])

    const context: UserContextType = {
        register,
        loginWithToken,
        loginWithPassword,
        logOut,
        user,
        cachedUserData,
        setUserCachedData
    }

    return <UserContext.Provider value={context}>
        {children}
    </UserContext.Provider>
}

export {UserContextProvider, type UserContextType}
export default UserContext
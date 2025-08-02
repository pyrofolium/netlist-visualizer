import {isAxiosError} from 'axios'
import type {ErrorType} from '../../utils/true-or-error'

export function handleErrorWithHook(error: unknown, setErrors: (_: ErrorType[]) => void) {
    if (isAxiosError(error)) {
        setErrors(
            [
                {message: `http code: ${error.status}`},
                {message: `message: ${error.message}`},
                {
                    message:
                        `response: ${JSON.stringify(error.response?.data, null, 2)}`
                }
            ]
        )
    } else if (error instanceof Error) {
        setErrors([{message: error.message}])
    } else {
        setErrors([{message: 'Unknown error.'}])
    }
}


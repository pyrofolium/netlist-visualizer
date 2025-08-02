import {isAxiosError} from 'axios'
import * as z from 'zod'
import {UNKNOWN_ERROR} from '../constants'


export const ErrorTypeSerializer = z.object({
    message: z.string()
})

export const TrueOrErrorSerializer = z.union([z.literal(true), ErrorTypeSerializer])

// This error exists for consistent Serialization. Otherwise, it's similar to the default JS Error object.
export type ErrorType = z.infer<typeof ErrorTypeSerializer>
export type TrueOrError = z.infer<typeof TrueOrErrorSerializer> // true | ErrorType

// if you have a bunch of trues -> [true, true, true] this function turns it into a single true
// however if you have multiple errors [true, Error, Error, true, true] it turns it into [Error, Error]
export function aggregateTrueOrError(inputs: TrueOrError[]): true | ErrorType[] {
    return inputs.reduce<true | ErrorType[]>((acc, current) => {
        if (current === true) {
            return acc
        }

        if (acc === true) {
            return [current]
        }

        return [...acc, current]
    }, true)
}

export function handleError(error: unknown): ErrorType {
    if (isAxiosError(error)) {
        return {message: `http code: ${error.status}, message: ${error.message}, response: ${JSON.stringify(error.response?.data, null, 2)}`}
    } else if (error instanceof Error) {
        return {message: error.message}
    } else {
        return UNKNOWN_ERROR
    }
}
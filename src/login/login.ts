import * as z from 'zod'
import {SQLRowMetaDataSchema} from '../utils/common-types'

export const LoginInputSchema = z.object({
    username: z.string(),
    password: z.string()
})

export const UserSchema = SQLRowMetaDataSchema.extend(LoginInputSchema.shape)

export const TokenResponseSchema = z.object({
    token: z.string()
})

export type TokenResponse = z.infer<typeof TokenResponseSchema>
export type LoginInput = z.infer<typeof LoginInputSchema>
export type User = z.infer<typeof UserSchema>
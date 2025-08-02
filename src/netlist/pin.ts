import * as z from 'zod'
import {IdSchema, NameSchema} from '../utils/common-types'

const PinTypeSerializer = z.enum(['PWR', 'GND', 'NORMAL']).default('NORMAL')
export const PinSerializer = z.object({
    id: IdSchema,
    name: NameSchema,
    pinType: PinTypeSerializer
})
export type PinType = z.infer<typeof PinTypeSerializer>
export type Pin = z.infer<typeof PinSerializer>
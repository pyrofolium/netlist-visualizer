// general types

import * as z from 'zod'

export const IdSchema = z.string()
export const NameSchema = z.string()
export type Id = z.infer<typeof IdSchema>

const timestampTransformer = z.string().or(z.date()).transform((val) => {
    if (val instanceof Date) return val
    return new Date(val)
})


export const SQLRowMetaDataSchema = z.object({
    id: z.coerce.string(),
    created_at: timestampTransformer,
    updated_at: timestampTransformer,
})


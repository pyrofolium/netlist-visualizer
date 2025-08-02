import * as z from 'zod'
import {type Id, IdSchema, NameSchema, SQLRowMetaDataSchema} from '../utils/common-types'
import {type Pin, PinSerializer} from './pin'


const NetTypeSchema = z.enum(['PWR', 'GND', 'NORMAL']).default('NORMAL')

export const ComponentSchema = z.object({
    id: IdSchema,
    name: NameSchema,
    pins: z.array(PinSerializer)
})

export const NetSchema = z.object({
    id: IdSchema,
    name: NameSchema,
    netType: NetTypeSchema
})

export const ConnectionSchema = z.object({
    netId: IdSchema,
    pinId: IdSchema,
})

// NetListSerializer represents the minimum amount of information needed for a netlist
export const NetListSchema = z.object({
    connections: z.array(ConnectionSchema),
    components: z.array(ComponentSchema),
    nets: z.array(NetSchema)
})

export type NetType = z.infer<typeof NetTypeSchema>
export type Name = z.infer<typeof NameSchema>
export type Connection = z.infer<typeof ConnectionSchema>
export type Net = z.infer<typeof NetSchema>
export type Component = z.infer<typeof ComponentSchema>
export type NetList = z.infer<typeof NetListSchema>

export type OptimizedNetList = {
    connections: Connection[]
    nets: Record<Id, Net>
    components: Record<Id, Component>
    pins: Record<Id, Pin>
    pinIdsByNetId: Record<Id, Id[]>
}

export function createOptimizedNetList(netList: NetList): OptimizedNetList {
    const nets =
        Object.fromEntries(
            netList.nets.map(
                (net) => [net.id, net] as const))

    const components =
        Object.fromEntries(
            netList.components.map(
                (component) => [component.id, component] as const))
    const pins = Object.fromEntries(
        netList.components.flatMap(
            ({pins}) =>
                pins.map((pin) => [pin.id, pin] as const)))
    const pinIdsByNetId: Record<Id, Id[]> = {}
    for (const connection of netList.connections) {
        pinIdsByNetId[connection.netId] =
            Object.hasOwn(pinIdsByNetId, connection.netId) ?
                pinIdsByNetId[connection.netId].concat([connection.pinId]) :
                [connection.pinId]
    }
    return {
        connections: netList.connections,
        nets,
        components,
        pins,
        pinIdsByNetId
    }
}

export function getPinsFromConnections(connections: Connection[]): Id[] {
    return connections.map(({pinId}) => pinId)
}

export function getPinsFromComponents(components: Component[]): Pin[] {
    return components.map(({pins}) => pins).flat()
}

export function getNetsFromConnections(connections: Connection[]): Id[] {
    return connections.map(({netId}) => netId)
}

export function getConnectionsWithPinType(pinType: string, connections: Connection[], components: Component[]): Connection[] {
    const filteredPinIds = new Set(components
        .flatMap(({pins}) => pins)
        .filter((pin) => pin.pinType === pinType)
        .map(({id}) => id))
    return connections.filter(({pinId}) => filteredPinIds.has(pinId))


}

export function getConnectionsWithNetType(netType: NetType, connections: Connection[], nets: Net[]): Connection[] {
    const filteredNetIds = new Set(nets
        .filter((net) => net.netType === netType)
        .map(({id}) => id))
    return connections.filter(({netId}) => filteredNetIds.has(netId))
}

export const NetListRowSchema = SQLRowMetaDataSchema.extend(
    z.object(
        {
            name: z.string(),
            netlist: z.object({}).loose()
        }
    ).shape
)

export const NetListTableScehma =
    z.array(
        NetListRowSchema
    )
export type NetListTable = z.infer<typeof NetListTableScehma>
export type NetListRow = z.infer<typeof NetListRowSchema>
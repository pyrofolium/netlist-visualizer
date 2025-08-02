import type {Id} from '../utils/common-types'
import {type TrueOrError, type ErrorType, aggregateTrueOrError} from '../utils/true-or-error'
import {type NetList, getPinsFromComponents, NetListSchema} from './netlist'

export function verifyAllPinsConnected(netList: NetList): TrueOrError {
    const pins = getPinsFromComponents(netList.components)
    const connections = netList.connections

    const pinIds = new Set<Id>()
    for (const connection of connections) {
        const {pinId} = connection
        pinIds.add(pinId)
    }
    return pins.length === pinIds.size ? true : {message: 'pin ids not all connected to component or connection'}
}

export function verifyAllPinsHaveUniqueIds(netList: NetList): TrueOrError {
    const pins = getPinsFromComponents(netList.components)
    const pinIds = new Set<Id>()
    for (const pin of pins) {
        pinIds.add(pin.id)
    }
    return pins.length === pinIds.size ? true : {message: 'not all pins have unique ids'}
}

export function verifyAllComponentsHaveUniqueIds(netList: NetList): TrueOrError {
    const components = netList.components
    const componentIds = new Set<Id>()
    for (const component of components) {
        componentIds.add(component.id)
    }
    return components.length === componentIds.size ? true : {message: 'not all components have unique ids'}
}

export function verifyAllNetsHaveUniqueIds(netList: NetList): TrueOrError {
    const nets = netList.nets
    const netIds = new Set<Id>()
    for (const net of nets) {
        netIds.add(net.id)
    }
    return netIds.size === nets.length ? true : {message: 'not all nets have unique ids'}
}

export function verifyAllNetsAreConnectedToTwoOrMorePins(netList: NetList): TrueOrError {
    const connections = netList.connections
    const acc: Record<Id, Id[]> = {}
    for (const connection of connections) {
        const netId = connection.netId

        acc[netId] = acc[netId] === undefined ? [connection.pinId] : acc[netId].concat([connection.pinId])
    }
    for (const key in acc) {
        if (acc[key].length < 2) {
            return {message: 'Net found with less then 2 connections.'}
        }
    }
    return true
}

export function verifyAllIdsAreUnique(netList: NetList): TrueOrError {
    const componentIds = netList.components.map(({id}) => id)
    const netIds = netList.nets.map(({id}) => id)
    const pinIds = netList.components
        .flatMap((component) => component.pins)
        .map(({id}) => id)
    const allIds = componentIds.concat(netIds).concat(pinIds)
    const setOfAllIds = new Set(allIds)
    return allIds.length === setOfAllIds.size ? true : {message: 'not all ids are unique'}
}

export function verifyComponentMustHaveAtLeaseOnePin(netList: NetList): TrueOrError {
    if (netList.components.length === 0) {
        return true // 0 components is not valid but this is verified by another function
    }
    const componentAmountWithLessThanOnePin =
        netList.components
            .map(({pins}) => pins.length)
            .filter((pinLength) => pinLength < 1).length
    return componentAmountWithLessThanOnePin === 0 ? true : {message: 'There are components with less than 1 pin'}
}

export function verifyComponentsMoreThanZero(netList: NetList): TrueOrError {
    return netList.components.length > 0 ? true : {message: 'There are no components on this NetList'}
}

export function verifyAllGroundPinsConnectedToOneNet(netList: NetList): TrueOrError {
    const groundPins = netList.components.flatMap(({pins}) => pins).filter(({pinType}) => pinType === 'GND')
    if (groundPins.length === 0) {
        return true
    }
    const groundPinsSetId = new Set(groundPins.map(({id}) => id))
    const connectionsWithGround = netList.connections.filter(({pinId}) => groundPinsSetId.has(pinId))
    const groundNetIdsSet = new Set(connectionsWithGround.map(({netId}) => netId))
    return groundPins.length >= 1 && groundNetIdsSet.size === 1 ? true : {message: 'Multiple nets for ground detected'}
}

export function verifyAllPowerPinsConnectedToOneNet(netList: NetList): TrueOrError {
    const powerPins = netList.components
        .flatMap(({pins}) => pins)
        .filter(({pinType}) => pinType === 'PWR')
    if (powerPins.length === 0) {
        return true
    }
    const powerPinsSetId = new Set(powerPins.map(({id}) => id))
    const connectionsWithPower = netList.connections.filter(({pinId}) => powerPinsSetId.has(pinId))
    const groundNetIdsSet = new Set(connectionsWithPower.map(({netId}) => netId))
    return groundNetIdsSet.size === 1 ? true : {message: 'Multiple nets for power detected'}
}

export function verifyEachPinOnlyConnectedToOneNet(netList: NetList): TrueOrError {
    const pinIdsFromConnections = netList.connections.map(({pinId}) => pinId)
    return pinIdsFromConnections.length === (new Set(pinIdsFromConnections)).size ? true : {message: 'Pins found connected to multiple nets'}
}

export function verifyAllConnectionsReferToPinsAndNetsThatExist(netList: NetList): TrueOrError {
    const setPinIds = new Set(getPinsFromComponents(netList.components).map(({id}) => id))
    for (const {pinId} of netList.connections) {
        if (!setPinIds.has(pinId)) {
            return {message: 'Invalid pinId found on connection.'}
        }
    }
    return true
}

export function verifyAllConnectionsReferToNetsThatExist(netList: NetList): TrueOrError {
    const setNets = new Set(netList.nets.map(({id}) => id))
    for (const {netId} of netList.connections) {
        if (!setNets.has(netId)) {
            return {message: 'Invalid netId found on connection.'}
        }
    }
    return true
}

export function verifyGroundNetConnectedToOnlyGroundPins(netList: NetList): TrueOrError {
    const groundPinIds = new Set(netList.components
        .flatMap(({pins}) => pins)
        .filter(({pinType}) => pinType === 'GND')
        .map(({id}) => id)
    )

    const groundNets = new Set(
        netList.nets
            .filter(({netType}) => netType === 'GND')
            .map(({id}) => id))
    const connectionsWithGroundNet =
        netList.connections.filter(({netId}) => groundNets.has(netId))
    const connectionsWithGroundPinsAndGroundNets =
        connectionsWithGroundNet.filter(({pinId}) => groundPinIds.has(pinId))
    return connectionsWithGroundPinsAndGroundNets.length === connectionsWithGroundNet.length ?
        true : {message: 'Ground nets are connected to non ground pins'}
}

export function verifyPowerNetConnectedToOnlyPowerPins(netList: NetList): TrueOrError {
    const powerPinIds = new Set(netList.components
        .flatMap(({pins}) => pins)
        .filter(({pinType}) => pinType === 'PWR')
        .map(({id}) => id)
    )

    const powerNets = new Set(
        netList.nets
            .filter(({netType}) => netType === 'PWR')
            .map(({id}) => id))
    const connectionsWithPowerNet =
        netList.connections.filter(({netId}) => powerNets.has(netId))
    const connectionsWithPowerPinsAndPowerNets =
        connectionsWithPowerNet.filter(({pinId}) => powerPinIds.has(pinId))
    return connectionsWithPowerPinsAndPowerNets.length === connectionsWithPowerNet.length ?
        true : {message: 'Power nets are connected to non power pins'}
}

export function verifyGroundPinsAndPowerPinsMustBeBothZeroOrBothGreaterThanOne(netList: NetList): TrueOrError {
    const groundPins = netList.components
        .flatMap(({pins}) => pins)
        .filter(({pinType}) => pinType === 'GND')
    const pwrPins = netList.components
        .flatMap(({pins}) => pins)
        .filter(({pinType}) => pinType === 'PWR')

    return (groundPins.length === 0 && pwrPins.length === 0) || (pwrPins.length > 0 && groundPins.length > 0) ?
        true : {message: 'There are ground pins without power pins or vice versa.'}
}

export function verifyEveryConnectionIsUnique(netList: NetList): TrueOrError {
    const connectionKeys = netList.connections
        .map(({pinId, netId}) => {
            return netId + ',' + pinId
        })
    const setOfConnectionKeys = new Set(connectionKeys)
    return connectionKeys.length === setOfConnectionKeys.size ? true : {message: 'Duplicate connections found'}
}

export function verifySchema(netList: NetList): TrueOrError {
    const parsedNetList = NetListSchema.safeParse(netList)
    return parsedNetList.success ? true : {message: parsedNetList.error.message}
}


export default function verifyNetList(netList: NetList): true | ErrorType[] {
    return aggregateTrueOrError([
        verifyAllConnectionsReferToNetsThatExist(netList),
        verifyAllComponentsHaveUniqueIds(netList),
        verifyAllPinsHaveUniqueIds(netList),
        verifyAllConnectionsReferToPinsAndNetsThatExist(netList),
        verifyEachPinOnlyConnectedToOneNet(netList),
        verifyAllGroundPinsConnectedToOneNet(netList),
        verifyAllPowerPinsConnectedToOneNet(netList),
        verifyAllIdsAreUnique(netList),
        verifyComponentMustHaveAtLeaseOnePin(netList),
        verifyComponentsMoreThanZero(netList),
        verifyAllNetsAreConnectedToTwoOrMorePins(netList),
        verifyAllPinsConnected(netList),
        verifyAllNetsHaveUniqueIds(netList),
        verifyPowerNetConnectedToOnlyPowerPins(netList),
        verifyGroundNetConnectedToOnlyGroundPins(netList),
        verifyGroundPinsAndPowerPinsMustBeBothZeroOrBothGreaterThanOne(netList),
        verifyEveryConnectionIsUnique(netList),
        verifySchema(netList)
    ])
}

import {randInt} from '../utils/misc'
import type {Component, NetList, Net, Connection} from './netlist'
import type {Pin} from './pin'

export function createRandomNetList(maxComponents: number, maxPinsPerComponent: number): NetList {
    const componentAmount = randInt(1, maxComponents)
    const shouldIncludePower = randInt(0, 10) % 2 === 0
    const components: Component[] = []
    const allPins: Pin[] = []
    let currentId = 0
    for (let i = 0; i < componentAmount; i++) {
        const pinAmount = randInt(4, maxPinsPerComponent)
        const pins: Pin[] = []
        if (shouldIncludePower) {
            const powerPin: Pin = {
                id: currentId.toString(),
                name: `pin${currentId}`,
                pinType: 'PWR'
            }
            pins.push(powerPin)
            allPins.push(powerPin)
            currentId++
        }
        for (let j = 0; j < pinAmount; j++) {
            const normalPin: Pin = {
                id: currentId.toString(),
                name: `pin${currentId}`,
                pinType: 'NORMAL'
            }
            pins.push(normalPin)
            allPins.push(normalPin)
            currentId++
        }
        if (shouldIncludePower) {
            const groundPin: Pin = {
                id: currentId.toString(),
                name: `pin${currentId}`,
                pinType: 'GND'
            }
            pins.push(groundPin)
            allPins.push(groundPin)
            currentId++
        }
        components.push({
            id: currentId.toString(),
            name: `component${currentId}`,
            pins: pins
        })
        currentId++
    }
    const netAmount = Math.ceil(allPins.length / 3)
    const nets: Net[] = []
    if (shouldIncludePower) {
        nets.push({
            id: currentId.toString(),
            name: `net${currentId}`,
            netType: 'PWR'
        })
        currentId++
    }
    for (let i = 0; i < netAmount; i++) {
        nets.push({
            id: currentId.toString(),
            name: `net${currentId}`,
            netType: 'NORMAL'
        })
        currentId++
    }
    if (shouldIncludePower) {
        nets.push({
            id: currentId.toString(),
            name: `net${currentId}`,
            netType: 'GND'
        })
        currentId++
    }
    // add connections
    const connections: Connection[] = []
    if (shouldIncludePower) {
        const groundNet = nets.filter(({netType}) => netType === 'GND')[0]
        const pwrNet = nets.filter(({netType}) => netType === 'PWR')[0]
        const groundPins = allPins.filter(({pinType}) => pinType === 'GND')
        const pwrPins = allPins.filter(({pinType}) => pinType === 'PWR')
        groundPins.forEach(({id}) => {
            connections.push({pinId: id, netId: groundNet.id})
        })
        pwrPins.forEach(({id}) => {
            connections.push({pinId: id, netId: pwrNet.id})
        })
    }

    const normalPins = allPins.filter(({pinType}) => pinType === 'NORMAL')
    const normalNets = nets.filter(({netType}) => netType === 'NORMAL')
    for (let i = 0; i < normalPins.length; i++) {
        connections.push({
            pinId: normalPins[i].id,
            netId: normalNets[i % normalNets.length].id
        })
    }

    return {
        nets,
        components,
        connections,
    }

}
import type {Component} from '../netlist/netlist'
import type {Pin} from '../netlist/pin'
import type {Coord} from './netlist-render'

export type PinRender = {
    pin: Pin
    coord: Coord
    leftOrRight: 'left' | 'right'
}

// pins are stored directly stored on components so pinRenders can be fetched from components.
// one just needs to supply the coordinate location of the component and the width of the component.
export function createPinRenders(component: Component, coord: Coord, width: number): PinRender[] {
    const topPadding = 1
    const sidePadding = 0
    const pins = component.pins
    const leftPins = pins.slice(0, pins.length / 2)
    const rightPins = pins.slice(pins.length / 2, pins.length)
    const leftPinRenders: PinRender[] = leftPins.map((pin, index) => {
        return {
            pin,
            coord: {
                x: coord.x + sidePadding,
                y: coord.y + index + topPadding
            },
            leftOrRight: 'left'
        }
    })
    const rightPinRenders: PinRender[] = rightPins.map((pin, index) => {
        return {
            pin,
            coord: {
                x: coord.x + width - sidePadding,
                y: coord.y + index + topPadding
            },
            leftOrRight: 'right'
        }
    })
    return leftPinRenders.concat(rightPinRenders)
}
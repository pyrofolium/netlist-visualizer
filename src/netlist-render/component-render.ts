import type {Component, OptimizedNetList} from '../netlist/netlist'
import {zip} from '../utils/misc'
import type {Coord} from './netlist-render'
import {createPinRenders, type PinRender} from './pin-render'

// this type represents all information needed to render a component
export type ComponentRender = {
    component: Component,
    coord: Coord,
    width: number,
    height: number
    pinRenders: PinRender[]
}
// this function calculates the dimensions of a component based off of the component name
// the amount of pins, and the names of the pins.
export function calculateComponentDimensions(component: Component): [number, number] {
    const internalPadding = 1
    const nameLength = component.name.length
    const longestPinNameLength =
        Math.max(...component.pins.map(({name}) => name.length))
    let width = Math.floor((longestPinNameLength * 2 + nameLength) / 1.5) + internalPadding
    let height = Math.ceil(component.pins.length / 2) + internalPadding
    width = width % 2 !== 0 ? width - 1 : width // keep values even
    height = height % 2 !== 0 ? height : height // keep values even
    return [width, height]
}

type Width = number
type Height = number
export type ComponentDimension = [Width, Height]

// This function does the above But for several components on an optimized netlist.
export function calculateAllComponentDimensions(optimizedNetList: OptimizedNetList): ComponentDimension[] {
    return Object.entries(
        optimizedNetList.components)
        .map(([, component]) => calculateComponentDimensions(component))
}

// This function creates the final ComponentRender type.
function createComponentRender(component: Component, coord: Coord, width: number, height: number): ComponentRender {
    const pinRenders = createPinRenders(component, coord, width)
    return {
        component,
        coord,
        width,
        height,
        pinRenders
    }
}

// this function creates all the componentRenders for a given optimized netlist, and
export function createAllComponentRenders(componentPositions: Coord[], optimizedNetList: OptimizedNetList, componentDimensions: ComponentDimension[]): ComponentRender[] {
    const components = Object.entries(optimizedNetList.components)
        .map(([, component]) => component)
    const groupedComponentData = zip(
        componentPositions,
        zip(components, componentDimensions))
    return groupedComponentData
        .map(([coord, [component, [width, height]]]) =>
            createComponentRender(component, coord, width, height))
}


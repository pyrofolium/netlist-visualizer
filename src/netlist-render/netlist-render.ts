import type {OptimizedNetList} from '../netlist/netlist'
import type {Id} from '../utils/common-types'
import {
    calculateAllComponentDimensions,
    type ComponentDimension,
    type ComponentRender,
    createAllComponentRenders
} from './component-render'
import {createNetRender, type NetRender} from './net-render/net-render'
import {generateInitialCostGrid} from './net-render/wire-drawer'
import type {PinRender} from './pin-render'

// These types represent visualizations.
// Visualizations take place on a (x, y) grid.
// Where netlist.ts represents the minimal information for a netlist
// netlist-render.ts represents information needed to draw
// a netlist. These types are information for the renderer to draw
// but are renderer independent so you can implement a webgl renderer
// on top of this.


export type Coord = {
    x: number,
    y: number
}


// These are wires. Wires are represented by a bunch of coordinates
// connecting adjacent cells in a grid (see paths property).
// Connects represent connection points on wires

export type NetListRender = {
    components: ComponentRender[]
    nets: NetRender[]
    dimensions: number
}

// Given a list of componentRenders, this function creates an easy look up table for all the pinRenders.
function createPinRenderLookUpFromComponentRenders(componentRenders: ComponentRender[]): Record<Id, PinRender> {
    return Object.fromEntries(componentRenders
        .flatMap(({pinRenders}) => pinRenders)
        .map((pinRender) => [pinRender.pin.id, pinRender]))
}

// the grid for laying out the components is indexed by a single number, this function
// translates that single number into x,y coordinates
function cellCoordFromIndex(index: number, gridSideCellsAmount: number): Coord {
    return {
        x: index % gridSideCellsAmount,
        y: Math.floor(index / gridSideCellsAmount)
    }
}

// calculates the positions of all components and how they are layed out on a grid.
export function calculateAllComponentPositions(componentDimensions: ComponentDimension[], cellDimension: number, gridSideCellsAmount: number): Coord[] {
    return componentDimensions.map(
        ([width, height], index) =>
            calculatePositionOfComponent(width, height, cellDimension, cellCoordFromIndex(index, gridSideCellsAmount)))
}

// all components are layed out on an indexed grid. This function gives the position of a component, given
// the index of the cell on the grid and additional information about the grid.
function calculatePositionOfComponent(width: number, height: number, cellDimension: number, cellIndex: Coord): Coord {
    const leftPadding = Math.ceil((cellDimension - width) / 2)
    const topPadding = Math.ceil((cellDimension - height) / 2)
    return {
        x: leftPadding + cellIndex.x * cellDimension,
        y: topPadding + cellIndex.y * cellDimension
    }
}

// this function creates the final data type of the netlist needed to render the netlist.
// information to render components is in componentRenders,
// information for the nets is in netRenders
// the dimensions of the visualization are also shown
// all information is based off of a 2D grid. The units are not specified.
export function createNetListRender(optimizedNetList: OptimizedNetList): NetListRender {
    const gridSideCellsAmount = Math.ceil(Math.sqrt(Object.keys(optimizedNetList.components).length))
    const componentDimensions = calculateAllComponentDimensions(optimizedNetList)
    const paddingBetweenComponents = 7 // components are placed in a grid spacing between components is controlled by this.
    const maxDimensionOfComponent = Math.max(...componentDimensions.flat())
    const cellDimension = maxDimensionOfComponent + paddingBetweenComponents * 2
    const gridDimension = gridSideCellsAmount * cellDimension
    const componentPositions = calculateAllComponentPositions(componentDimensions, cellDimension, gridSideCellsAmount)
    const componentRenders = createAllComponentRenders(componentPositions, optimizedNetList, componentDimensions)

    const pinRendersById = createPinRenderLookUpFromComponentRenders(componentRenders)
    const costGrid = generateInitialCostGrid(gridDimension, componentRenders)
    const netRenders = Object.keys(optimizedNetList.nets)
        .map((netId) => createNetRender(netId, optimizedNetList, pinRendersById, costGrid))
    return {
        components: componentRenders,
        nets: netRenders,
        dimensions: gridDimension
    }


}



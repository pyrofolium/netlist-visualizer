import {MinPriorityQueue} from '@datastructures-js/priority-queue'
import type {ComponentRender} from '../component-render'
import type {Coord} from '../netlist-render'
import type {NetRender} from './net-render'

type CostGrid = number[][]
type TraversedGrid = boolean[][]

// generic generator of a double array. It's used to generate a fast look up table for isTraversed
// and cost for findShortestPath
export function generateGrid<T>(sideLength: number, defaultValue: T): T[][] {
    const acc: T[][] = []
    for (let y = 0; y < sideLength; y++) {
        const row = []
        for (let x = 0; x < sideLength; x++) {
            row.push(defaultValue)
        }
        acc.push(row)
    }
    return acc
}


// used by dijkstra's algorithm... given a coordinate, it tries to find all the possible surrounding coordinates.
// if the neighboring coordinate is outside of the grid or already traversed, it ignores it.
// Additionally, the function outputs a boolean indicating whether or not the move to the neighboring coordinate is
// diagonal (This is used for calculating a total cost of traveling to that node later).
type IsDiaganol = boolean

function getSurroundingCoord(coord: Coord, gridSideLength: number, traversedGrid: TraversedGrid): (readonly [IsDiaganol, Coord])[] {
    return ([
        {
            x: coord.x - 1,
            y: coord.y - 1,
        },
        {
            x: coord.x,
            y: coord.y - 1,
        },
        {
            x: coord.x + 1,
            y: coord.y - 1,
        },
        {
            x: coord.x + 1,
            y: coord.y
        },
        {
            x: coord.x + 1,
            y: coord.y + 1
        },
        {
            x: coord.x,
            y: coord.y + 1
        },
        {
            x: coord.x - 1,
            y: coord.y + 1
        },
        {
            x: coord.x - 1,
            y: coord.y
        }
    ] as Coord[]).map((coord, index) => [index % 2 === 0, coord] as const).filter(([, {x, y}]) =>
        x >= 0
        && y >= 0
        && x < gridSideLength
        && y < gridSideLength
        && !traversedGrid[y][x]
    )
}

// A linked list representing a path or a wire. It consists of a series of coordinates.
type CoordLinkedList = {
    coord: Coord,
    currentCost: number,
    cameFrom?: CoordLinkedList
}

// Given a path in the form of a linked list this function tells you the projected next
// point of the path. The path must have at least two entries or the return value is undefined.
function getProjectedPoint(coordLinkList: CoordLinkedList): Coord | undefined {
    const a = coordLinkList.cameFrom?.coord
    const b = coordLinkList.coord
    if (a === undefined) {
        return undefined
    }

    // If points are on the same vertical line
    if (a.x === b.x) {
        // Project in the same direction
        const dy = b.y - a.y
        return {
            x: b.x,
            y: b.y + dy
        }
    }

    // If points are on the same horizontal line
    if (a.y === b.y) {
        // Project in the same direction
        const dx = b.x - a.x
        return {
            x: b.x + dx,
            y: b.y
        }
    }

    // For diagonal lines, maintain the same slope
    const dx = b.x - a.x
    const dy = b.y - a.y
    return {
        x: b.x + dx,
        y: b.y + dy
    }
}

// given a path in the form of a linked list and a new coordinate, this function tells
// you whether that new coordinate caused the wire to change direction.
function isNewCoordATurn(coord: Coord, coordLinkedList: CoordLinkedList): boolean {
    const projectedCoord = getProjectedPoint(coordLinkedList)
    if (projectedCoord === undefined) {
        return false
    }
    return !(projectedCoord.x === coord.x && projectedCoord.y === coord.y)
}


// findShortestPath uses Dijkstras algorithm which makes it easier to output the shortest path as a linkedlist
// this function converts that linkedlist into an array which is a better data structure for drawing the path.
function coordLinkedListToArray(coordLinkedList: CoordLinkedList): Coord[] {
    if (coordLinkedList.cameFrom === undefined) {
        return [coordLinkedList.coord]
    } else {
        return [coordLinkedList.coord].concat(coordLinkedListToArray(coordLinkedList.cameFrom))
    }
}


// This function finds the shortest path from startCoord, to a list of end coords. It will find the closest end coord
// and end there.
export function findShortestPath(costGrid: CostGrid, start: Coord, end: Coord[]): Coord[] {
    const traversedGrid = generateGrid(costGrid.length, false)
    const turnCoordIntoKey = ({x, y}: Coord) => x.toString() + ',' + y.toString()
    const keyedEndCoords = new Set(end.map(turnCoordIntoKey))
    const isCoordGoalReached = (coord: Coord) => keyedEndCoords.has(turnCoordIntoKey(coord))
    const isCoordTraversed = ({x, y}: Coord) => traversedGrid[y][x]


    // create a minimum priority queue where coordinates are ordered by minimum cost specified
    // by the costGrid. The startNode will always have cost 0.
    const queue = new MinPriorityQueue<CoordLinkedList>(
        ({currentCost}) => currentCost)

    queue.enqueue({coord: start, currentCost: 0, cameFrom: undefined})

    let currentCoord
    while (!queue.isEmpty()) {
        currentCoord = queue.pop()
        if (currentCoord === null) {
            throw Error('popped empty queue, error')
        }
        if (isCoordTraversed(currentCoord.coord)) {
            continue
        }
        if (isCoordGoalReached(currentCoord.coord)) {
            break
        }
        if (!Number.isFinite(currentCoord.currentCost)) {
            continue
        }
        traversedGrid[currentCoord.coord.y][currentCoord.coord.x] = true
        const surroundingCoords = getSurroundingCoord(currentCoord.coord, costGrid.length, traversedGrid)
        for (const [isDiagonalMove, coord] of surroundingCoords) {
            const costOfMove = isDiagonalMove ? 3 : 2
            const isTurn = isNewCoordATurn(coord, currentCoord)
            const costOfTurn = isTurn ? 1 : 0
            const intrinsicCost = isCoordGoalReached(coord) && !areCoordsEqual(currentCoord.coord, start) ? 0 : costGrid[coord.y][coord.x]
            const nextNode = {
                coord,
                cameFrom: currentCoord,
                currentCost: intrinsicCost + costOfMove + costOfTurn + currentCoord.currentCost
            }
            queue.enqueue(nextNode)
        }
    }
    if (currentCoord === undefined) {
        return []
    }
    return coordLinkedListToArray(currentCoord)

}

// create a grid that represents the intrinsic cost of traversing to that node.
// there are other costs as well, but this grid only represents a cost of visiting a certain node at x, y
export function generateInitialCostGrid(gridSideLength: number, componentRenders: ComponentRender[]): number[][] {
    const costGrid = generateGrid(gridSideLength, 0)
    addComponentsToCostGrid(costGrid, componentRenders)
    return costGrid

}

// given a cost grid, this function adds components to the cost grid which is infinite for each node
// a component occupies
function addComponentsToCostGrid(costGrid: number[][], componentRenders: ComponentRender[]): void {
    for (const componentRender of componentRenders) {
        const startY = componentRender.coord.y
        const endY = componentRender.coord.y + componentRender.height
        const startX = componentRender.coord.x
        const endX = componentRender.coord.x + componentRender.width
        for (let y = startY; y < endY + 1; y++) {
            for (let x = startX; x < endX + 1; x++) {
                costGrid[y][x] = Infinity
            }
        }
    }
}

// In general the wiring algorithm wants to avoid crossing wires as much as possible.
// So we put a really high cost here as pathCost and the algorithm will only cross another wire
// if there's literally no other way to do so. This function adds the cost of a net to the costGrid
// to allow the algorithm to avoid the wires.
export function addNetToCostGrid(costGrid: number[][], netRenders: NetRender[], pathCost: number): void {
    for (const netRender of netRenders) {
        for (const path of netRender.paths) {
            for (const coord of path) {
                costGrid[coord.y][coord.x] = costGrid[coord.y][coord.x] + pathCost
            }
        }
    }
}

function areCoordsEqual(a: Coord, b: Coord): boolean {
    return a.x === b.x && a.y === b.y
}

function arePointsCollinear(p1: Coord, p2: Coord, p3: Coord): boolean {
    // Calculate slopes between pairs of points
    // (y2-y1)(x3-x1) = (y3-y1)(x2-x1) if points are collinear
    return (p2.y - p1.y) * (p3.x - p1.x) === (p3.y - p1.y) * (p2.x - p1.x)
}

// paths initially consist of short same length line segments of one unit on the grid.
// so a simple straight line can be hundreds of tiny segments
// this function reduces the amount of line segments needed to draw the line
// this is for speeding up rendering.
export function compressPaths(path: Coord[]): Coord[] {
    if (path.length <= 2) {
        return path
    }
    const acc: Coord[] = []
    let current: number = 2
    let startCoord = path[0]
    let lastCoord = path[1]
    acc.push(startCoord)
    acc.push(lastCoord)
    while (current < path.length) {
        const currentCoord = path[current]
        if (arePointsCollinear(startCoord, lastCoord, currentCoord)) {
            acc[acc.length - 1] = currentCoord
            lastCoord = currentCoord
        } else {
            acc.push(currentCoord)
            startCoord = lastCoord
            lastCoord = currentCoord
        }
        current++
    }
    return acc
}
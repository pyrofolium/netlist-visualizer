import {BIAS_AGAINST_CROSSING_A_WIRE} from '../../constants'
import type {Net, OptimizedNetList} from '../../netlist/netlist'
import type {Id} from '../../utils/common-types'
import {colorFromString} from '../../utils/misc'
import type {Coord} from '../netlist-render'
import type {PinRender} from '../pin-render'
import {addNetToCostGrid, compressPaths, findShortestPath} from './wire-drawer'

export type NetRender = {
    net: Net,
    color: string
    paths: Coord[][]
}


export function createNetRender(netId: Id, optimizedNetList: OptimizedNetList, pinRendersById: Record<Id, PinRender>, costGrid: number[][]): NetRender {
    const pinLookupByNetId = optimizedNetList.pinIdsByNetId
    const costOfCrossingAWire = BIAS_AGAINST_CROSSING_A_WIRE
    const pathAcc: Coord[][] = []
    if (pinLookupByNetId[netId].length >= 2) {

        // initially find a path between two connected pins
        const [pinRender1, pinRender2] =
            pinLookupByNetId[netId]
                .slice(0, 2)
                .map((pinId) => pinRendersById[pinId])

        const path = findShortestPath(costGrid, pinRender2.coord, [pinRender1.coord])
        pathAcc.push(path)


        // Then find the shortest path to any point occupied by the newly drawn path above.
        pinLookupByNetId[netId].slice(2)
            .map((pinId) => pinRendersById[pinId])
            .forEach((pinRender) => {
                const goal = pathAcc.flat()
                const path = findShortestPath(costGrid, pinRender.coord, goal)
                pathAcc.push(path)
            })
    }

    const res = {
        net: optimizedNetList.nets[netId],
        paths: pathAcc.map((path) => compressPaths(path)),
        color: colorFromString(netId.toString())
    }
    addNetToCostGrid(costGrid, [res], costOfCrossingAWire)
    return res
}
import React, {useMemo} from 'react'
import type {NetRender} from '../../../netlist-render/net-render/net-render'
import type {Coord} from '../../../netlist-render/netlist-render'

type NetListNetProps = {
    netRender: NetRender,
    scale: number
}

function pathToSvgLine(path: Coord[], stroke: string, strokeWidth: number, scale: number) {
    const acc = []
    for (let i = 0; i < path.length - 1; i++) {
        acc.push(
            <line
                key={JSON.stringify(path[i]) + ':' + JSON.stringify(path[i + 1])}
                x1={path[i].x * scale}
                x2={path[i + 1].x * scale}
                y1={path[i].y * scale}
                y2={path[i + 1].y * scale}
                strokeLinecap="round"
                stroke={stroke}
                strokeWidth={strokeWidth}/>)
    }
    return acc
}

function pathToTerminalNode(path: Coord[], scale: number, color: string, index: number) {
    return (
        <React.Fragment key={`terminal-${index}`}>
            <circle key={'circle' + path[0].x + ',' + path[0].y}
                    cx={path[0].x * scale}
                    cy={path[0].y * scale} r={scale * 0.2} fill={color} stroke={color} strokeWidth="1"/>
            <circle key={'circle' + path[1].x + ',' + path[1].y}
                    cx={path[path.length - 1].x * scale}
                    cy={path[path.length - 1].y * scale} r={scale * 0.2} fill={color} stroke={color} strokeWidth="1"/>
        </React.Fragment>)
}


export function SvgNet(props: NetListNetProps) {
    const {scale, netRender} = props
    const color = netRender.color

    const terminals = useMemo(() => {
        return netRender.paths.map((path, index) => pathToTerminalNode(path, scale, color, index))
    }, [scale, netRender, color])

    const lines = useMemo(() => {
        return netRender.paths.flatMap((path) => pathToSvgLine(path, color, 2, scale))
    }, [scale, netRender, color])
    return (
        <g key={props.netRender.net.id}>
            {lines}
            {terminals}
        </g>
    )
}
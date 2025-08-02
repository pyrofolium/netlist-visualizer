import {type JSX} from 'react'
import type {ComponentRender} from '../../../netlist-render/component-render'
import SvgPin from './SvgPin'


/**
 * Renders an SVG representation of a single netlist component
 *
 * @param props - The component properties
 * @returns SVG representation of the component
 */

type NetListComponentProp = {
    componentRender: ComponentRender
    scale: number
    fontColor: string
}

function SvgComponent(props: NetListComponentProp): JSX.Element {
    const {coord, width, height, component, pinRenders} = props.componentRender
    const {fontColor} = props
    const scale = props.scale


    return (
        <g key={props.componentRender.component.id}>
            {/* Component body */}
            <rect
                x={coord.x * scale}
                y={coord.y * scale}
                width={width * scale}
                height={height * scale}
                fill="#202020"
                stroke="#BBBBBB"
                strokeWidth="2"
            />

            {/* Component name */}
            <text
                x={(coord.x + (width / 2)) * scale}
                y={(coord.y + (height / 2)) * scale}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={scale}
                fontWeight="bold"
                fill={fontColor}
            >
                {component.name.toUpperCase()}
            </text>
            {pinRenders.map((pinRender) => <SvgPin fontColor={fontColor} key={pinRender.pin.id} pinRender={pinRender}
                                                   scale={scale}/>)}
        </g>
    )
}

export default SvgComponent
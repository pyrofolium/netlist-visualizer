import {type JSX} from 'react'

import type {PinRender} from '../../../netlist-render/pin-render.ts'

type PinProps = {
    pinRender: PinRender,
    scale: number
    fontColor: string
}

/**
 * Renders a pin on a component
 *
 * @param props - The pin properties
 * @returns SVG elements for the pin
 */
function SvgPin(props: PinProps): JSX.Element {
    const {pin, coord, leftOrRight} = props.pinRender
    const {fontColor} = props
    // Direction of the pin connector
    const scale = props.scale
    const horizontalPaddingScale = 0.5
    const fontSizeScale = 0.75
    return (
        <g key={pin.id}>
            <text
                x={coord.x * scale}
                y={coord.y * scale}
                dx={(leftOrRight === 'right' ? -scale : scale) * horizontalPaddingScale}
                textAnchor={leftOrRight === 'right' ? 'end' : 'start'}
                dominantBaseline="middle"
                fontSize={Math.floor(scale * fontSizeScale)}
                fill={pin.pinType === 'GND' ? '#ff8080' : (pin.pinType === 'PWR' ? '#80a0ff' : fontColor)}
                fontWeight={pin.pinType === 'NORMAL' ? 'normal' : 'bold'}
            >
                {pin.pinType === 'GND' ? 'GND' : (pin.pinType === 'PWR' ? 'PWR' : pin.name.toUpperCase())}
            </text>


        </g>
    )
}

export default SvgPin
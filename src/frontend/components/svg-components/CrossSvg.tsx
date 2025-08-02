import React, {useMemo, useState, useEffect} from 'react'

type CrossSvgProps = {
    patternSize?: number
    crossColor?: string
    crossStrokeWidth?: number
    scale?: number
};

const CrossSvg: React.FC<CrossSvgProps> = ({
                                               patternSize = 200,
                                               crossColor = 'grey',
                                               crossStrokeWidth = 1,
                                               scale = 20,
                                           }) => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    })
    const crossSize = patternSize / scale
    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const patternId = 'cross-pattern'

    const pattern = useMemo(() => {
        return (
            <defs>
                <pattern
                    id={patternId}
                    width={patternSize}
                    height={patternSize}
                    patternUnits="userSpaceOnUse"
                >
                    {/* Horizontal line of the cross */}
                    <line
                        x1="0"
                        y1={crossSize / 2}
                        x2={crossSize}
                        y2={crossSize / 2}
                        stroke={crossColor}
                        strokeWidth={crossStrokeWidth}
                    />
                    {/* Vertical line of the cross */}
                    <line
                        x1={crossSize / 2}
                        y1="0"
                        x2={crossSize / 2}
                        y2={crossSize}
                        stroke={crossColor}
                        strokeWidth={crossStrokeWidth}
                    />
                </pattern>
            </defs>
        )
    }, [patternSize, crossColor, crossStrokeWidth, patternId, crossSize])

    return (
        <svg width={windowSize.width} height={windowSize.height}>
            {pattern}
            <rect
                x="0"
                y="0"
                width={windowSize.width}
                height={windowSize.height}
                fill={`url(#${patternId})`}
                fillOpacity="1"
            />
        </svg>
    )
}

export default CrossSvg
import React, {useMemo, useState, useEffect} from 'react'

type XSvgProps = {
    patternSize?: number
    xColor?: string
    xStrokeWidth?: number
    scale?: number
    backgroundColor?: string
};

const XSvg: React.FC<XSvgProps> = ({
                                       patternSize = 200,
                                       xColor = 'red',
                                       xStrokeWidth = 1,
                                       scale = 20,
                                       backgroundColor = '#2a2424', // Slightly reddish version of #242424
                                   }) => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    })
    const xSize = patternSize / scale
    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }

        // Add event listener
        window.addEventListener('resize', handleResize)

        // Clean up event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const patternId = 'x-pattern'

    const pattern = useMemo(() => {
        return (
            <defs>
                <pattern
                    id={patternId}
                    width={patternSize}
                    height={patternSize}
                    patternUnits="userSpaceOnUse"
                >
                    {/* First diagonal line of the X (top-left to bottom-right) */}
                    <line
                        x1="0"
                        y1="0"
                        x2={xSize}
                        y2={xSize}
                        stroke={xColor}
                        strokeWidth={xStrokeWidth}
                    />
                    {/* Second diagonal line of the X (top-right to bottom-left) */}
                    <line
                        x1={xSize}
                        y1="0"
                        x2="0"
                        y2={xSize}
                        stroke={xColor}
                        strokeWidth={xStrokeWidth}
                    />
                </pattern>
            </defs>
        )
    }, [patternSize, xColor, xStrokeWidth, patternId, xSize])

    return (
        <svg width={windowSize.width} height={windowSize.height}>
            {pattern}
            {/* Background rectangle with slightly red-tinted color */}
            <rect
                x="0"
                y="0"
                width={windowSize.width}
                height={windowSize.height}
                fill={backgroundColor}
            />
            {/* X pattern rectangle */}
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

export default XSvg
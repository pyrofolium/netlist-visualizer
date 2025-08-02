import {useMemo} from 'react'

type NetListGridProps = {
    scale: number
    width: number,
    height: number
    minZoom: number,
    maxZoom: number
    zoom: number
}

export function SvgGrid(props: NetListGridProps) {
    const {scale, width, height, minZoom, zoom} = props
    const deltaWidth = width / minZoom
    const deltaHeight = height / minZoom
    const startX = Math.floor(-deltaWidth / 2)
    const endX = Math.ceil(width + deltaWidth / 2)
    const startY = Math.floor(-deltaHeight / 2)
    const endY = Math.ceil(height + deltaHeight / 2)
    const grid = useMemo(() => {
        return (<>
            <defs>
                <pattern
                    id="grid"
                    width={scale}
                    height={scale}
                    patternUnits="userSpaceOnUse"
                >
                    <rect
                        width={scale}
                        height={scale}
                        fill="#303030"
                    />
                    <rect
                        width={1 / zoom}
                        height={1 / zoom}
                        fill="#FFFFFF"/>
                </pattern>
            </defs>
            <rect
                x={startX}
                y={startY}
                width={endX - startX}
                height={endY - startY}
                fill="url(#grid)"
            />
        </>)

    }, [scale, zoom, startX, startY, endX, endY])


    return <g key="grid">
        {grid}
    </g>

}
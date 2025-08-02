import React, {useEffect, useMemo, useRef, useState} from 'react'
import type {NetListRender} from '../../../netlist-render/netlist-render.ts'
import {boundary, normalizedSigmoid} from '../../../utils/misc'
import Legend from '../Legend'
import SvgComponent from './SvgComponent'
import {SvgGrid} from './SvgGrid'
import {SvgNet} from './SvgNet'


type NetListSvgProps = {
    netListRender: NetListRender
    scale: number
    fontColor: string
}

type Dimensions = { width: number, height: number }
type Translation = { x: number, y: number }

const SvgNetList: React.FC<NetListSvgProps> = (props: NetListSvgProps) => {
    const {netListRender, scale, fontColor} = props
    const [windowSize, setWindowSize] = useState<Dimensions>({
        width: window.innerWidth,
        height: window.innerHeight
    })
    const [mouseDown, setMouseDown] = useState(false)
    const [cursorTimeout, setCursorTimeout] = useState<NodeJS.Timeout | undefined>()
    const [isHovered, setIsHovered] = useState(false)
    const [lastTranslate, setLastTranslate] = useState<Translation>({x: 0, y: 0})
    const [currentTranslate, setCurrentTranslate] = useState<Translation>({x: 0, y: 0})
    const [startTranslate, setStartTranslate] = useState<Translation>({x: 0, y: 0})
    const [deltaTranslate, setDeltaTranslate] = useState<Translation>({x: 0, y: 0})

    const maxZoom = 2.0
    const minZoom = 0.5
    const zoomStep = 0.015
    const [zoom, setZoom] = useState<number>(0)
    const circuitRef = useRef<SVGGElement>(null)
    const [circuitDimensions, setCircuitDimensions] = useState<Dimensions | undefined>(undefined)

    const leftTranslateBound = -windowSize.width / minZoom / 2
    const rightTranslateBound = -leftTranslateBound
    const topTranslateBound = -windowSize.height / minZoom / 2
    const bottomTranslateBound = -topTranslateBound

    const onMouseDownEvent: React.MouseEventHandler = (event) => {
        event.preventDefault()
        setMouseDown(true)
        if (isHovered) {
            setStartTranslate({x: event.clientX, y: event.clientY})
            setDeltaTranslate({x: 0, y: 0})
        }
    }

    const onMouseUpEvent: React.MouseEventHandler = () => {
        setMouseDown(false)
        setLastTranslate(currentTranslate)
    }

    const onMouseEnterEvent: React.MouseEventHandler = () => {
        setIsHovered(true)
    }

    const onMouseLeaveEvent: React.MouseEventHandler = () => {
        setIsHovered(false)
    }

    const onMouseMoveEvent: React.MouseEventHandler = (event) => {
        if (mouseDown && isHovered) {
            setDeltaTranslate({
                x: event.clientX - startTranslate.x,
                y: event.clientY - startTranslate.y
            })
            const sigmoidZoom = normalizedSigmoid(zoom, minZoom, maxZoom)
            const x = boundary(lastTranslate.x + deltaTranslate.x, leftTranslateBound * sigmoidZoom, rightTranslateBound * sigmoidZoom)
            const y = boundary(lastTranslate.y + deltaTranslate.y, topTranslateBound * sigmoidZoom, bottomTranslateBound * sigmoidZoom)
            setCurrentTranslate({
                x,
                y
            })
        }
    }

    if (mouseDown && isHovered) {
        document.body.style.cursor = 'grabbing'
    } else if (!mouseDown && isHovered) {
        document.body.style.cursor = 'grab'
    } else if (!mouseDown && !isHovered) {
        document.body.style.cursor = 'default'
    } else if (mouseDown && !isHovered) {
        document.body.style.cursor = 'default'
    }

    // handler for zooming in and out of the netlist
    const handleWheelEvent: React.WheelEventHandler<SVGSVGElement> = (event) => {
        if (cursorTimeout) {
            clearTimeout(cursorTimeout)
            setCursorTimeout(undefined)
        }

        document.body.style.cursor = 'zoom-in'
        const timeout: NodeJS.Timeout = setTimeout(() => {
            document.body.style.cursor = 'grab'
        }, 500)
        setCursorTimeout(timeout)
        setZoom(Math.min(Math.max(zoom + event.deltaY * zoomStep, -10), 10))
        const sigmoidZoom = normalizedSigmoid(zoom, minZoom, maxZoom)
        const x = boundary(currentTranslate.x, leftTranslateBound * sigmoidZoom, rightTranslateBound * sigmoidZoom)
        const y = boundary(currentTranslate.y, topTranslateBound * sigmoidZoom, bottomTranslateBound * sigmoidZoom)
        setCurrentTranslate({
            x,
            y
        })
    }


    const components = useMemo(() => {
        return netListRender.components.map((componentRender) => <SvgComponent
            key={componentRender.component.id}
            componentRender={componentRender}
            fontColor={fontColor}
            scale={scale}/>)
    }, [fontColor, netListRender.components, scale])

    // after the circuit is rendered this centers the circuit in the svg.
    useEffect(() => {
        if (circuitRef.current) {
            const bbox = circuitRef.current.getBBox()
            setCircuitDimensions({
                width: bbox.width,
                height: bbox.height
            })
        }
    }, [netListRender])


    // this handles resizing the window.
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }

        // Add event listener
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    // these values center the circuit on the grid
    const horizontalCenterTranslate = circuitDimensions ? Math.round(((windowSize.width) - circuitDimensions.width) / (2 * scale)) * scale : 0
    const verticalCenterTranslate = circuitDimensions ? Math.round(((windowSize.height) - circuitDimensions.height) / (2 * scale)) * scale : 0


    // zooming is biased towards the corner of the svg, by doing a translation here I bias the zooming towards the center
    const sigmoidZoom = normalizedSigmoid(zoom, minZoom, maxZoom)
    const horizontalZoomTranslate = -(sigmoidZoom - 1) * (windowSize.width / 2)
    const verticalZoomTranslate = -(sigmoidZoom - 1) * (windowSize.height / 2)


    return (
        <>
            <Legend netNameAndColorPairs={netListRender.nets.map(({color, net}) => [net.name, color] as const)}/>
            <svg
                onMouseMove={onMouseMoveEvent}
                onMouseEnter={onMouseEnterEvent}
                onMouseLeave={onMouseLeaveEvent}
                onMouseDown={onMouseDownEvent}
                onMouseUp={onMouseUpEvent}
                onWheel={handleWheelEvent}
                width={windowSize.width}
                height={windowSize.height}
            >
                <g transform={
                    `translate(
                ${horizontalZoomTranslate}, 
                ${verticalZoomTranslate}) scale(
                ${sigmoidZoom}) translate(
                ${currentTranslate.x}, 
                ${currentTranslate.y})`}>
                    <SvgGrid
                        scale={scale}
                        minZoom={minZoom}
                        maxZoom={maxZoom}
                        zoom={sigmoidZoom}
                        width={windowSize.width}
                        height={windowSize.height}/>
                    <g ref={circuitRef} visibility={circuitDimensions ? 'visible' : 'hidden'}
                       transform={`translate(${horizontalCenterTranslate}, ${verticalCenterTranslate})`}>
                        {components}

                        {netListRender.nets.map((netRender) => <SvgNet
                            key={netRender.net.id}
                            netRender={netRender}
                            scale={scale}/>)}
                    </g>
                </g>
            </svg>
        </>
    )
}

export default SvgNetList
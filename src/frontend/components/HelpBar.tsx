import './HelpBar.css'
import {type MouseEventHandler, useLayoutEffect, useRef, useState} from 'react'

type HelpBarProps = {
    message: string
}

function HelpBar(props: HelpBarProps) {
    const [isHidden, setIsHidden] = useState(false)
    const [width, setWidth] = useState(0)
    const helpBarRef = useRef<HTMLDivElement>(null)
    const {message} = props

    const handleIsHidden: MouseEventHandler = () => {
        setIsHidden(!isHidden)
    }

    useLayoutEffect(() => {
        if (helpBarRef.current) {
            setWidth(helpBarRef.current.offsetWidth)
        }
    }, [])

    return (
        <div style={{
            transform: `translateX(${isHidden ? -Math.floor(width * .96).toString() + 'px' : '0'})`,
            transition: 'transform 300ms ease'
        }} ref={helpBarRef} onClick={handleIsHidden} className="bar helpbar">
            <span className="message">{message}</span>
            <span className="message">{isHidden ? '▶' : '◀'}</span>
        </div>)
}

export default HelpBar
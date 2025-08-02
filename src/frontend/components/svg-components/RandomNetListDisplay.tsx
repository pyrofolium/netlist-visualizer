import {useState, useEffect, useContext, type JSX} from 'react'
import {useLocation} from 'react-router-dom'
import {MAX_COMPONENTS_FOR_RAND_GEN, MAX_PINS_FOR_RAND_GEN, SVG_SCALE} from '../../../constants'
import {createRandomNetList} from '../../../netlist/netlist-generator'
import SvgQueueContext from '../../context/SvgCacheQueueContext'
import HelpBar from '../HelpBar'
import SvgLoading from './SvgLoading'
import SvgNetListLoader from './SvgNetListLoader'


function RandomNetListDisplay() {


    const createRandomSvg = () => {
        return <SvgNetListLoader netList={createRandomNetList(MAX_COMPONENTS_FOR_RAND_GEN, MAX_PINS_FOR_RAND_GEN)}
                                 scale={SVG_SCALE}/>
    }

    const location = useLocation()
    const svgQueue = useContext(SvgQueueContext)
    const getSvg = () => {
        console.log(`getting svg from queue. Size: ${svgQueue?.size()}`)
        return svgQueue && svgQueue.size() > 0 ? svgQueue.pop() : createRandomSvg()
    }
    const [svg, setSvg] = useState<JSX.Element>(<SvgLoading/>)

    // Regenerate netlist when location changes or component mounts
    useEffect(() => {
        console.log('Effect running with location.key:', location.key)
        setSvg(getSvg())
    }, [location.key])

    const message = 'Click and drag to pan. Use the mouse wheel to zoom.'.toUpperCase()
    return (
        <>
            {svg}
            <HelpBar message={message}/>
        </>
    )
}

export default RandomNetListDisplay
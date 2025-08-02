import {useEffect, useState, useContext} from 'react'
import * as z from 'zod'
import {SVG_FONT_COLOR} from '../../../constants'
import type {NetListRender} from '../../../netlist-render/netlist-render'
import {NetListSchema} from '../../../netlist/netlist.ts'
import verifyNetList from '../../../netlist/verification'
import type {ErrorType} from '../../../utils/true-or-error'
import SvgCacheContext from '../../context/SvgCacheContext'
import ErrorComponent from '../ErrorComponent'
import SvgLoading from './SvgLoading'
import SvgNetList from './SvgNetList'
import XSvg from './XSvg'


export const SvgNetListLoaderPropsSchema = z.object({
    netList: NetListSchema.optional(),
    scale: z.number()
})

export type SvgNetListLoaderProps = z.infer<typeof SvgNetListLoaderPropsSchema>

// the netlist svg rendering is an expensive function, I debated putting this calculation
// on the backend as an async worker process that saves the netListRender to the database
// but to keep things simple I'm just going to use web workers on the front end.
// This react component is a wrapper around the svg renderer to facilitate loading and make
// the rendering asynchronous to the main v8 thread. So the UI remains snappy. You will see
// a loading spinner when this element loads but nothing is being called by the backend it's all
// happening in a seperate thread.
function SvgNetListLoader(props: SvgNetListLoaderProps) {
    const {netList, scale} = props
    const [svg, setSvg] = useState(<SvgLoading/>)
    const [errors, setErrorTypes] = useState<ErrorType[]>([])
    const svgCacheContext = useContext(SvgCacheContext)
    useEffect(() => {
        if (netList) {

            if (svgCacheContext) {
                const svg = svgCacheContext.get(netList)
                if (svg === undefined) {
                    console.log('not cached setting loading pic.')
                    // not cached do not return
                } else if (Array.isArray(svg)) {
                    // error condition
                    setErrorTypes(svg)
                    setSvg(<XSvg/>)
                    return
                } else {
                    setSvg(svg)
                    return
                }
            }

            // Reset to loading state whenever netList or scale changes
            setSvg(<SvgLoading/>)

            const worker = new Worker(
                new URL('../../workers/NetListWorker.ts', import.meta.url),
                {type: 'module'}
            )

            worker.onmessage = (e) => {
                console.log('worker finished!')
                const netListRender = e.data as NetListRender
                const svg = <SvgNetList fontColor={SVG_FONT_COLOR} netListRender={netListRender} scale={scale}/>
                setSvg(svg)
                if (svgCacheContext) {
                    svgCacheContext.set(netList, svg)
                }
            }
            const trueOrError = verifyNetList(netList)
            if (trueOrError === true) {
                worker.postMessage(netList)
            } else if (Array.isArray(trueOrError)) {
                setErrorTypes(trueOrError)
                if (svgCacheContext) {
                    svgCacheContext.set(netList, trueOrError)
                }
                setSvg(<XSvg/>)
            } else {
                throw Error('should never reach here') as never
            }

            return () => {
                worker.terminate()
            }
        }

    }, [netList, scale, svgCacheContext])
    return (
        <>
            {errors.length > 0 &&
                <ErrorComponent subtitle="INVALID NETLIST" messages={errors} onClick={() => setErrorTypes([])}/>}
            {netList && svg}
        </>
    )
}

export default SvgNetListLoader
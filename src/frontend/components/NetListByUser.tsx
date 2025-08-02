import axios, {isAxiosError} from 'axios'
import {useState, useContext, useEffect} from 'react'
import {Link} from 'react-router-dom'
import {SVG_SCALE, SVG_FONT_COLOR} from '../../constants'
import type {NetListRender} from '../../netlist-render/netlist-render'
import {NetListTableScehma, type NetListTable, NetListSchema, type NetList} from '../../netlist/netlist'
import verifyNetList from '../../netlist/verification'
import type {ErrorType} from '../../utils/true-or-error'
import SvgCacheContext from '../context/SvgCacheContext'
import UserContext from '../context/UserContext'
import AddNetList from './AddNetList'
import ErrorComponent from './ErrorComponent'
import './NetListByUser.css'
import SvgNetList from './svg-components/SvgNetList'

function NetListByUser() {
    const [errors, setErrors] = useState<ErrorType[]>([])
    const userContext = useContext(UserContext)
    const svgCacheContext = useContext(SvgCacheContext)
    const [netListData, setNetListData] = useState<NetListTable>([])
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false)

    // precaching, use web-workers to just precache all renders.
    useEffect(() => {
        const cpuCores = navigator.hardwareConcurrency
        if (svgCacheContext) {
            const workers: Worker[] = []
            const netListByWorker: Record<number, NetList> = {}
            const freeWorkers: number[] = []
            let currentNetListIndex = 0
            let finishedCount = 0
            for (let i = 0; i < cpuCores; i++) {
                const iCopied = i
                const worker = new Worker(
                    new URL('../workers/NetListWorker.ts', import.meta.url),
                    {type: 'module'}
                )
                worker.onmessage = (e: MessageEvent<NetListRender>) => {
                    const netListRender = e.data
                    const svg = <SvgNetList fontColor={SVG_FONT_COLOR} netListRender={netListRender} scale={SVG_SCALE}/>
                    if (svgCacheContext) {
                        const netList = netListByWorker[iCopied]
                        // todo: add verification here, if svg fails verification do not cache
                        console.log(`worker: ${iCopied} caching data`)
                        svgCacheContext.set(netList, svg)
                    }
                    freeWorkers.push(iCopied)
                    finishedCount++
                    if (finishedCount >= netListData.length) {
                        console.log('al workers finished precaching menu finished')
                        for (const worker of workers) {
                            worker.terminate()
                        }
                    }
                    console.log(`worker:${iCopied}/${cpuCores} finished processing, finished: ${finishedCount}`)
                }
                workers.push(worker)
                freeWorkers.push(i)
            }

            // This function is recursive because I need to put it into
            // the event loop. When no workers are available, the manager
            // goes into setTimeout for 1 second before resuming.
            const threadExecutionManager = () => {
                if (currentNetListIndex < netListData.length) {
                    const netListRow = netListData[currentNetListIndex]
                    const netList = netListRow.netlist
                    const verifiedNetList = NetListSchema.safeParse(netList)
                    if (!verifiedNetList.success) {
                        console.log(`invalid netlist on ${currentNetListIndex}`)
                        currentNetListIndex++
                        return threadExecutionManager()
                    }
                    if (svgCacheContext.get(verifiedNetList.data)) {
                        console.log(`${currentNetListIndex} already processed skipping`)
                        currentNetListIndex++
                        return threadExecutionManager()
                    }
                    const workerIndex = freeWorkers.pop()
                    if (workerIndex === undefined) {
                        // no workers available, wait
                        setTimeout(threadExecutionManager, 1000)
                    } else {
                        const worker = workers[workerIndex]
                        netListByWorker[workerIndex] = verifiedNetList.data
                        if (verifyNetList(netList as NetList) === true) {
                            worker.postMessage(netList)
                            console.log(`processing worker:${workerIndex}/${cpuCores} on ${currentNetListIndex}/${netListData.length}`)
                        }

                        currentNetListIndex++
                        threadExecutionManager()
                    }
                }
            }
            threadExecutionManager()
        }

    }, [netListData])


    useEffect(() => {
        (async () => {
            const token = localStorage.getItem('token')
            if (userContext?.user === undefined || token === null) {
                setNetListData([])
                setIsCollapsed(false)
            } else {
                try {
                    const resp = await axios.get('/api/netlist', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                    const parsedNetLists = await NetListTableScehma.safeParseAsync(resp.data)
                    if (parsedNetLists.success) {
                        setNetListData(parsedNetLists.data)
                    }
                } catch (error: unknown) {
                    if (isAxiosError(error) && error.status === 500) {
                        setErrors([
                                {message: `code: ${error.status}`},
                                {message: `message: ${error.message}`},
                                {message: `response: ${JSON.stringify(error.response?.data, null, 2)}), `}
                            ]
                        )
                    }
                    // no need to do anything, If anything fails (outside a 500)
                    // component just doesn't do anything.
                    setIsCollapsed(false)
                }
            }
        })()
    }, [userContext])


    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed)
    }

    return (
        <>
            {errors.length > 0 && <ErrorComponent messages={errors} onClick={() => setErrors([])}/>}
            {userContext?.user &&
                <div className={`bar sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                    <div className="sidebar-content">
                        {netListData.length > 0 &&
                            <h1 className="sidebar-title">NETLISTS</h1>}
                        <div className="netlist-items">
                            <ul>
                                {netListData.map((netListRow, index) => {

                                    return <li key={index}>
                                        <Link
                                            to="/netlist"
                                            state={{netList: netListRow.netlist, scale: 10, name: netListRow.name}}
                                        >
                                            {

                                                !Array.isArray(verifyNetList(netListRow.netlist as NetList)) ? netListRow.name.toUpperCase() :
                                                    <span
                                                        className="netlist-item-invalid">{netListRow.name.toUpperCase()}</span>
                                            }
                                        </Link>
                                    </li>
                                })}
                            </ul>
                        </div>
                        <AddNetList callback={(netListRow) => {
                            setNetListData(netListData.concat([netListRow]))
                        }}/>
                    </div>
                    <div className="collapse-column" onClick={toggleSidebar}>
                        <span className="collapse-icon">{isCollapsed ? '▶' : '◀'}</span>
                    </div>
                </div>}
        </>
    )
}

export default NetListByUser
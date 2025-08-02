import {useContext, useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import './NavBar.css'
import {
    SVG_RANDOM_QUEUE_SIZE,
    SVG_FONT_COLOR,
    SVG_SCALE,
    MAX_COMPONENTS_FOR_RAND_GEN,
    MAX_PINS_FOR_RAND_GEN
} from '../../constants'
import type {NetListRender} from '../../netlist-render/netlist-render'
import {createRandomNetList} from '../../netlist/netlist-generator'
import SvgQueueContext from '../context/SvgCacheQueueContext'
import SvgNetList from './svg-components/SvgNetList'

const NavBar = () => {

    const svgQueue = useContext(SvgQueueContext)
    const [workerTrigger, setWorkerTrigger] = useState<boolean>(false)


    useEffect(() => {
        if (svgQueue) {
            const workers: Worker[] = []
            const freeWorkers: number[] = []
            for (let i = 0; i < Math.min(navigator.hardwareConcurrency, SVG_RANDOM_QUEUE_SIZE); i++) {
                const copiedI = i
                const worker = new Worker(
                    new URL('../workers/NetListWorker.ts', import.meta.url),
                    {type: 'module'}
                )
                worker.onmessage = (e: MessageEvent<NetListRender>) => {
                    const netListRender: NetListRender = e.data
                    const svg = <SvgNetList fontColor={SVG_FONT_COLOR} netListRender={netListRender} scale={SVG_SCALE}/>
                    svgQueue.push(svg)
                    freeWorkers.push(copiedI)
                    console.log(`queue worker${copiedI} finished processing`)
                    console.log(`queue size ${svgQueue.size()}/${SVG_RANDOM_QUEUE_SIZE}`)
                }
                workers.push(worker)
                freeWorkers.push(copiedI)
            }
            const gatherWorkers = () => {
                // no hard limit on queue size. In general once the queue is past
                // SVG_RANDOM_QUEUE_SIZE then it just won't assign anymore tasks to workers
                // workers in flight can still be processing things. So items in the queue
                // can exceed SVG_RANDOM_QUEUE_SIZE
                if (svgQueue.size() < SVG_RANDOM_QUEUE_SIZE) {
                    const workerIndex = freeWorkers.pop()
                    if (!workerIndex) {
                        setTimeout(gatherWorkers, 1000)
                        return
                    }
                    const worker = workers[workerIndex]
                    const netList = createRandomNetList(MAX_COMPONENTS_FOR_RAND_GEN, MAX_PINS_FOR_RAND_GEN)
                    worker.postMessage(netList)
                    console.log(`queue size = ${svgQueue.size()}/${SVG_RANDOM_QUEUE_SIZE}`)
                    console.log(`queue worker${workerIndex} starting....`)
                    gatherWorkers()
                } else {
                    for (const worker of workers) {
                        worker.terminate()
                    }
                    console.log('queue full, workers cleaned up')
                }

            }

            gatherWorkers()

        }


    }, [svgQueue, workerTrigger])


    return (
        <>
            <nav className="navbar bar">
                <ul className="navbar-links">
                    <li><Link to="/">HOME</Link></li>
                    <li><Link onClick={() => {
                        setWorkerTrigger(!workerTrigger)
                    }} to="/random">RANDOM</Link></li>
                    <li><Link to="/debug" style={{color: 'red'}}>DEBUG</Link></li>
                </ul>
            </nav>
        </>
    )
}

export default NavBar
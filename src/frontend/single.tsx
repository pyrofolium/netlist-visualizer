import './App.css'
import {useEffect} from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import NavBar from './components/NavBar'
import RandomNetListDisplay from './components/svg-components/RandomNetListDisplay'
import {SvgCacheContextProvider} from './context/SvgCacheContext'
import {SvgQueueContextProvider} from './context/SvgCacheQueueContext'
import {UserContextProvider} from './context/UserContext'

function Single() {
    //prevents the mouse wheel from scrolling the page, except in the TestGenerator component.
    useEffect(() => {
        const preventDefault = (e: WheelEvent) => {
            // Check if the event target is within the TestGenerator component
            const target = e.target as HTMLElement
            const isInTestGenerator = target.closest('.generator-modal') !== null
            const isInNetListByUser = target.closest('.netlist-items') !== null
            const isInLegend = target.closest('.legend-items') !== null

            // Only prevent default if not in TestGenerator, NetListByUser, or Legend
            if (!isInTestGenerator && !isInNetListByUser && !isInLegend) {
                e.preventDefault()
            }
        }

        document.body.addEventListener('wheel', preventDefault, {passive: false})

        // Cleanup
        return () => {
            document.body.removeEventListener('wheel', preventDefault)
        }
    }, [])

    return (
        <SvgQueueContextProvider>
            <SvgCacheContextProvider>
                <UserContextProvider>
                    <BrowserRouter>
                        <>
                            <NavBar singleMode={true}/>
                            <div className="content">
                                <Routes>
                                    <Route path="/" element={<RandomNetListDisplay/>}/>
                                </Routes>
                            </div>
                        </>
                    </BrowserRouter>
                </UserContextProvider>
            </SvgCacheContextProvider>
        </SvgQueueContextProvider>
    )
}

export default Single

import './App.css'
import {useEffect} from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import DebugComponent from './components/DebugComponent'
import NavBar from './components/NavBar'
import NetListByUser from './components/NetListByUser'
import RandomNetListDisplay from './components/svg-components/RandomNetListDisplay'
import RoutedNetListDisplay from './components/svg-components/RoutedNetListDisplay'
import TitleSvg from './components/svg-components/TitleSvg'
import UserComponent from './components/UserComponent'
import {SvgCacheContextProvider} from './context/SvgCacheContext'
import {SvgQueueContextProvider} from './context/SvgCacheQueueContext'
import {UserContextProvider} from './context/UserContext'

function App() {
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
                            <NavBar/>
                            <UserComponent/>
                            <NetListByUser/>
                            <div className="content">
                                <Routes>
                                    <Route path="/debug" element={<DebugComponent/>}/>
                                    <Route path="/random" element={<RandomNetListDisplay/>}/>
                                    <Route path="/netlist" element={<RoutedNetListDisplay/>}/>
                                    <Route path="/" element={<TitleSvg title={'NETLIST VIEWER'}/>}/>
                                </Routes>
                            </div>
                        </>
                    </BrowserRouter>
                </UserContextProvider>
            </SvgCacheContextProvider>
        </SvgQueueContextProvider>
    )
}

export default App

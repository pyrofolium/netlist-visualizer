import {Queue} from '@datastructures-js/queue'
import {createContext, type ReactNode, type JSX} from 'react'

const SvgQueueContext = createContext<Queue<JSX.Element> | undefined>(undefined)

function SvgQueueContextProvider({children}: { children: ReactNode }) {
    return (
        <SvgQueueContext value={new Queue<JSX.Element>}>
            {children}
        </SvgQueueContext>
    )
}

export default SvgQueueContext
export {SvgQueueContextProvider}
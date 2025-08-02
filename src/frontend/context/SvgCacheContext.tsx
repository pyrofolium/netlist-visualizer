import stringify from 'json-stable-stringify'
import {createContext, type ReactNode, type JSX} from 'react'
import type {NetList} from '../../netlist/netlist'
import type {ErrorType} from '../../utils/true-or-error'


class SvgCacheContextType {
    // false means invalid netList, happened during verification process.
    private store: Record<string, JSX.Element | ErrorType[]>


    constructor() {
        this.store = {}
    }

    get(netList: NetList): JSX.Element | ErrorType[] | undefined {
        const key = stringify(netList)
        return key ? this.store[key] : undefined
    }

    set(netList: NetList, svg: JSX.Element | ErrorType[]) {
        const key = stringify(netList)
        if (key === undefined) {
            throw Error('netlist not serializable into key')
        }
        this.store[key] = svg
    }

    clear() {
        this.store = {}
    }

}

const SvgCacheContext = createContext<SvgCacheContextType | undefined>(undefined)

function SvgCacheContextProvider({children}: { children: ReactNode }) {
    return (
        <SvgCacheContext value={new SvgCacheContextType()}>
            {children}
        </SvgCacheContext>
    )
}

export default SvgCacheContext
export {SvgCacheContextProvider, SvgCacheContextType}
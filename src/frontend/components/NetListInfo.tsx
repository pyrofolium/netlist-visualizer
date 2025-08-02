import type {NetList} from '../../netlist/netlist'
import './NetListInfo.css'

type NetListInfo = {
    netList: NetList | undefined,
    name: string
}

function NetListInfo({netList, name}: NetListInfo) {
    return (
        <>
            {netList && <div className="info-pane">
                <div className="filename">{name.toUpperCase()}</div>
            </div>}
        </>)
}

export default NetListInfo
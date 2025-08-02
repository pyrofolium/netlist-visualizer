import './Legend.css'

function Legend({netNameAndColorPairs}: { netNameAndColorPairs: [string, string][] }) {
    return <div className="bar legend">
        <div className="legend-header">
            <h4>NETS</h4>
        </div>
        <div className="legend-content">
            <div className="legend-items">
                {netNameAndColorPairs.map(
                    ([name, color]) => (
                        <div className="legend-item" style={{color}}>{name.toUpperCase()}</div>))}
            </div>
        </div>
    </div>
}

export default Legend
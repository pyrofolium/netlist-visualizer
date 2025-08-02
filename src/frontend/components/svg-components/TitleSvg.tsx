import React from 'react'
import CrossSvg from './CrossSvg'

function TitleSvg({title}: { title: string }) {
    const titleStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
        margin: 0,
        textAlign: 'center'
    }

    return (<>
            <h1 style={titleStyle}>{title}</h1>
            <CrossSvg/>
        </>
    )
}

export default TitleSvg
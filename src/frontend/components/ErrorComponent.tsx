import './ErrorComponent.css'
import type {MouseEventHandler} from 'react'
import {createPortal} from 'react-dom'
import type {ErrorType} from '../../utils/true-or-error'

type ErrorProps = {
    subtitle?: string
    messages: ErrorType[]
    onClick: MouseEventHandler
}

function ErrorComponent({messages, onClick, subtitle}: ErrorProps) {
    return createPortal(
        <div onClick={onClick}>
            <div className="overlay">
                <div className="error">
                    <h1 className="error-title">ERROR{subtitle ? `: ${subtitle.toUpperCase()}` : ''}</h1>
                    <p>CLICK ANYWHERE TO GO BACK</p>
                    <div className="error-list-container">
                        <ul>
                            {messages.map(({message}) => <li className="error-item">{message.toUpperCase()}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default ErrorComponent
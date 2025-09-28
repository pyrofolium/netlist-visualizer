import {createRoot} from 'react-dom/client'
import {StrictMode} from 'react'
import Single from './single.tsx'
import './index.css'


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Single/>
    </StrictMode>,
)

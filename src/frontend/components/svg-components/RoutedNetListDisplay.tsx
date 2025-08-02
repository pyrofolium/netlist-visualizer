import {useLocation} from 'react-router-dom'
import * as z from 'zod'
import HelpBar from '../HelpBar'
import NetListInfo from '../NetListInfo'
import SvgNetListLoader, {SvgNetListLoaderPropsSchema} from './SvgNetListLoader'


const RoutedNetListDisplayPropsSchema = z.object({
    name: z.string()
}).extend(SvgNetListLoaderPropsSchema.shape)


// netList passed in from routing.
function RoutedNetListDisplay() {
    const location = useLocation()
    const parsedNetList = RoutedNetListDisplayPropsSchema.safeParse(location.state)
    if (parsedNetList.success) {
        const {netList, scale, name} = parsedNetList.data
        const message = 'Click and drag to pan. Use the mouse wheel to zoom.'
        return (
            <>
                <SvgNetListLoader netList={netList} scale={scale}/>
                <HelpBar message={message}/>
                <NetListInfo netList={netList} name={name}/>
            </>
        )
    } else {
        return <></>
    }
}

export default RoutedNetListDisplay
/// <reference lib="webworker" />

import {createNetListRender} from '../../netlist-render/netlist-render'
import {createOptimizedNetList} from '../../netlist/netlist'

// rendering the netlist is costly for a single thread
// doing it on the backend complicates infrastructure and doing it asynchronously
// will still cause the user to wait for it to generate and load.
// here I use a web-worker to parallelize it and actually move the calculation
// of the rendering onto another thread in the browser.
self.onmessage = (e) => {
    const netList = e.data
    const optimizedNetList = createOptimizedNetList(netList)
    const render = createNetListRender(optimizedNetList)
    self.postMessage(render)
}



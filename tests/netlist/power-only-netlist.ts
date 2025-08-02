import type {NetList} from '../../src/netlist/netlist'

// This netlist has power pins but no ground pins, which will fail the 
// verifyGroundPinsAndPowerPinsMustBeBothZeroOrBothGreaterThanOne verification function

export const powerOnlyNetlist: NetList = {
    components: [
        {
            id: 'comp1',
            name: 'Component 1',
            pins: [
                {
                    id: 'pin1',
                    name: 'Pin 1',
                    pinType: 'NORMAL'
                },
                {
                    id: 'pin2',
                    name: 'Pin 2',
                    pinType: 'NORMAL'
                }
            ]
        },
        {
            id: 'comp2',
            name: 'Component 2',
            pins: [
                {
                    id: 'pin3',
                    name: 'Pin 3',
                    pinType: 'NORMAL'
                },
                {
                    id: 'pin4',
                    name: 'Pin 4',
                    pinType: 'PWR' // Power pin
                }
            ]
        },
        {
            id: 'comp3',
            name: 'Component 3',
            pins: [
                {
                    id: 'pin5',
                    name: 'Pin 5',
                    pinType: 'NORMAL'
                },
                {
                    id: 'pin6',
                    name: 'Pin 6',
                    pinType: 'PWR' // Another power pin
                }
            ]
        }
    ],
    nets: [
        {
            id: 'net1',
            name: 'Net 1',
            netType: 'NORMAL'
        },
        {
            id: 'net2',
            name: 'Net 2',
            netType: 'NORMAL'
        },
        {
            id: 'net3',
            name: 'Power Net',
            netType: 'PWR'
        }
    ],
    connections: [
        // Normal net 1 connections
        {
            netId: 'net1',
            pinId: 'pin1'
        },
        {
            netId: 'net1',
            pinId: 'pin3'
        },
        // Normal net 2 connections
        {
            netId: 'net2',
            pinId: 'pin2'
        },
        {
            netId: 'net2',
            pinId: 'pin5'
        },
        // Power net connections
        {
            netId: 'net3',
            pinId: 'pin4'
        },
        {
            netId: 'net3',
            pinId: 'pin6'
        }
    ]
}
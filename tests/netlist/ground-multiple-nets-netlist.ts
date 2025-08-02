import type {NetList} from '../../src/netlist/netlist'

// This netlist has ground pins connected to multiple nets, which will fail the 
// verifyAllGroundPinsConnectedToOneNet verification function

export const groundMultipleNetsNetlist: NetList = {
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
                    pinType: 'GND' // Ground pin
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
                    pinType: 'GND' // Another ground pin
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
                    pinType: 'PWR' // Power pin to balance with ground pins
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
        },
        {
            id: 'net4',
            name: 'Ground Net 1',
            netType: 'GND' // First ground net
        },
        {
            id: 'net5',
            name: 'Ground Net 2',
            netType: 'GND' // Second ground net - this will cause the test to fail
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
            pinId: 'pin5'
        },
        // Power net connections
        {
            netId: 'net3',
            pinId: 'pin6'
        },
        // Ground net connections - connected to different nets
        {
            netId: 'net4',
            pinId: 'pin2' // First ground pin connected to first ground net
        },
        {
            netId: 'net5',
            pinId: 'pin4' // Second ground pin connected to second ground net
        }
    ]
}
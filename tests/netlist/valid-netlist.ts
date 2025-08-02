import type {NetList} from '../../src/netlist/netlist'

// This valid netlist passes all verification checks:
// 1. All components have unique IDs
// 2. All pins have unique IDs
// 3. All nets have unique IDs
// 4. All pins are connected
// 5. All nets are connected to two or more pins
// 6. All IDs are unique
// 7. All components have at least one pin
// 8. There are more than zero components
// 9. All ground pins are connected to one ground net
// 10. All power pins are connected to one power net
// 11. Each pin is only connected to one net
// 12. All connections refer to pins and nets that exist
// 13. All connections refer to nets that exist
// 14. Ground nets are connected only to ground pins
// 15. Power nets are connected only to power pins
// 16. Ground pins and power pins are both present
// 17. Every connection is unique

export const validNetlist: NetList = {
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
                },
                {
                    id: 'pin3',
                    name: 'Pin 3',
                    pinType: 'GND'
                }
            ]
        },
        {
            id: 'comp2',
            name: 'Component 2',
            pins: [
                {
                    id: 'pin4',
                    name: 'Pin 4',
                    pinType: 'NORMAL'
                },
                {
                    id: 'pin5',
                    name: 'Pin 5',
                    pinType: 'PWR'
                }
            ]
        },
        {
            id: 'comp3',
            name: 'Component 3',
            pins: [
                {
                    id: 'pin6',
                    name: 'Pin 6',
                    pinType: 'NORMAL'
                },
                {
                    id: 'pin7',
                    name: 'Pin 7',
                    pinType: 'GND'
                },
                {
                    id: 'pin8',
                    name: 'Pin 8',
                    pinType: 'PWR'
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
            name: 'Ground Net',
            netType: 'GND'
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
            pinId: 'pin4'
        },
        // Normal net 2 connections
        {
            netId: 'net2',
            pinId: 'pin2'
        },
        {
            netId: 'net2',
            pinId: 'pin6'
        },
        // Power net connections
        {
            netId: 'net3',
            pinId: 'pin5'
        },
        {
            netId: 'net3',
            pinId: 'pin8'
        },
        // Ground net connections
        {
            netId: 'net4',
            pinId: 'pin3'
        },
        {
            netId: 'net4',
            pinId: 'pin7'
        }
    ]
}
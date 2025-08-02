import type {NetList} from '../../src/netlist/netlist'

// This invalid netlist has issues that will fail all verification functions:
// 1. Not all pins are connected (verifyAllPinsConnected)
// 2. Duplicate component IDs (verifyAllComponentsHaveUniqueIds)
// 3. Duplicate pin IDs (verifyAllPinsHaveUniqueIds)
// 4. Duplicate net IDs (verifyAllNetsHaveUniqueIds)
// 5. A net connected to only one pin (verifyAllNetsAreConnectedToTwoOrMorePins)
// 6. Not all IDs are unique (verifyAllIdsAreUnique)
// 7. A component with no pins (verifyComponentMustHaveAtLeaseOnePin)
// 8. Ground pins connected to multiple nets (verifyAllGroundPinsConnectedToOneNet)
// 9. Power pins connected to multiple nets (verifyAllPowerPinsConnectedToOneNet)
// 10. A pin connected to multiple nets (verifyEachPinOnlyConnectedToOneNet)
// 11. A connection refers to a pin that doesn't exist (verifyAllConnectionsReferToPinsAndNetsThatExist)
// 12. A connection refers to a net that doesn't exist (verifyAllConnectionsReferToNetsThatExist)
// 13. A ground net connected to a non-ground pin (verifyGroundNetConnectedToOnlyGroundPins)
// 14. A power net connected to a non-power pin (verifyPowerNetConnectedToOnlyPowerPins)
// 15. Ground pins without power pins (verifyGroundPinsAndPowerPinsMustBeBothZeroOrBothGreaterThanOne)
// 16. Duplicate connections (verifyEveryConnectionIsUnique)

export const invalidNetlist: NetList = {
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
                    pinType: 'NORMAL' // Changed from GND to NORMAL to remove ground pins
                },
                {
                    id: 'pin9',
                    name: 'Pin 9',
                    pinType: 'NORMAL'
                }
            ]
        },
        {
            id: 'comp1', // Duplicate component ID (verifyAllComponentsHaveUniqueIds)
            name: 'Component 2',
            pins: [
                {
                    id: 'pin4',
                    name: 'Pin 4',
                    pinType: 'NORMAL'
                },
                {
                    id: 'pin1', // Duplicate pin ID (verifyAllPinsHaveUniqueIds)
                    name: 'Pin 5',
                    pinType: 'NORMAL' // Changed from PWR to NORMAL to remove power pins
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
                    pinType: 'PWR' // Changed back to PWR
                }
            ]
        },
        {
            id: 'comp4',
            name: 'Component 4',
            pins: [] // Component with no pins (verifyComponentMustHaveAtLeaseOnePin)
        },
        {
            id: 'net1', // Component ID same as net ID (verifyAllIdsAreUnique)
            name: 'Component 5',
            pins: [
                {
                    id: 'pin8',
                    name: 'Pin 8',
                    pinType: 'NORMAL' // Changed from GND to NORMAL to remove ground pins
                }
            ]
        },
        {
            id: 'comp6',
            name: 'Component 6',
            pins: [
                {
                    id: 'pin10',
                    name: 'Pin 10',
                    pinType: 'NORMAL' // Changed from GND to NORMAL to remove ground pins
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
            id: 'net1', // Duplicate net ID (verifyAllNetsHaveUniqueIds)
            name: 'Net 2',
            netType: 'NORMAL'
        },
        {
            id: 'net3',
            name: 'Net 3',
            netType: 'NORMAL' // Should be GND for pin3 (verifyGroundNetConnectedToOnlyGroundPins)
        },
        {
            id: 'net4',
            name: 'Net 4',
            netType: 'PWR' // Power net that will be connected to non-power pin (verifyPowerNetConnectedToOnlyPowerPins)
        },
        {
            id: 'net5',
            name: 'Net 5',
            netType: 'GND' // Another ground net (verifyAllGroundPinsConnectedToOneNet)
        },
        {
            id: 'net6',
            name: 'Net 6',
            netType: 'GND' // Third ground net to ensure verifyGroundNetConnectedToOnlyGroundPins fails
        }
    ],
    connections: [
        {
            netId: 'net1',
            pinId: 'pin1'
        },
        {
            netId: 'net1',
            pinId: 'pin4'
        },
        {
            netId: 'net1', // Duplicate connection (verifyEveryConnectionIsUnique)
            pinId: 'pin4'
        },
        {
            netId: 'net3',
            pinId: 'pin2' // Only one pin on this net (verifyAllNetsAreConnectedToTwoOrMorePins)
        },
        {
            netId: 'net3',
            pinId: 'pin3' // GND pin connected to NORMAL net (verifyGroundNetConnectedToOnlyGroundPins)
        },
        {
            netId: 'net4',
            pinId: 'pin6' // NORMAL pin connected to PWR net (verifyPowerNetConnectedToOnlyPowerPins)
        },
        {
            netId: 'net5',
            pinId: 'pin8' // Another ground pin connected to a different ground net (verifyAllGroundPinsConnectedToOneNet)
        },
        {
            netId: 'net6',
            pinId: 'pin6' // NORMAL pin connected to GND net (verifyGroundNetConnectedToOnlyGroundPins)
        },
        {
            netId: 'net1',
            pinId: 'pin3' // Pin connected to multiple nets (verifyEachPinOnlyConnectedToOneNet)
        },
        {
            netId: 'net999', // Net that doesn't exist (verifyAllConnectionsReferToNetsThatExist)
            pinId: 'pin7'
        },
        {
            netId: 'net1', // Second connection for pin7 (verifyAllPowerPinsConnectedToOneNet)
            pinId: 'pin7'
        },
        {
            netId: 'net1',
            pinId: 'pin999' // Pin that doesn't exist (verifyAllConnectionsReferToPinsAndNetsThatExist)
        }
        // pin7 is not connected to any valid net (verifyAllPinsConnected)
        // No power pins connected to a power net (verifyAllPowerPinsConnectedToOneNet)
        // Ground pins without properly connected power pins (verifyGroundPinsAndPowerPinsMustBeBothZeroOrBothGreaterThanOne)
    ]
}
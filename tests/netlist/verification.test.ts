import {describe, it, expect} from 'vitest'
import {
    verifyAllPinsConnected,
    verifyAllPinsHaveUniqueIds,
    verifyAllComponentsHaveUniqueIds,
    verifyAllNetsHaveUniqueIds,
    verifyAllNetsAreConnectedToTwoOrMorePins,
    verifyAllIdsAreUnique,
    verifyComponentMustHaveAtLeaseOnePin,
    verifyComponentsMoreThanZero,
    verifyAllGroundPinsConnectedToOneNet,
    verifyAllPowerPinsConnectedToOneNet,
    verifyEachPinOnlyConnectedToOneNet,
    verifyAllConnectionsReferToPinsAndNetsThatExist,
    verifyAllConnectionsReferToNetsThatExist,
    verifyGroundNetConnectedToOnlyGroundPins,
    verifyPowerNetConnectedToOnlyPowerPins,
    verifyGroundPinsAndPowerPinsMustBeBothZeroOrBothGreaterThanOne,
    verifyEveryConnectionIsUnique
} from '../../src/netlist/verification'
import {groundMultipleNetsNetlist} from './ground-multiple-nets-netlist'
import {invalidNetlist} from './invalid-netlist'
import {powerOnlyNetlist} from './power-only-netlist'
import {validNetlist} from './valid-netlist'

describe('Netlist Verification', () => {
    // 1. verifyAllPinsConnected
    describe('verifyAllPinsConnected', () => {
        it('should pass when all pins are connected', () => {
            const result = verifyAllPinsConnected(validNetlist)
            expect(result).toBe(true)
        })

        it('should fail when not all pins are connected', () => {
            const result = verifyAllPinsConnected(invalidNetlist)
            expect(result).not.toBe(true)
            expect(result).toEqual({message: 'pin ids not all connected to component or connection'})
        })
    })

    // 2. verifyAllPinsHaveUniqueIds
    describe('verifyAllPinsHaveUniqueIds', () => {
        it('should pass when all pins have unique IDs', () => {
            const result = verifyAllPinsHaveUniqueIds(validNetlist)
            expect(result).toBe(true)
        })

        it('should fail when pins have duplicate IDs', () => {
            const result = verifyAllPinsHaveUniqueIds(invalidNetlist)
            expect(result).not.toBe(true)
            expect(result).toEqual({message: 'not all pins have unique ids'})
        })
    })

    // 3. verifyAllComponentsHaveUniqueIds
    describe('verifyAllComponentsHaveUniqueIds', () => {
        it('should pass when all components have unique IDs', () => {
            const result = verifyAllComponentsHaveUniqueIds(validNetlist)
            expect(result).toBe(true)
        })

        it('should fail when components have duplicate IDs', () => {
            const result = verifyAllComponentsHaveUniqueIds(invalidNetlist)
            expect(result).not.toBe(true)
            expect(result).toEqual({message: 'not all components have unique ids'})
        })
    })

    // 4. verifyAllNetsHaveUniqueIds
    describe('verifyAllNetsHaveUniqueIds', () => {
        it('should pass when all nets have unique IDs', () => {
            const result = verifyAllNetsHaveUniqueIds(validNetlist)
            expect(result).toBe(true)
        })

        it('should fail when nets have duplicate IDs', () => {
            const result = verifyAllNetsHaveUniqueIds(invalidNetlist)
            expect(result).not.toBe(true)
            expect(result).toEqual({message: 'not all nets have unique ids'})
        })
    })

    // 5. verifyAllNetsAreConnectedToTwoOrMorePins
    describe('verifyAllNetsAreConnectedToTwoOrMorePins', () => {
        it('should pass when all nets are connected to two or more pins', () => {
            const result = verifyAllNetsAreConnectedToTwoOrMorePins(validNetlist)
            expect(result).toBe(true)
        })

        it('should fail when a net is connected to less than two pins', () => {
            const result = verifyAllNetsAreConnectedToTwoOrMorePins(invalidNetlist)
            expect(result).not.toBe(true)
            expect(result).toEqual({message: 'Net found with less then 2 connections.'})
        })
    })

    // 6. verifyAllIdsAreUnique
    describe('verifyAllIdsAreUnique', () => {
        it('should pass when all IDs are unique', () => {
            const result = verifyAllIdsAreUnique(validNetlist)
            expect(result).toBe(true)
        })

        it('should fail when IDs are not unique across components, nets, and pins', () => {
            const result = verifyAllIdsAreUnique(invalidNetlist)
            expect(result).not.toBe(true)
            expect(result).toEqual({message: 'not all ids are unique'})
        })
    })

    // 7. verifyComponentMustHaveAtLeaseOnePin
    describe('verifyComponentMustHaveAtLeaseOnePin', () => {
        it('should pass when all components have at least one pin', () => {
            const result = verifyComponentMustHaveAtLeaseOnePin(validNetlist)
            expect(result).toBe(true)
        })

        it('should fail when a component has no pins', () => {
            const result = verifyComponentMustHaveAtLeaseOnePin(invalidNetlist)
            expect(result).not.toBe(true)
            expect(result).toEqual({message: 'There are components with less than 1 pin'})
        })
    })

    // 8. verifyComponentsMoreThanZero
    describe('verifyComponentsMoreThanZero', () => {
        it('should pass when there are components', () => {
            const result = verifyComponentsMoreThanZero(validNetlist)
            expect(result).toBe(true)
        })

        it('should pass for invalid netlist too (since it has components)', () => {
            const result = verifyComponentsMoreThanZero(invalidNetlist)
            expect(result).toBe(true)
        })
    })

    // 9. verifyAllGroundPinsConnectedToOneNet
    describe('verifyAllGroundPinsConnectedToOneNet', () => {
        it('should pass when all ground pins are connected to one net', () => {
            const result = verifyAllGroundPinsConnectedToOneNet(validNetlist)
            expect(result).toBe(true)
        })

        it('should fail when ground pins are connected to multiple nets', () => {
            // Using groundMultipleNetsNetlist which has ground pins connected to multiple nets
            const result = verifyAllGroundPinsConnectedToOneNet(groundMultipleNetsNetlist)
            expect(result).not.toBe(true)
            expect(result).toEqual({message: 'Multiple nets for ground detected'})
        })
    })

    // 10. verifyAllPowerPinsConnectedToOneNet
    describe('verifyAllPowerPinsConnectedToOneNet', () => {
        it('should pass when all power pins are connected to one net', () => {
            const result = verifyAllPowerPinsConnectedToOneNet(validNetlist)
            expect(result).toBe(true)
        })

        it('should fail when power pins are connected to multiple nets or not connected', () => {
            const result = verifyAllPowerPinsConnectedToOneNet(invalidNetlist)
            expect(result).not.toBe(true)
            expect(result).toEqual({message: 'Multiple nets for power detected'})
        })
    })

    // 11. verifyEachPinOnlyConnectedToOneNet
    describe('verifyEachPinOnlyConnectedToOneNet', () => {
        it('should pass when each pin is connected to only one net', () => {
            const result = verifyEachPinOnlyConnectedToOneNet(validNetlist)
            expect(result).toBe(true)
        })

        it('should fail when a pin is connected to multiple nets', () => {
            const result = verifyEachPinOnlyConnectedToOneNet(invalidNetlist)
            expect(result).not.toBe(true)
            expect(result).toEqual({message: 'Pins found connected to multiple nets'})
        })
    })

    // 12. verifyAllConnectionsReferToPinsAndNetsThatExist
    describe('verifyAllConnectionsReferToPinsAndNetsThatExist', () => {
        it('should pass when all connections refer to pins that exist', () => {
            const result = verifyAllConnectionsReferToPinsAndNetsThatExist(validNetlist)
            expect(result).toBe(true)
        })

        it('should fail when a connection refers to a pin that does not exist', () => {
            const result = verifyAllConnectionsReferToPinsAndNetsThatExist(invalidNetlist)
            expect(result).not.toBe(true)
            expect(result).toEqual({message: 'Invalid pinId found on connection.'})
        })
    })

    // 13. verifyAllConnectionsReferToNetsThatExist
    describe('verifyAllConnectionsReferToNetsThatExist', () => {
        it('should pass when all connections refer to nets that exist', () => {
            const result = verifyAllConnectionsReferToNetsThatExist(validNetlist)
            expect(result).toBe(true)
        })

        it('should fail when a connection refers to a net that does not exist', () => {
            const result = verifyAllConnectionsReferToNetsThatExist(invalidNetlist)
            expect(result).not.toBe(true)
            expect(result).toEqual({message: 'Invalid netId found on connection.'})
        })
    })

    // 14. verifyGroundNetConnectedToOnlyGroundPins
    describe('verifyGroundNetConnectedToOnlyGroundPins', () => {
        it('should pass when ground nets are connected only to ground pins', () => {
            const result = verifyGroundNetConnectedToOnlyGroundPins(validNetlist)
            expect(result).toBe(true)
        })

        it('should fail when a ground net is connected to a non-ground pin', () => {
            const result = verifyGroundNetConnectedToOnlyGroundPins(invalidNetlist)
            expect(result).not.toBe(true)
            expect(result).toEqual({message: 'Ground nets are connected to non ground pins'})
        })
    })

    // 15. verifyPowerNetConnectedToOnlyPowerPins
    describe('verifyPowerNetConnectedToOnlyPowerPins', () => {
        it('should pass when power nets are connected only to power pins', () => {
            const result = verifyPowerNetConnectedToOnlyPowerPins(validNetlist)
            expect(result).toBe(true)
        })

        it('should fail when a power net is connected to a non-power pin', () => {
            const result = verifyPowerNetConnectedToOnlyPowerPins(invalidNetlist)
            expect(result).not.toBe(true)
            expect(result).toEqual({message: 'Power nets are connected to non power pins'})
        })
    })

    // 16. verifyGroundPinsAndPowerPinsMustBeBothZeroOrBothGreaterThanOne
    describe('verifyGroundPinsAndPowerPinsMustBeBothZeroOrBothGreaterThanOne', () => {
        it('should pass when both ground and power pins are present', () => {
            const result = verifyGroundPinsAndPowerPinsMustBeBothZeroOrBothGreaterThanOne(validNetlist)
            expect(result).toBe(true)
        })

        it('should fail when there are ground pins without power pins or vice versa', () => {
            // Using powerOnlyNetlist which has power pins but no ground pins
            const result = verifyGroundPinsAndPowerPinsMustBeBothZeroOrBothGreaterThanOne(powerOnlyNetlist)
            expect(result).not.toBe(true)
            expect(result).toEqual({message: 'There are ground pins without power pins or vice versa.'})
        })
    })

    // 17. verifyEveryConnectionIsUnique
    describe('verifyEveryConnectionIsUnique', () => {
        it('should pass when every connection is unique', () => {
            const result = verifyEveryConnectionIsUnique(validNetlist)
            expect(result).toBe(true)
        })

        it('should fail when there are duplicate connections', () => {
            const result = verifyEveryConnectionIsUnique(invalidNetlist)
            expect(result).not.toBe(true)
            expect(result).toEqual({message: 'Duplicate connections found'})
        })
    })
})
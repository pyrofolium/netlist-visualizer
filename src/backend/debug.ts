import {Router} from 'express'
import {readFile} from 'node:fs/promises'
import {DatabaseError} from 'pg'
import * as z from 'zod'
import {invalidNetlist} from '../../tests/netlist/invalid-netlist'
import {validNetlist} from '../../tests/netlist/valid-netlist'
import {UNKNOWN_ERROR} from '../constants'
import {UserSchema} from '../login/login'
import type {NetList} from '../netlist/netlist'
import type {Id} from '../utils/common-types'
import {zip} from '../utils/misc'
import {TestParameterSchema, generateTestData} from '../utils/test-utils'
import {insertUser} from './common'
import {pool} from './pool'

export const debugRouter = Router()


debugRouter.post('/resetdb', async (_req, res) => {
    const query = await readFile('./public/schema.sql', 'utf-8')
    try {
        await pool.query(query)
        res.json({message: 'success'})
    } catch (error: unknown) {
        if (error instanceof DatabaseError || error instanceof Error) {
            res.status(500).json({message: error.message})
        } else {
            res.status(500).json(UNKNOWN_ERROR)
        }
    }
})

debugRouter.get('/user-data', async (_req, res) => {
    try {
        const queryResults = await pool.query('SELECT * FROM users ORDER BY username')
        const parsedUsers = await z.array(UserSchema).safeParseAsync(queryResults.rows)
        if (parsedUsers.success) {
            res.json(parsedUsers.data)
        } else {
            res.status(500).json({message: 'malformed data'})
        }
    } catch (error: unknown) {
        if (error instanceof DatabaseError || error instanceof Error) {
            res.status(500).json({message: error.message})
        } else {
            res.status(500).json(UNKNOWN_ERROR)
        }
    }

})


function addBadNetListsToListOfNetLists(netLists: NetList[][]) {
    for (const netListList of netLists) {
        netListList.push(invalidNetlist)
        netListList.push(validNetlist)
    }
}

debugRouter.post('/generate-test-data', async (req, res) => {
    const testParameters = await TestParameterSchema.safeParseAsync(req.body)
    const generateNetListName = (id: Id) => `netList-${id}-${Math.round(Math.random() * 10000000)}`
    if (testParameters.success) {
        const requestData = generateTestData(testParameters.data)
        const listOfNetListLists = requestData.map(([_, netLists]) => netLists)
        addBadNetListsToListOfNetLists(listOfNetListLists)
        await clearAllData()
        const passwords = requestData.map(([{password}, ..._]) => password)
        const netListPerPendingInsertUser = requestData.map(([user, _]) => insertUser(user))
        const insertedUsers = await Promise.all(netListPerPendingInsertUser)
        const insertedUserIds = insertedUsers.map((user) => user.id)
        try {
            const pendingNetListInserts = zip(insertedUserIds, listOfNetListLists).map(([userId, netLists]) => {
                return netLists.map(async (netList) => {
                    return await pool.query(
                        'INSERT INTO netlists (name, user_id, netlist) VALUES ($1, $2, $3) RETURNING *',
                        [generateNetListName(userId), userId, JSON.stringify(netList)])
                })
            }).flat()
            await Promise.all(pendingNetListInserts)
            res.json(zip(insertedUsers, passwords))
        } catch (error: unknown) {
            if (error instanceof DatabaseError || error instanceof Error) {
                res.status(500).json({message: error.message})
            } else {
                res.status(500).json(UNKNOWN_ERROR)
            }
        }
    } else {
        res.status(400).json({message: 'Malformed request data.'})
    }
})

export async function clearAllData() {
    await pool.query('TRUNCATE TABLE users, netlists')
}
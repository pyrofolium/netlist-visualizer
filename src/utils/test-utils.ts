import * as z from 'zod'
import type {LoginInput} from '../login/login'
import type {NetList} from '../netlist/netlist'
import {createRandomNetList} from '../netlist/netlist-generator'


export const TestParameterSchema = z.object({
    maxUserCount: z.number(),
    maxNetListCount: z.number(),
    maxComponentCount: z.number(),
    maxPins: z.number(),
})

export type TestParameters = z.infer<typeof TestParameterSchema>

export function generateTestData(testParameters: TestParameters): [LoginInput, NetList[]][] {
    const {maxUserCount, maxNetListCount, maxComponentCount, maxPins} = testParameters
    const userCount = Math.round(Math.random() * maxUserCount)
    const users: LoginInput[] = []
    for (let i = 0; i < userCount; i++) {
        users.push({
            username: `User${i}`,
            password: generateRandomPassword()
        })
    }
    return users.map((user) => {
        const netListCount = Math.round(Math.random() * maxNetListCount)
        const netLists: NetList[] = []
        for (let i = 0; i < netListCount; i++) {
            netLists.push(createRandomNetList(maxComponentCount, maxPins))
        }
        return [user, netLists]
    })
}

export function generateRandomPassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    const allChars = lowercase + uppercase + numbers + special

    // Ensure at least one of each type
    let password =
        lowercase[Math.floor(Math.random() * lowercase.length)] +
        uppercase[Math.floor(Math.random() * uppercase.length)] +
        numbers[Math.floor(Math.random() * numbers.length)] +
        special[Math.floor(Math.random() * special.length)]

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)]
    }

    // Shuffle the password
    return password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('')
}

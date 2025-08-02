import type {ErrorType} from './utils/true-or-error'

export const ERROR_DISPLAY_TIMEOUT = 5000
export const UNKNOWN_ERROR: ErrorType = {message: 'Unknown Error'} as const
export const MAX_COMPONENTS_FOR_RAND_GEN = 9
export const MAX_PINS_FOR_RAND_GEN = 40
// adjust this to change the wire drawing algorithm the
// the higher the number the more the algorithm will attempt to avoid touching other wires
// in the end if the algorithm absolutely has to cross another wire it will.
export const BIAS_AGAINST_CROSSING_A_WIRE = 999
export const SVG_SCALE = 10
export const SVG_FONT_COLOR = '#BBBBBB'
export const SVG_RANDOM_QUEUE_SIZE = 10
export const SERVER_PORT = 3000
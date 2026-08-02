export type TypeRole = 'admin' | 'user'

export type TypeToken = 'access' | 'refresh'

export interface JwtPayload {
    id: number
    type: TypeToken
}

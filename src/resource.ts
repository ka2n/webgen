import * as Contentful from 'contentful'

export interface Auth {
    accessToken: string
    space: string
}

export function createClient(auth: Auth): Contentful.ContentfulClientApi {
    return Contentful.createClient(auth)
}
import { client } from './client'

export const sanityFetch = async ({ query, params = {} }: { query: string; params?: any }) => {
  return await client.fetch(query, params)
}

export const SanityLive = () => {
  return null
}
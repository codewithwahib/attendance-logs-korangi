import { type SchemaTypeDefinition } from 'sanity'
import { employee } from './employee'
import login from './login'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [employee,login],
}

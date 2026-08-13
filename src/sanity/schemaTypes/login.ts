import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'login',
  title: 'Login',
  type: 'document',

  fields: [
    defineField({
      name: 'username',
      title: 'Username',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'password',
      title: 'Password',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ],
})
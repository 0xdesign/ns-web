import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

const baseDirectory = dirname(fileURLToPath(import.meta.url))

const compat = new FlatCompat({
  baseDirectory,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
]

export default eslintConfig

import { nestConfig } from '@repo/jest-config'

export default {
  ...nestConfig,
  moduleNameMapper: {
    '^@repo/shared/(.*)$': '<rootDir>/../../../packages/shared/src/$1',
    '^@repo/shared$': '<rootDir>/../../../packages/shared/src/index.ts'
  }
}


export const ANT_VAR_PREFIX = '--ant'

/**
 * merges css files
 * @param files import css files
 * @returns pure css text
 */
const parseCssVariable = (files: string[]): string => {
  return files.filter(Boolean).join('\n')
}

export {parseCssVariable}

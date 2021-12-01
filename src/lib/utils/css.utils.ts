import {generate} from '@ant-design/colors'

export const ANT_VAR_PREFIX = '--ant'

/**
 * merges css files
 * @param files import css files
 * @returns pure css text
 */
const parseCssVariable = (files: string[]): string => {
  return files.filter(Boolean).join('\n')
}

/**
 * return a style root object to be set as root/shadow-root css style
 * @param primary hex color to be set as primary
 * @returns a css style root object
 */
const setCssVariables = (primary: string) => {
  const palette = generate(primary)
  const prim = `${ANT_VAR_PREFIX}-primary-color: ${primary};`
  const colors = palette.slice(0, 7).map((color, index) =>
    `${ANT_VAR_PREFIX}-primary-${index+1}: ${color};`
  )
  const hover = `${ANT_VAR_PREFIX}-primary-color-hover: ${palette[4]};`
  const active = `${ANT_VAR_PREFIX}-primary-color-active: ${palette[6]};`
  const outline = `${ANT_VAR_PREFIX}-primary-color-outline: ${primary}33`
  
  return `:root{${[prim, ...colors, hover, active, outline].filter(Boolean).join('')}}`
}

export {parseCssVariable, setCssVariables}

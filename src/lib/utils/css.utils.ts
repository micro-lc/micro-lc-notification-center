import {generate} from '@ant-design/colors'

export const ANTD_PRIMARY_COLOR = '#1890ff'
export const NOTIFICATION_CENTER_CSS_VAR_PREFIX = '--notification-center'

/**
 * strips away import and const decalarations
 * @param files import css files
 * @returns pure css text
 */
const parseCssVariable = (files: string[]): string => {
  return files.map(text => {
  const start = text.indexOf('"')
  const end = text.lastIndexOf('"')
  return text.substring(start + 1, end).replace(/\\"/ig, '"')
  }).filter(Boolean).join('\n')
}

/**
 * return a style root object to be set as root/shadow-root css style
 * @param primary hex color to be set as primary
 * @returns a css style root object
 */
const setCssVariables = (primary: string) => {
  const notificationCenterPalette = generate(primary)
  const otherColors = notificationCenterPalette.slice(0, 7).map((color, index) =>
    `${NOTIFICATION_CENTER_CSS_VAR_PREFIX}-color-${index+1}: ${color};`
  ).join('\n')
  return `:root {
    ${NOTIFICATION_CENTER_CSS_VAR_PREFIX}-primary-color: ${primary};
    ${otherColors}
  }`
}

export {parseCssVariable, setCssVariables}

import React, {ReactElement, useEffect, Fragment, useMemo} from 'react'

import {Button} from 'antd'
import antd from 'antd/dist/antd.css'

import {parseCssVariable, setCssVariables} from '../utils/css.utils'
import styles from './notification-center.css'

const MICROLC_PRIMARY_COLOR_VAR = '--microlc-primary-color'

export type Notification = {
  _id: string
  creatorId: string
  createdAt: Date
  title: string
}

export type NotificationCenterProps = {
  loading?: boolean
  notifications?: Notification[]
  next?: () => void
  reload?: () => void
}


export default function NotificationCenter (props: NotificationCenterProps): ReactElement {
  const microlcPrimaryColor = useMemo(() => getComputedStyle(document.documentElement).getPropertyValue(MICROLC_PRIMARY_COLOR_VAR), [])

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(props.notifications)
  }, [props.loading, props.notifications?.length])
  return (
    <Fragment>
      <style>{setCssVariables(microlcPrimaryColor)}</style>
      <style>{parseCssVariable([styles, antd])}</style>
      {props.loading ? 'loading' : 'Notification Center'}
      <Button className='next-button' style={{marginLeft: 8}} type='primary'>{'Next'}</Button>
      <button onClick={props.reload}>{'reload'}</button>
    </Fragment>
  )
}
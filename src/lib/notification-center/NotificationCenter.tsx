import React, {ReactElement, useEffect, Fragment} from 'react'

import {Button} from 'antd'

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
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(props.notifications)
  }, [props.loading, props.notifications?.length])
  return (
    <Fragment>
      {props.loading ? 'loading' : 'Notification Center'}
      <Button className='nextButton' style={{marginLeft: 8}} type='primary'>{'Next'}</Button>
      <button onClick={props.reload}>{'reload'}</button>
    </Fragment>
  )
}
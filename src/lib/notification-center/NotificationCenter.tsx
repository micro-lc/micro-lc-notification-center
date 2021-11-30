import React, {ReactElement, useEffect, Fragment, useMemo} from 'react'

import {BellOutlined, ReloadOutlined} from '@ant-design/icons'
import {Button, Popover, Row, Col} from 'antd'
import antd from 'antd/dist/antd.css'

import {parseCssVariable, setCssVariables} from '../utils/css.utils'
import styles from './notification-center.css'
import NotificationsList from './NotificationsList'

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

  const Title = () => (
    <Row>
      <Col span={20}>
        <h2 className='notification-header'>{'Notifications'}</h2>
      </Col>
      <Col span={4}>
        <Button 
          icon={<ReloadOutlined />} 
          loading={props.loading} 
          onClick={props.reload} 
          shape='circle' 
          style={{marginLeft: '10px'}} 
          type='text' 
        />
      </Col>
    </Row>
  )

  return (
    <Fragment>
      <style>{setCssVariables(microlcPrimaryColor)}</style>
      <style>{parseCssVariable([styles, antd])}</style>
      <Popover 
        content={<NotificationsList loading={props.loading} next={props.next} notifications={props.notifications}/>} 
        placement='bottomRight' 
        title={<Title />} 
        trigger='click'
      >
        <Button shape='circle' style={{color: 'white'}} type='primary'>
          <BellOutlined />
        </Button>
      </Popover>
    </Fragment>
  )
}
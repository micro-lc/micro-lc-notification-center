import React, {ReactElement, useMemo} from 'react'

import {BellOutlined} from '@ant-design/icons'
import {Button, Popover, Badge} from 'antd'
import antd from 'antd/dist/antd.variable.min.css'

import {parseCssVariable} from '../utils/css.utils'
import {I18n, DefaultTranslations, PartialTranslations} from '../utils/i18n.utils'
import styles from './notification-center.css'
import NotificationsList from './NotificationsList'
import PopupTitle from './PopupTitle'

type ReadStateHandler = (notification: Notification, index: number) => Promise<void>

type AllReadStateHandler = () => Promise<number>

export type Notification = {
  _id: string
  creatorId: string
  createdAt: string
  title: string
  readState?: boolean
}

export type NotificationCenterProps = {
  loading?: boolean
  notifications: Notification[]
  next: () => void
  reload: () => void
  locales: PartialTranslations
  error: boolean
  done: boolean
  onClick: ReadStateHandler
  onClickAll: AllReadStateHandler
  count?: number
  unread?: number
}

const defaultTranslations: DefaultTranslations = {
  title: 'Notifications',
  loadingButton: 'Load More',
  dateFormat: 'YYYY-MM-DD',
  noNotification: 'No notification to show',
  errorMessage: 'An error occurred, try again',
  readAll: 'Mark all as read',
  reload: 'Reload'
}

type PopoverContainerProps = {
  id: string
}

function PopoverContainer ({id}: PopoverContainerProps) {
  return (
    <div id={id}></div>
  )
}

function NotificationCenter ({
  notifications,
  loading,
  locales,
  reload,
  next,
  error,
  done,
  onClick,
  onClickAll,
  unread
}: NotificationCenterProps): ReactElement {
  const containerId = useMemo(() => `micro-lc-notification-center-${Math.random().toString(36)}`, [])

  return (
    <I18n.Provider value={{defaultTranslations, locales}}>
      <style>{parseCssVariable([styles, antd])}</style>
      <PopoverContainer id={containerId} />
      <Popover
        arrowPointAtCenter
        className='popover-content-container'
        content={
          <NotificationsList
            done={done}
            error={error}
            loading={loading}
            next={next}
            notifications={notifications}
            onClick={onClick}
          />
        }
        getPopupContainer={() => document.getElementById(containerId)}
        placement='bottomRight'
        title={<PopupTitle loading={loading} onClickAll={onClickAll} reload={reload} unread={unread > 0}/>}
        trigger='click'
      >
        <Badge count={unread} offset={[-5, 5]} size='small' style={{paddingLeft: '3px', paddingRight: '3px'}}>
          <Button
            shape='circle'
            style={{color: 'white', padding: 'initial'}}
            type='primary'
          >
            <BellOutlined />
          </Button>
        </Badge>
      </Popover>
    </I18n.Provider>
  )
}

export default NotificationCenter
export {defaultTranslations}

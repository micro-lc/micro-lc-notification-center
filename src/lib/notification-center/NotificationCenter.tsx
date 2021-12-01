import React, {ReactElement, useMemo} from 'react'

import {BellOutlined} from '@ant-design/icons'
import {Button, Popover} from 'antd'
import antd from 'antd/dist/antd.variable.min.css'

import {parseCssVariable, setCssVariables} from '../utils/css.utils'
import {I18n, DefaultTranslations, PartialTranslations} from '../utils/i18n.utils'
import styles from './notification-center.css'
import NotificationsList from './NotificationsList'
import PopupTitle from './PopupTitle'

const MICROLC_PRIMARY_COLOR_VAR = '--microlc-primary-color'

type ReadStateHandler = (_id: string, readState?: boolean) => Promise<void>

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
}

const defaultTranslations: DefaultTranslations = {
  title: 'Notifications', 
  loadingButton: 'Load More', 
  dateFormat: 'YYYY-MM-DD',
  noNotification: 'No notification to show',
  errorMessage: 'An error occurred, try again'
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
  onClickAll
}: NotificationCenterProps): ReactElement {
  const microlcPrimaryColor = useMemo(() => getComputedStyle(document.documentElement).getPropertyValue(MICROLC_PRIMARY_COLOR_VAR), [])
  let customNotifications = notifications

  const markAsRead = (id) => {
    onClick(id)
  }

  return (
    <I18n.Provider value={{defaultTranslations, locales}}>
      <style>{setCssVariables(microlcPrimaryColor)}</style>
      <style>{parseCssVariable([styles, antd])}</style>
      <Popover 
        arrowPointAtCenter
        content={ 
          <NotificationsList 
            done={done} 
            error={error}
            loading={loading}
            next={next}
            notifications={customNotifications}
            onClick={markAsRead}
          />
        }
        placement='bottomRight' 
        title={<PopupTitle loading={loading} onClickAll={onClickAll} reload={reload} />} 
        trigger='click'
      >
        <Button 
          shape='circle' 
          style={{color: 'white', padding: 'initial'}} 
          type='primary'
        >
          <BellOutlined />
        </Button>
      </Popover>
    </I18n.Provider>
  )
}

export default NotificationCenter
export {defaultTranslations}

import React, {ReactElement} from 'react'

import {Typography} from 'antd'

import {useLocale} from '../utils/i18n.utils'
import {NotificationCenterProps} from './NotificationCenter'
import NotificationEntry from './NotificationEntry'

const {Text} = Typography

export type NotificationsListProps = Omit<NotificationCenterProps, 'locales' | 'reload' | 'onClickAll'>

export default function NotificationsList ({
  error,
  done,
  loading,
  onClick,
  next,
  notifications
}: NotificationsListProps) : ReactElement {
  const {t} = useLocale()

  return (
    <div className='notification-container'>
      {error && <Text type='danger'>{t('errorMessage')}</Text>}
      {
        notifications.map((notification, i) => (
          <NotificationEntry
            key={i} 
            onClick={() => onClick(notification, i)}
            {...notification}
          />
        ))
      }
      {
        !done &&
          <div style={{textAlign: 'center', marginBottom: '5px'}}>
            <Text className='notification-button' disabled={loading} onClick={next} style={{marginBottom: '5px !important'}} >{t('loadingButton')}</Text>
          </div>
      }
    </div>
  )
}

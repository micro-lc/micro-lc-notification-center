import React, {ReactElement, useCallback, useMemo} from 'react'

import {Typography} from 'antd'

import {useLocale} from '../utils/i18n.utils'
import {getLink} from '../utils/url.utils'
import {NotificationCenterProps, Notification} from './NotificationCenter'
import NotificationEntry from './NotificationEntry'

const {Text} = Typography

export type NotificationsListProps = Omit<NotificationCenterProps, 'locales' | 'reload' | 'onClickAll'>

function handleClick (onClick: NotificationsListProps['onClick'], notification: Notification, i: number): () => Promise<void> {
  return async () => {
    const link = getLink(notification)
    await onClick(notification, i).finally(() => {
      link.click()
    })
  }
}

export default function NotificationsList ({
  error,
  done,
  loading,
  onClick,
  next,
  notifications
}: NotificationsListProps): ReactElement {
  const {t} = useLocale()

  const containerId = useMemo(() => `micro-lc-notification-center-${Math.random().toString(36)}`, [])
  const handleBackOnTop = useCallback(() => { document.getElementById(containerId).scrollTo(0, 0) }, [containerId])
  const renderFooter = useCallback(() => done ?
    <Text className='notification-button' disabled={loading} onClick={handleBackOnTop} style={{marginBottom: '5px !important'}} >{t('backOnTop')}</Text> :
    <Text className='notification-button' disabled={loading} onClick={next} style={{marginBottom: '5px !important'}} >{t('loadingButton')}</Text>
  , [done, handleBackOnTop, loading, next, t])

  return (
    <div className='notification-container' data-testid='notifications-container' id={containerId}>
      {error && <Text className='display-message' type='danger'>{t('errorMessage')}</Text>}
      {notifications.map((notification, i) => (
          <NotificationEntry
            key={i}
            onClick={handleClick(onClick, notification, i)}
            {...notification}
          />
      ))}
      {notifications.length === 0 && <Text className='display-message'>{t('noNotification')}</Text>}
      <div role='button' style={{textAlign: 'center', marginBottom: '5px'}} tabIndex={0}>
        {renderFooter()}
      </div>
    </div>
  )
}

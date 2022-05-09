import React, {ReactElement, useCallback, useRef} from 'react'

import Typography from 'antd/es/typography'

import {useLocale} from '../utils/i18n'
import type {NotificationCenterProps} from './NotificationCenter'
import NotificationEntry from './NotificationEntry'

export type NotificationsListProps = Omit<
  NotificationCenterProps,
  'locales' | 'reload' | 'onClickAll'
>

const makeitButton = (ref?: HTMLElement) => {
  ref?.setAttribute('role', 'button')
  ref?.setAttribute('tabindex', '0')
}

export default function NotificationsList({
  error,
  done,
  loading,
  onClick,
  next,
  notifications
}: NotificationsListProps): ReactElement {
  const {t} = useLocale()
  const ref = useRef<HTMLDivElement>()

  const handleBackOnTop = useCallback(() => {
    ref.current.scrollTo(0, 0)
  }, [])
  const renderFooter = useCallback(
    () =>
      done ? (
        <Typography.Text
          ref={makeitButton}
          className="notification-button"
          disabled={loading}
          onClick={handleBackOnTop}
          style={{marginBottom: '5px'}}
        >
          {t('backOnTop')}
        </Typography.Text>
      ) : (
        <Typography.Text
          ref={makeitButton}
          className="notification-button"
          disabled={loading}
          onClick={next}
          style={{marginBottom: '5px !important'}}
        >
          {t('loadingButton')}
        </Typography.Text>
      ),
    [done, handleBackOnTop, loading, next, t]
  )

  return (
    <div
      className="notification-container"
      data-testid="notifications-container"
      ref={ref}
    >
      {error && (
        <Typography.Text className="display-message" type="danger">
          {t('errorMessage')}
        </Typography.Text>
      )}
      {notifications.map((notification, i) => (
        <NotificationEntry
          key={i}
          onClick={() => onClick(notification, i)}
          {...notification}
        />
      ))}
      {notifications.length === 0 && (
        <Typography.Text className="display-message">{t('noNotification')}</Typography.Text>
      )}
      <div
        style={{textAlign: 'center', marginBottom: '5px'}}
      >
        {renderFooter()}
      </div>
    </div>
  )
}

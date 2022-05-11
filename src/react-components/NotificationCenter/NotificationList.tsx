import React, {ReactElement, useCallback, useRef} from 'react'

import {Typography} from 'antd/es'

import type {NotificationCenterProps} from './NotificationCenter'
import {NotificationEntry} from './NotificationEntry'

export type NotificationsListProps = Omit<
  NotificationCenterProps,
  'reload' | 'onClickAll'
>

const makeitButton = (ref?: HTMLElement) => {
  ref?.setAttribute('role', 'button')
  ref?.setAttribute('tabindex', '0')
}

export function NotificationsList({
  error,
  done,
  loading,
  onClick,
  next,
  notifications,
  locales
}: NotificationsListProps): ReactElement {
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
          {locales.backOnTop}
        </Typography.Text>
      ) : (
        <Typography.Text
          ref={makeitButton}
          className="notification-button"
          disabled={loading}
          onClick={next}
          style={{marginBottom: '5px !important'}}
        >
          {locales.loadingButton}
        </Typography.Text>
      ),
    [done, handleBackOnTop, loading, next]
  )

  return (
    <div
      className="notification-container"
      data-testid="notifications-container"
      ref={ref}
    >
      {error && (
        <Typography.Text className="display-message" type="danger">
          {locales.errorMessage}
        </Typography.Text>
      )}
      {notifications.map((notification, i) => (
        <NotificationEntry
          key={i}
          onClick={() => onClick(notification, i)}
          {...notification}
          locales={locales}
        />
      ))}
      {notifications.length === 0 && (
        <Typography.Text className="display-message">{locales.noNotification}</Typography.Text>
      )}
      <div
        style={{textAlign: 'center', marginBottom: '5px'}}
      >
        {renderFooter()}
      </div>
    </div>
  )
}

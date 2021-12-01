import React, {ReactElement, Fragment} from 'react'

import {Button, Typography} from 'antd'

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
    <Fragment>
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
          <div style={{textAlign: 'center'}}>
            <Button loading={loading} onClick={next} type='primary'>{t('loadingButton')}</Button>
          </div>
      }
    </Fragment>
  )
}

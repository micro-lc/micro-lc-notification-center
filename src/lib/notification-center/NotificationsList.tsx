import React, {ReactElement, Fragment} from 'react'

import {Button, Typography} from 'antd'

import {useLocale} from '../utils/i18n.utils'
import {Notification} from './NotificationCenter'
import NotificationEntry from './NotificationEntry'

const {Text} = Typography
export type NotificationsListProps = {
    notifications: Notification[]
    next?: () => void
    loading?: boolean
    error?: boolean
  }

export default function NotificationsList (props: NotificationsListProps) : ReactElement {
  const {t} = useLocale()
    return (
      props.error ? <Text type='danger'>{t('errorMessage')}</Text> : 
        <div className='notification-container'>
            {props.notifications.length > 0 ?
                <Fragment>
                    {props.notifications.map((notification,i) => <NotificationEntry date={notification.createdAt.toString()} key={i} title={notification.title}/>)}
                </Fragment>            :
                <p>{t('noNotification')}</p>
            }
            <div style={{textAlign: 'center'}}>
                <Button loading={props.loading} onClick={props.next} type='primary'>{t('loadingButton')}</Button>
            </div>
        </div>
    )
}

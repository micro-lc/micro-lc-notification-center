import React, {ReactElement, Fragment} from 'react'

import {Button, Typography} from 'antd'

import {useLocale} from '../utils/i18n.utils'
import {Notification} from './NotificationCenter'
import NotificationEntry from './NotificationEntry'

const {Text} = Typography
export type NotificationsListProps = {
    notifications: Notification[]
    next: () => void
    loading: boolean
    error: boolean
    done: boolean
    onClick: (id: string) => void
  }

export default function NotificationsList (props: NotificationsListProps) : ReactElement {
  const {t} = useLocale()
    return (
      props.error ? <Text type='danger'>{t('errorMessage')}</Text> : 
        <div className='notification-container'>
            {props.notifications.length > 0 ?
                <Fragment>
                    {props.notifications.map((notification,i) => (
                      <NotificationEntry 
                        date={notification.createdAt.toString()} 
                        id={notification._id} 
                        key={i} 
                        onClick={props.onClick}
                        readState={notification.readState}
                        title={notification.title}
                      />
                    ))}
                </Fragment>            :
                <p>{t('noNotification')}</p>
            }
            {props.done ? <Fragment/> :
              <div style={{textAlign: 'center'}}>
                <Button loading={props.loading} onClick={props.next} type='primary'>{t('loadingButton')}</Button>
              </div>
            }
        </div>
    )
}

import React, {ReactElement, Fragment} from 'react';

import {Button} from 'antd';

import {Notification} from '.';
import {NotificationEntry} from '.';

export type NotificationsListProps = {
    notifications: Notification[]
    next?: () => void
    loading?: boolean
  }

export default function NotificationsList (props: NotificationsListProps) : ReactElement {
    return (
        <div className='notification-container'>
            {props.notifications.length > 0 ?
                <Fragment>
                    {props.notifications.map((notification,i) => <NotificationEntry date={notification.createdAt.toString()} key={i} title={notification.title}/>)}
                </Fragment>            :
                <p>{'No notifications'}</p>
            }
            <div style={{textAlign: 'center'}}>
                <Button loading={props.loading} onClick={props.next} type='primary'>{'Load more'}</Button>
            </div>
        </div>
    )
}

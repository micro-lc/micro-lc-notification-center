import React, {ReactElement, Fragment} from 'react'

import {Typography, Divider} from 'antd'


const {Text, Title} = Typography

export type NotificationEntryProps = {
    title?: string
    date?: string
  }

export default function NotificationEntry (props: NotificationEntryProps) : ReactElement {
    return (
        <Fragment>
          <Title className='title' ellipsis={{rows: 3}} level={5}>{props.title}</Title>
          <Text ellipsis={true} style={{fontSize: '11px'}} type='secondary'>{props.date.split('T')[0]}</Text>
          <Divider style={{margin: '10px 0px'}}/>
        </Fragment>
    )
}
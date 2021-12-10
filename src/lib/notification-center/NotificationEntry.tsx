import React, {ReactElement, Fragment} from 'react'

import {Divider, Badge, Row, Col, Typography} from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/it'

import {useLocale} from '../utils/i18n.utils'
import {Notification} from './NotificationCenter'

const {Text, Paragraph} = Typography
export type NotificationEntryProps = Notification & {
  onClick: () => void
}

export default function NotificationEntry ({title, content, createdAt, readState, onClick}: NotificationEntryProps) : ReactElement {
  const {t, lang} = useLocale()

  return (
    <Fragment>
      <Row className='notification-item' data-testid='notification-row' onClick={onClick} role='button' style={{paddingLeft: '5px', paddingRight: '5px'}} tabIndex={0}>
        <Col span={22}>
          <Paragraph ellipsis style={{marginBottom: '0px', fontSize: 'small'}}>{title}</Paragraph>
          <Paragraph ellipsis style={{marginBottom: '0px', fontSize: 'x-small'}}>{content}</Paragraph>
          <Text className='notification-date'>{dayjs(createdAt).locale(lang).format(t('dateFormat'))}</Text>
        </Col>
        <Col data-testid='notification-badge' span={2} style={{textAlign: 'center', margin: 'auto'}}>
          {readState === true ? <Fragment/> : <Badge className='notification-badge' color=''/>}
        </Col>
      </Row>
      <Divider style={{margin: '5px 0px'}}/>
    </Fragment>
  )
}

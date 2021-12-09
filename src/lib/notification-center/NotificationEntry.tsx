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

export default function NotificationEntry ({title, createdAt, readState, onClick}: NotificationEntryProps) : ReactElement {
  const {t, lang} = useLocale()

  return (
    <Fragment>
      <Row className='notification-item' data-testid='notification-row' onClick={onClick} style={{paddingLeft: '5px', paddingRight: '5px'}}>
        <Col span={22}>
          <Paragraph ellipsis={{rows: 3}} style={{marginBottom: '0px'}}>{title}</Paragraph>
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

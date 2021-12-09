import React, {ReactElement, Fragment} from 'react'

import {Row, Col, Typography} from 'antd'

import {useLocale} from '../utils/i18n.utils'

const {Title, Text} = Typography

export type PopupTitleProps = {
    loading?: boolean
    reload?: () => void
    onClickAll?: () => void
    unread?: boolean
  }

export default function PopupTitle (props: PopupTitleProps) : ReactElement {
  const {t} = useLocale()
  return (
    <Fragment>
    <Row>
      <Col>
        <Title className='notification-header' ellipsis={true} level={4} style={{marginBottom: '0px'}}>{t('title')}</Title>
      </Col>
    </Row>
    <Row justify='space-between'>
      <Col sm={8}>
        <Text
          className='notification-button'
          disabled={props.loading}
          ellipsis={true}
          onClick={props.reload}
        >{t('reload')}</Text>
      </Col>
      <Col sm={16} style={{textAlign: 'end'}}>
        {props.unread ?
        <Text
          className='notification-button'
          disabled={props.loading}
          ellipsis={true}
          onClick={props.onClickAll}
        >{t('readAll')}</Text> :
        <Fragment></Fragment>}
      </Col>
    </Row>
    </Fragment>
  )
}

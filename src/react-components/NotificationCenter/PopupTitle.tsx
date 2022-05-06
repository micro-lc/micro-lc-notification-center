import React, {ReactElement, Fragment} from 'react'

import Row from 'antd/es/row'
import Col from 'antd/es/col'
import Typography from 'antd/es/typography'

import {useLocale} from '../utils/i18n'

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
          <Typography.Title className='notification-header' ellipsis={true} level={4} style={{marginBottom: '0px'}}>{t('title')}</Typography.Title>
        </Col>
      </Row>
      <Row justify='space-between'>
        <Col role='button' sm={8} tabIndex={0}>
          <Typography.Text
            className='notification-button'
            disabled={props.loading}
            ellipsis={true}
            onClick={props.reload}
          >{t('reload')}</Typography.Text>
        </Col>
        <Col role='button' sm={16} style={{textAlign: 'end'}} tabIndex={0}>
          {props.unread ?
            <Typography.Text
              className='notification-button'
              disabled={props.loading}
              ellipsis={true}
              onClick={props.onClickAll}
            >{t('readAll')}</Typography.Text> :
            <Fragment></Fragment>}
        </Col>
      </Row>
    </Fragment>
  )
}

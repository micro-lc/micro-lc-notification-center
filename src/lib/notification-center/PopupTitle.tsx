import React, {ReactElement, Fragment} from 'react'

import {ReloadOutlined} from '@ant-design/icons'
import {Row, Col, Button} from 'antd'

import {useLocale} from '../utils/i18n.utils'

export type PopupTitleProps = {
    loading?: boolean
    reload?: () => void
    onClickAll?: () => void
  }

export default function PopupTitle (props: PopupTitleProps) : ReactElement {
  const {t} = useLocale()
  return (
    <Fragment>
    <Row justify='space-between'>
      <Col span={16}>
        <h2 className='notification-header'>{t('title')}</h2>
      </Col>
      <Col span={3}>
        <Button 
          icon={<ReloadOutlined />} 
          loading={props.loading} 
          onClick={props.reload} 
          shape='circle' 
          type='text' 
        />
      </Col>
      <Col span={5}>
        <Button 
            loading={props.loading} 
            onClick={props.onClickAll} 
            shape='circle'  
            type='text' 
        >{'Read all'}</Button>
      </Col>
    </Row>
    </Fragment>
  )
}
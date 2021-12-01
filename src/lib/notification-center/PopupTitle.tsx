import React, {ReactElement} from 'react'

import {ReloadOutlined} from '@ant-design/icons'
import {Row, Col, Button} from 'antd'

import {useLocale} from '../utils/i18n.utils'

export type PopupTitleProps = {
    loading?: boolean
    reload?: () => void
  }

export default function PopupTitle (props: PopupTitleProps) : ReactElement {
  const {t} = useLocale()
  return (
    <Row>
      <Col span={20}>
        <h2 className='notification-header'>{t('title')}</h2>
      </Col>
      <Col span={4}>
        <Button 
          icon={<ReloadOutlined />} 
          loading={props.loading} 
          onClick={props.reload} 
          shape='circle' 
          style={{marginLeft: '10px'}} 
          type='text' 
        />
      </Col>
    </Row>
  )
}
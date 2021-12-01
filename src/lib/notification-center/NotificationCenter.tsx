import React, {ReactElement, useMemo} from 'react'

import {BellOutlined, ReloadOutlined} from '@ant-design/icons'
import {Button, Popover, Row, Col} from 'antd'
import antd from 'antd/dist/antd.css'

import {parseCssVariable, setCssVariables} from '../utils/css.utils'
import {I18n, DefaultTranslations, PartialTranslations, useLocale} from '../utils/i18n.utils'
import styles from './notification-center.css'
import NotificationsList from './NotificationsList'

const MICROLC_PRIMARY_COLOR_VAR = '--microlc-primary-color'

export type Notification = {
  _id: string
  creatorId: string
  createdAt: string
  title: string
}

export type NotificationCenterProps = {
  loading?: boolean
  notifications?: Notification[]
  next?: () => void
  reload?: () => void
  locales?: PartialTranslations
  error?: boolean
}

const defaultTranslations: DefaultTranslations = {
  title: 'Notifications', 
  loadingButton: 'Load More', 
  dateFormat: 'YYYY-MM-DD'
}

function NotificationCenter ({
  notifications = [], 
  loading, 
  locales, 
  reload, 
  next
}: NotificationCenterProps): ReactElement {
  const microlcPrimaryColor = useMemo(() => getComputedStyle(document.documentElement).getPropertyValue(MICROLC_PRIMARY_COLOR_VAR), [])
  const {t} = useLocale()

  const Title = () => (
    <Row>
      <Col span={20}>
        <h2 className='notification-header'>{t('title')}</h2>
      </Col>
      <Col span={4}>
        <Button 
          icon={<ReloadOutlined />} 
          loading={loading} 
          onClick={reload} 
          shape='circle' 
          style={{marginLeft: '10px'}} 
          type='text' 
        />
      </Col>
    </Row>
  )

  return (
    <I18n.Provider value={{defaultTranslations, locales}}>
      <style>{setCssVariables(microlcPrimaryColor)}</style>
      <style>{parseCssVariable([styles, antd])}</style>
      <Popover 
        content={
          <NotificationsList 
            loading={loading} 
            next={next} 
            notifications={notifications}
          />
        } 
        placement='bottomRight' 
        title={<Title />} 
        trigger='click'
      >
        <Button 
          shape='circle' 
          style={{color: 'white'}} 
          type='primary'
        >
          <BellOutlined />
        </Button>
      </Popover>
    </I18n.Provider>
  )
}

export default NotificationCenter
export {defaultTranslations}

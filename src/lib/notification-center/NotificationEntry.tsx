import React, {ReactElement, Fragment} from 'react'

import {List, Divider, Badge} from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/it'

import {useLocale} from '../utils/i18n.utils'
import {Notification} from './NotificationCenter'

export type NotificationEntryProps = Notification & {
  onClick: () => void
}

export default function NotificationEntry ({title, createdAt, readState, onClick}: NotificationEntryProps) : ReactElement {
  const {t, lang} = useLocale()

  return (
    <Fragment>
      <List.Item onClick={onClick}>
        <List.Item.Meta
          description={dayjs(createdAt).locale(lang).format(t('dateFormat'))}
          title={title}
        />
        {readState === true ? <Fragment/> : <Badge color='magenta'/>}
      </List.Item>
      <Divider style={{margin: '5px 0px'}}/>
    </Fragment>
  )
}
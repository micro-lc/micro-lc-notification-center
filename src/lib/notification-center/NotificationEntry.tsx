import React, {ReactElement, Fragment} from 'react'

import {List, Divider, Badge} from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/it'

import {useLocale} from '../utils/i18n.utils'

export type NotificationEntryProps = {
    title?: string
    date?: string
    readState?: boolean
    id?: string
    onClick?
  }

export default function NotificationEntry ({title, date, readState, id, onClick}: NotificationEntryProps) : ReactElement {
  const {t, lang} = useLocale()

  return (
    <Fragment>
      <List.Item onClick={() => onClick(id)}>
        <List.Item.Meta
          description={dayjs(date).locale(lang).format(t('dateFormat'))}
          title={title}
        />
        {readState === true ? <Fragment/> : <Badge color='magenta'/>}
      </List.Item>
      <Divider style={{margin: '5px 0px'}}/>
    </Fragment>
  )
}
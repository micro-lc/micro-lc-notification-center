import React, {ReactElement, Fragment} from 'react'

import {Typography, Divider} from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/it'

import {useLocale} from '../utils/i18n.utils'


const {Text, Title} = Typography

export type NotificationEntryProps = {
    title?: string
    date?: string
  }

export default function NotificationEntry (props: NotificationEntryProps) : ReactElement {
  const {t, lang} = useLocale()
  return (
    <Fragment>
      <Title className='title' ellipsis={{rows: 3}} level={5}>{props.title}</Title>
      <Text ellipsis={true} style={{fontSize: '11px'}} type='secondary'>{dayjs(props.date).locale(lang).format(t('dateFormat'))}</Text>
      <Divider style={{margin: '10px 0px'}}/>
    </Fragment>
  )
}
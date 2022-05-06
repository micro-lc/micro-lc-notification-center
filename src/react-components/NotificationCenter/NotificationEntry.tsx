import React, {ReactElement, Fragment} from 'react'

import Divider from 'antd/es/divider'
import Badge from 'antd/es/badge'
import Row from 'antd/es/row'
import Col from 'antd/es/col'
import Typography from 'antd/es/typography'

import {useLocale} from '../utils/i18n'
import type {Notification} from './NotificationCenter'
import dayjs from 'dayjs'

export type NotificationEntryProps = Notification & {
  onClick: () => void;
};

export default function NotificationEntry({
  title,
  content,
  createdAt,
  readState,
  onClick,
}: NotificationEntryProps): ReactElement {
  const {t} = useLocale()

  return (
    <Fragment>
      <Row
        className="notification-item"
        data-testid="notification-row"
        onClick={onClick}
        role="button"
        style={{paddingLeft: '5px', paddingRight: '5px'}}
        tabIndex={0}
      >
        <Col span={22}>
          <Typography.Paragraph
            ellipsis
            style={{marginBottom: '0px', fontSize: 'small'}}
          >
            {title}
          </Typography.Paragraph>
          <Typography.Paragraph
            ellipsis
            style={{marginBottom: '0px', fontSize: 'x-small'}}
          >
            {content}
          </Typography.Paragraph>
          <Typography.Text className="notification-date">
            {dayjs(createdAt).format(t('dateFormat'))}
          </Typography.Text>
        </Col>
        <Col
          data-testid="notification-badge"
          span={2}
          style={{textAlign: 'center', margin: 'auto'}}
        >
          {readState === true ? (
            <Fragment />
          ) : (
            <Badge className="notification-badge" color="" />
          )}
        </Col>
      </Row>
      <Divider style={{margin: '5px 0px'}} />
    </Fragment>
  )
}

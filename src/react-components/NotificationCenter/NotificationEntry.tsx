import React, {ReactElement, Fragment} from 'react'

import {Divider, Badge, Row, Col, Typography} from 'antd/es'

import type {Notification} from './NotificationCenter'
import dayjs from 'dayjs'
import {DefaultTranslations} from '../../utils/i18n'

export type NotificationEntryProps = Notification & {
  onClick: () => void;
  locales: DefaultTranslations
};

export function NotificationEntry({
  title,
  content,
  createdAt,
  readState,
  onClick,
  locales
}: NotificationEntryProps): ReactElement {

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
            {dayjs(createdAt).format(locales.dateFormat)}
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

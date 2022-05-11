import React, {ReactElement, useEffect, useState} from 'react'

import {BellOutlined} from '@ant-design/icons/es/icons'
import {Popover, Badge} from 'antd/es'

import {DefaultTranslations} from '../../utils/i18n'
import {NotificationsList} from './NotificationList'
import {PopupTitle} from './PopupTitle'

type ReadStateHandler = (
  notification: Notification,
  index: number
) => Promise<void>;

type AllReadStateHandler = () => Promise<void | number>;

export type CallbackHref = {
  content: string | Record<string, any>;
};

export type Notification = {
  _id: string;
  creatorId: string;
  createdAt: string;
  title: string;
  readState?: boolean;
  content?: string;
  onClickCallback?: CallbackHref;
};

export type NotificationCenterProps = {
  loading?: boolean;
  notifications: Notification[];
  next?: () => void;
  reload: () => Promise<void>;
  locales: DefaultTranslations;
  error: boolean;
  done: boolean;
  onClick: ReadStateHandler;
  onClickAll: AllReadStateHandler;
  count?: number;
  unread?: number;
};

export function NotificationCenter({
  loading,
  reload,
  onClick,
  onClickAll,
  unread,
  ...rest
}: NotificationCenterProps): ReactElement {
  const [clickOutside, setClickOutside] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if(clickOutside) {
      const t = setTimeout(() => {
        setClickOutside(false)
      }, 200)

      return () => clearTimeout(t)
    }
  }, [clickOutside])

  return (
    <Popover
      arrowPointAtCenter
      className="popover-content-container"
      content={
        <NotificationsList
          loading={loading}
          onClick={async (notification, index) => {
            setVisible(false)
            return onClick(notification, index)
          }}
          {...rest}
        />
      }
      getPopupContainer={(node) => node}
      onVisibleChange={(v) => {
        setClickOutside(true)
        !v && setVisible(v)
      }}
      placement="bottomRight"
      title={
        <PopupTitle
          loading={loading}
          onClickAll={onClickAll}
          reload={reload}
          unread={unread > 0}
          locales={rest.locales}
        />
      }
      trigger="click"
      visible={visible}
    >
      <Badge
        count={unread}
        offset={[-5, 5]}
        size="small"
        style={{paddingLeft: '3px', paddingRight: '3px'}}
      >
        <button
          type="button"
          className="ant-btn ant-btn-circle ant-btn-primary"
          style={{color: 'white', padding: 'initial'}}
          onClick={() => {!clickOutside && setVisible(t => !t)}}
        >
          <BellOutlined />
        </button>
      </Badge>
    </Popover>
  )
}

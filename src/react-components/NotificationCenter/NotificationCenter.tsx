import React, {ReactElement, useState} from 'react'

import {BellOutlined} from '@ant-design/icons/es/icons'
import Popover from 'antd/es/popover'
import Badge from 'antd/es/badge'

import {I18n, DefaultTranslations, PartialTranslations} from '../utils/i18n'
import NotificationsList from './NotificationList'
import PopupTitle from './PopupTitle'

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
  reload: () => void;
  locales: PartialTranslations;
  error: boolean;
  done: boolean;
  onClick: ReadStateHandler;
  onClickAll: AllReadStateHandler;
  count?: number;
  unread?: number;
};

export const defaultTranslations: DefaultTranslations = {
  title: 'Notifications',
  loadingButton: 'Load More',
  dateFormat: 'YYYY-MM-DD',
  noNotification: 'No notification to show',
  errorMessage: 'An error occurred, try again',
  readAll: 'Mark all as read',
  reload: 'Reload',
  backOnTop: 'Back on top',
}

export function NotificationCenter({
  loading,
  locales,
  reload,
  onClick,
  onClickAll,
  unread,
  ...rest
}: NotificationCenterProps): ReactElement {
  const [visible, setVisible] = useState(false)

  return (
    <I18n.Provider value={{defaultTranslations, locales}}>
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
          !v && setVisible(v)
        }}
        placement="bottomRight"
        title={
          <PopupTitle
            loading={loading}
            onClickAll={onClickAll}
            reload={reload}
            unread={unread > 0}
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
            onClick={() => {
              setVisible((t) => !t)
            }}
          >
            <BellOutlined />
          </button>
        </Badge>
      </Popover>
    </I18n.Provider>
  )
}

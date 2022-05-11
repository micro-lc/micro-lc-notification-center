import React, {ReactElement, Fragment} from 'react'

import {Row, Col, Typography} from 'antd/es'

import {DefaultTranslations} from '../../utils/i18n'
import {useRef} from 'react'
import {useEffect} from 'react'

export type PopupTitleProps = {
    loading?: boolean
    reload?: () => void
    onClickAll?: () => void
    unread?: boolean
    locales: DefaultTranslations
  }

const makeitButton = (ref?: HTMLElement) => {
  ref?.setAttribute('role', 'button')
  ref?.setAttribute('tabindex', '0')
}

export function PopupTitle (props: PopupTitleProps) : ReactElement {
  const reloadRef = useRef<HTMLHeadingElement>()
  const markAllReadRef = useRef<HTMLHeadingElement>()

  useEffect(() => {
    reloadRef.current?.setAttribute('tabindex', '0')
    markAllReadRef.current?.setAttribute('tabindex', '0')
  }, [reloadRef.current, markAllReadRef.current])
  
  return (
    <Fragment>
      <Row>
        <Col>
          <Typography.Title ellipsis={true} level={4} style={{marginBottom: '0px'}}>{props.locales.title}</Typography.Title>
        </Col>
      </Row>
      <Row justify='space-between'>
        <Col sm={8}>
          <Typography.Text
            ref={makeitButton}
            className='notification-button'
            disabled={props.loading}
            ellipsis={true}
            onClick={props.reload}
          >{props.locales.reload}</Typography.Text>
        </Col>
        {props.unread ?
          <Col sm={16} style={{textAlign: 'end'}}>
            <Typography.Text
              ref={makeitButton}
              className='notification-button'
              disabled={props.loading}
              ellipsis={true}
              onClick={props.onClickAll}
            >{props.locales.readAll}</Typography.Text>
          </Col> :
          <Fragment></Fragment>
        }
      </Row>
    </Fragment>
  )
}

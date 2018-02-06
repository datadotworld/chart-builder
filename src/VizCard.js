// @flow
import React, { PureComponent } from 'react'
import './VizCard.css'

export default class VizCard extends PureComponent {
  render () {
    return (
      <div className='VizCard'>
        {this.props.children}
      </div>
    )
  }
}

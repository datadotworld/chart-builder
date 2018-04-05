import React from 'react'
import Store from '../../util/Store'
import { DownloadButton, DownloadMenuItem } from '../DownloadButton'

it('renders', () => {
  const store = Store.create()
  snap(
    <DownloadButton store={store} getVegaView={() => {}} getData={() => []} />
  )
})

it('DownloadMenuItem renders', () => {
  snap(
    <DownloadMenuItem
      extension="json"
      baseName="testing"
      getDownloadUrl={() => 'foo.test'}
    >
      <span>hello</span>
    </DownloadMenuItem>
  )
})

// @flow
import React, { Fragment, Component } from 'react'
import { decorate, observable } from 'mobx'
import { observer, inject } from 'mobx-react'
import DevTools from 'mobx-react-devtools'
import { Grid } from 'react-bootstrap'
import { createParams } from '../util/util'
import App from './App'
import {
  REDIRECT_URI,
  CLIENT_ID,
  OAUTH_HOST,
  CLIENT_SECRET,
  API_HOST
} from '../util/constants'
import Header from '../components/Header'
import LoadingAnimation from '../components/LoadingAnimation'
import StateRestorationGate from './StateRestorationGate'
import type { StoreType } from '../util/Store'

// if no token, redirect to oauth
// if token, call /user to verify token
// if failure, redirect to oauth
// if success, show app

function generateAndStoreChallenge() {
  const challenge =
    Math.random()
      .toString(16)
      .substring(2) +
    Math.random()
      .toString(16)
      .substring(2)
  sessionStorage.setItem('oauth-challenge', challenge)
  return challenge
}

function getAndClearChallenge() {
  const challenge = sessionStorage.getItem('oauth-challenge')
  sessionStorage.removeItem('oauth-challenge')
  return challenge
}

function redirectToOauth() {
  const params = createParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    code_challenge_method: 'plain',
    code_challenge: generateAndStoreChallenge(),
    state: encodeURIComponent(window.location.search)
  })
  window.open(`${OAUTH_HOST}/oauth/authorize?${params.toString()}`, '_self')
}

async function fetchToken(code: string): Promise<{ access_token: string }> {
  const challenge = getAndClearChallenge()
  if (!challenge) {
    throw new Error('no challenge in storage')
  }
  const params = createParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    code_verifier: challenge
  })
  const resp = await fetch(`${OAUTH_HOST}/oauth/access_token`, {
    method: 'POST',
    body: params
  })
  if (!resp.ok) {
    throw new Error('cannot fetch token')
  }
  return resp.json()
}

async function verifyToken(token: string) {
  const resp = await fetch(`${API_HOST}/v0/user`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
  if (!resp.ok) {
    throw new Error('token not valid')
  }
}

class AuthGate extends Component<{
  history: Object,
  location: Object,
  store: StoreType
}> {
  hasValidToken: boolean = false

  componentDidMount() {
    const token = localStorage.getItem('token')
    const parsedParams = createParams(window.location.search)

    if (parsedParams.has('code')) {
      this.fetchToken()
    } else if (token) {
      this.verifyToken()
    } else {
      redirectToOauth()
    }
  }

  fetchToken = async () => {
    const parsedParams = createParams(window.location.search)
    const code = parsedParams.get('code')

    try {
      const data = await fetchToken(code)
      const token = data.access_token

      localStorage.setItem('token', token)
      this.props.store.setToken(token)
      this.props.history.push({
        path: '/',
        search: parsedParams.get('state')
      })
      this.hasValidToken = true
    } catch (e) {
      localStorage.removeItem('token')
      redirectToOauth()
    }
  }

  verifyToken = async () => {
    const token = localStorage.getItem('token')

    try {
      if (!token) {
        throw new Error('no token')
      }
      await verifyToken(token)
      this.props.store.setToken(token)
      this.hasValidToken = true
    } catch (e) {
      localStorage.removeItem('token')
      redirectToOauth()
    }
  }

  render() {
    if (this.hasValidToken) {
      return (
        <StateRestorationGate {...this.props}>
          <App {...this.props} key={this.props.location.search} />
        </StateRestorationGate>
      )
    }

    return (
      <Fragment>
        {process.env.NODE_ENV === 'development' && <DevTools />}
        <Header />
        <Grid style={{ marginTop: 32 }}>
          <LoadingAnimation hideOverlay />
        </Grid>
      </Fragment>
    )
  }
}

decorate(AuthGate, {
  hasValidToken: observable
})

export default inject('store')(observer(AuthGate))

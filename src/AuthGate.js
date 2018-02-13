// @flow
import React, { Fragment, Component } from 'react'
import { extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import DevTools from 'mobx-react-devtools'
import { Grid, Row, Col } from 'react-bootstrap'
import App from './App'
import {
  REDIRECT_URI,
  CLIENT_ID,
  OAUTH_HOST,
  CLIENT_SECRET,
  API_HOST
} from './constants'
import Header from './Header'

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
  const params = new URLSearchParams({
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
  const params = new URLSearchParams({
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
  location: Object
}> {
  hasValidToken: boolean

  constructor(props) {
    super(props)

    extendObservable(this, {
      hasValidToken: false
    })
  }

  componentDidMount() {
    const token = localStorage.getItem('token')
    const parsedParams = new URLSearchParams(window.location.search)

    if (parsedParams.has('code')) {
      this.fetchToken()
    } else if (token) {
      this.verifyToken()
    } else {
      redirectToOauth()
    }
  }

  fetchToken = async () => {
    const parsedParams = new URLSearchParams(window.location.search)
    const code = parsedParams.get('code')

    try {
      const data = await fetchToken(code)

      localStorage.setItem('token', data.access_token)
      this.hasValidToken = true
      this.props.history.push({
        path: '/',
        search: parsedParams.get('state')
      })
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
      this.hasValidToken = true
    } catch (e) {
      localStorage.removeItem('token')
      redirectToOauth()
    }
  }

  render() {
    if (this.hasValidToken) {
      return <App {...this.props} key={this.props.location.search} />
    }

    return (
      <Fragment>
        {process.env.NODE_ENV === 'development' && <DevTools />}
        <Header />
        <Grid style={{ marginTop: 32 }}>
          <Row>
            <Col xs={6}>
              <h4>Verifying credentials...</h4>
            </Col>
          </Row>
        </Grid>
      </Fragment>
    )
  }
}

export default observer(AuthGate)

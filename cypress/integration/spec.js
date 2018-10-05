const fetchMock = require('fetch-mock')

describe('Chart Explorer', function() {
  it('Visits the app', function() {
    const visitOptions = {
      onBeforeLoad: win => {
        let fetch = fetchMock.sandbox()
        fetch.get('https://api.data.world/v0/user', this.profile)
        fetch.post(
          'https://api.data.world/v0/sql/data-society/iris-species?includeTableSchema=true',
          this.queryResponse
        )
        fetch.get(
          'https://api.data.world/v0/datasets/data-society/iris-species',
          {
            accessLevel: 'WRITE',
            isProject: true
          }
        )
        fetch.put(
          'https://api.data.world/v0/uploads/data-society/iris-species/files/vega-lite.vl.json',
          { message: 'File uploaded.' }
        )
        fetch.get('glob:*/static/media/licenses*', 'cypress license text')
        cy.stub(win, 'fetch', fetch).as('fetch')

        win.localStorage.setItem('token', 'foo')
      }
    }

    cy.fixture('profile').as('profile')
    cy.fixture('queryResponse').as('queryResponse')

    cy.visit('/', visitOptions)

    // load example data
    cy.get('[data-test=example-link]').click()

    // set some chart options
    cy.get(
      ':nth-child(1) > [data-test=encoding-bar] > .css-1y3q4ke > .react-select__control > .react-select__indicators > .react-select__indicator'
    ).click()

    cy.get('#react-select-4-option-1').click()

    cy.get(
      ':nth-child(2) > [data-test=encoding-bar] > .css-1y3q4ke > .react-select__control > .react-select__indicators > .react-select__indicator'
    ).click()

    cy.get('#react-select-6-option-2').click()

    cy.get(
      '#configure-tabs-pane-builder > :nth-child(2) > .react-select__control > .react-select__indicators > .react-select__indicator'
    ).click()

    cy.get('#react-select-2-option-3').click()

    // toggle some advanced options
    cy.get('[data-test=encoding-container]:nth-child(1)').within(() => {
      cy.get('[data-test=toggle-adv-config]').click()
      cy.get('[data-test=bin-yes]').click()
      cy.get('[data-test=toggle-adv-config]').click()
    })

    cy.get('[data-test=encoding-container]:nth-child(2)').within(() => {
      cy.get('[data-test=toggle-adv-config]').click()
      cy.get('[data-test=zero-no]').click()
      cy.get('[data-test=toggle-adv-config]').click()
    })

    // add and remove encoding
    cy.get('[data-test=add-encoding]').click()

    cy.get(
      ':nth-child(4) > [data-test=encoding-bar] > [data-test=toggle-adv-config]'
    ).click()
    cy.get('[data-test=rm-encoding]').click()

    // check for editor existence
    cy.get('#configure-tabs-tab-editor').click()
    cy.get('.monaco-editor')
    cy.get('#configure-tabs-tab-builder').click()

    // check that titles work
    cy.get('[data-test=chart-title]').type('test title')
    cy.get('svg .role-title').contains('test title')

    // check that chart exists
    cy.get('[data-test=vega-embed]')

    cy.screenshot('page with viz')

    // check download options
    cy.get('#dropdown-download').click()

    cy.get('.open > .dropdown-menu > :nth-child(3) > a').trigger('mousedown')
    cy.get('.open > .dropdown-menu > :nth-child(3) > a').should($m => {
      expect($m).to.have.length(1)
      expect($m.attr('href')).to.match(/^blob/)
    })
    cy.get('#dropdown-download').click()

    // check download as insight
    cy.get('#dropdown-save-ddw').click()
    cy.get('.open > .dropdown-menu > :nth-child(3) > a').click()
    cy.get('.modal')

    cy.get('.btn-primary').click()

    cy.get('.alert-link').should(
      'have.attr',
      'href',
      'https://data.world/data-society/iris-species/workspace/file?filename=vega-lite.vl.json'
    )

    cy.get('.modal-footer > .btn').click()

    // check share link
    cy.get('#dropdown-save-ddw').click()
    cy.get('[data-test=share-btn]').click()

    cy.get('[data-test=share-url-text] input').then($i => {
      cy.visit($i.val(), visitOptions)
    })

    cy.get('[data-test=vega-embed]')
    cy.screenshot('page with viz after reload')

    cy.get('[data-test=license-open]').click()
    cy.get('[data-test=license-text]').contains('cypress license text')
  })
})

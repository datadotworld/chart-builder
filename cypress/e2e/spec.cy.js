const fetchMock = require('fetch-mock')

describe('Chart Builder', function() {
  let visitOptions
  beforeEach(function() {
    visitOptions = {
      onBeforeLoad: win => {
        let fetch = fetchMock.sandbox()
        fetch.get('https://api.data.world/v0/user', this.profile)
        fetch.post(
          'https://api.data.world/v0/sql/data-society/iris-species?includeTableSchema=true',
          this.queryResponse
        )
        fetch.post(
          'https://api.data.world/v0/insights/data-society/iris-species',
          {
            message: 'Insight created successfully.',
            saving: false,
            uri:
              'https://data.world/data-society/iris-species/insights/abcd-1234'
          }
        )
        fetch.get(
          'https://api.data.world/v0/datasets/data-society/iris-species',
          {
            accessLevel: 'WRITE',
            isProject: true
          }
        )
        fetch.put(
          'begin:https://api.data.world/v0/uploads/data-society/iris-species/files/test-title',
          { message: 'File uploaded.' }
        )
        fetch.get('glob:*/static/media/licenses*', 'cypress license text')
        cy.stub(win, 'fetch', fetch).as('fetch')

        win.localStorage.setItem('token', 'foo')
      }
    }

    cy.once('uncaught:exception', () => false)

    cy.fixture('profile').as('profile')
    cy.fixture('queryResponse').as('queryResponse')

    cy.visit('/', visitOptions)

    // load example data
    cy.get('[data-test=example-link]').click()

    // set some chart options
    cy.get(
      '[data-test=encoding-container-0] > [data-test=encoding-bar]'
    ).click()

    cy.get('#react-select-4-option-1').click()

    cy.get('[data-test=encoding-container-1]> [data-test=encoding-bar]').click()

    cy.get('#react-select-6-option-2').click()

    cy.get('[data-test=chart-type-selector]').click()

    cy.get('#react-select-2-option-3').click()
  })

  it('Should toggle advanced options and ensure chart and title exist', function() {
    // toggle some advanced options
    cy.get('[data-test=encoding-container-0]').within(() => {
      cy.get('[data-test=toggle-adv-config]').click()
      cy.get('[data-test=bin-yes]').click()
      cy.get('[data-test=toggle-adv-config]').click()
    })

    cy.get('[data-test=encoding-container-1]').within(() => {
      cy.get('[data-test=toggle-adv-config]').click()
      cy.get('[data-test=zero-no]').click()
      cy.get('[data-test=toggle-adv-config]').click()
    })

    // add and remove encoding
    cy.get('[data-test=add-encoding]').click()

    cy.get(
      '[data-test=encoding-container-3]> [data-test=encoding-bar] > [data-test=toggle-adv-config]'
    ).click()

    cy.get('[data-test=rm-encoding]').click()
    cy.get(
      '[data-test=encoding-container-1] > [data-test=encoding-bar] > [data-test=toggle-adv-config]'
    )
    // check that titles work
    cy.get('[data-test=chart-title]').type('test title')
    cy.get('svg .role-title').contains('test title')

    // check that chart exists
    cy.get('[data-test=vega-embed]')

    cy.get('[data-test=license-open]').click()
    cy.get('[data-test=license-text]').contains('cypress license text')
  })

  it('Should be able to edit chart using editor', function() {
    cy.get('#configure-tabs-tab-editor').click()

    cy.get('.inputarea')
      .type('{rightarrow}')
      .type('"title": "test 123",')

    cy.get('#configure-tabs-tab-builder').click()

    cy.get('svg .role-title').contains('test 123')
  })

  it('Should be able to download a chart', function() {
    cy.get('#dropdown-download').click()

    // download as a vega-lite file format
    cy.get('[data-test=download-vega-lite]').trigger('mousedown')
    cy.get('[data-test=download-vega-lite]').should($m => {
      expect($m).to.have.length(1)
      expect($m.attr('href')).to.match(/^blob/)
    })

    // download as a vega file format
    cy.get('[data-test=download-vega]').trigger('mousedown')
    cy.get('[data-test=download-vega]').should($m => {
      expect($m).to.have.length(1)
      expect($m.attr('href')).to.match(/^blob/)
    })

    // download as a png file format
    cy.get('[data-test=download-png]').trigger('mousedown')
    cy.get('[data-test=download-png]').should($m => {
      expect($m).to.have.length(1)
      expect($m.attr('href')).to.match(/^data:image\/png/)
    })

    // download as a svg file format
    cy.get('[data-test=download-svg]').trigger('mousedown')
    cy.get('[data-test=download-svg]').should($m => {
      expect($m).to.have.length(1)
      expect($m.attr('href')).to.match(/^blob/)
    })

    // download as a HTML file format
    cy.get('[data-test=download-html]').trigger('mousedown')
    cy.get('[data-test=download-html]').should($m => {
      expect($m).to.have.length(1)
      expect($m.attr('href')).to.match(/^blob/)
    })
  })

  it('Should be able to be shared', function() {
    cy.get('[data-test=chart-title]').type('test title')

    // share as an insight
    cy.get('#dropdown-save-ddw').click()
    cy.get('[data-test=share-insight]').click()
    cy.get('.modal')

    cy.get('.btn-primary').click()

    cy.get('.alert-link').should(
      'have.attr',
      'href',
      'https://data.world/data-society/iris-species/insights/abcd-1234'
    )

    cy.get('.modal-footer > .btn').click()

    // share as a file
    cy.get('#dropdown-save-ddw').click()
    cy.get('[data-test=share-file]').click()
    cy.get('.modal')

    cy.get('.btn-primary').click()

    cy.get('.alert-link').should(
      'have.attr',
      'href',
      'https://data.world/data-society/iris-species/workspace/file?filename=test-title.vl.json'
    )

    cy.get('.modal-footer > .btn').click()

    // share as a markdown comment
    cy.get('#dropdown-save-ddw').click()
    cy.get('[data-test=share-markdown]').click()
    cy.get('.modal')

    cy.get('[data-test=share-markdown-embed] input').then($i => {
      expect($i.val()).to.have.string('test title')
      expect($i.val()).to.have.string('```')
    })

    cy.get('.modal-footer > .btn').click()

    // share as a URL
    cy.get('#dropdown-save-ddw').click()
    cy.get('[data-test=share-url]').click()

    cy.get('[data-test=share-url-text] input').then($i => {
      cy.visit($i.val(), visitOptions)
    })
  })
})

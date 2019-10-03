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
          'https://api.data.world/v0/uploads/data-society/iris-species/files/test-title.vl.json',
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
    cy.get('[data-dw=example-link]').click()

    // set some chart options
    cy.get(
      '[data-dw=encoding-container-0] > [data-dw=encoding-bar] > .css-1y3q4ke > .react-select__control > .react-select__indicators > .react-select__indicator'
    ).click()

    cy.get('#react-select-4-option-1').click()

    cy.get(
      '[data-dw=encoding-container-1]> [data-dw=encoding-bar] > .css-1y3q4ke > .react-select__control > .react-select__indicators > .react-select__indicator'
    ).click()

    cy.get('#react-select-6-option-2').click()

    cy.get('[data-dw=chart-type-selector]').click()

    cy.get('#react-select-2-option-3').click()
  })

  it('Should toggle advanced options and ensure chart and title exist', function() {
    // toggle some advanced options
    cy.get('[data-dw=encoding-container-0]').within(() => {
      cy.get('[data-dw=toggle-adv-config]').click()
      cy.get('[data-dw=bin-yes]').click()
      cy.get('[data-dw=toggle-adv-config]').click()
    })

    cy.get('[data-dw=encoding-container-1]').within(() => {
      cy.get('[data-dw=toggle-adv-config]').click()
      cy.get('[data-dw=zero-no]').click()
      cy.get('[data-dw=toggle-adv-config]').click()
    })

    // add and remove encoding
    cy.get('[data-dw=add-encoding]').click()

    cy.get(
      '[data-dw=encoding-container-3]> [data-dw=encoding-bar] > [data-dw=toggle-adv-config]'
    ).click()

    cy.get('[data-dw=rm-encoding]').click()
    cy.get(
      '[data-dw=encoding-container-1] > [data-dw=encoding-bar] > [data-dw=toggle-adv-config]'
    )
    // check that titles work
    cy.get('[data-dw=chart-title]').type('test title')
    cy.get('svg .role-title').contains('test title')

    // check that chart exists
    cy.get('[data-dw=vega-embed]')

    cy.get('[data-dw=license-open]').click()
    cy.get('[data-dw=license-text]').contains('cypress license text')
  })

  it('Should be able to edit chart using editor', function() {
    cy.get('#configure-tabs-tab-editor').click()

    cy.get('.inputarea')
      .type('{ctrl}f')
      .focused()
      .type('"title": "test 123",')

    cy.get('#configure-tabs-tab-builder').click()

    cy.get('svg .role-title').contains('test 123')
  })

  it('Should be able to download a chart', function() {
    cy.get('#dropdown-download').click()

    // download as a vega-lite file format
    cy.get('[data-dw=download-vega-lite]').trigger('mousedown')
    cy.get('[data-dw=download-vega-lite]').should($m => {
      expect($m).to.have.length(1)
      expect($m.attr('href')).to.match(/^blob/)
    })

    // download as a vega file format
    cy.get('[data-dw=download-vega]').trigger('mousedown')
    cy.get('[data-dw=download-vega]').should($m => {
      expect($m).to.have.length(1)
      expect($m.attr('href')).to.match(/^blob/)
    })

    // download as a png file format
    cy.get('[data-dw=download-png]').trigger('mousedown')
    cy.get('[data-dw=download-png]').should($m => {
      expect($m).to.have.length(1)
      expect($m.attr('href')).to.match(/^data:image\/png/)
    })

    // download as a svg file format
    cy.get('[data-dw=download-svg]').trigger('mousedown')
    cy.get('[data-dw=download-svg]').should($m => {
      expect($m).to.have.length(1)
      expect($m.attr('href')).to.match(/^blob/)
    })

    // download as a HTML file format
    cy.get('[data-dw=download-html]').trigger('mousedown')
    cy.get('[data-dw=download-html]').should($m => {
      expect($m).to.have.length(1)
      expect($m.attr('href')).to.match(/^blob/)
    })
  })

  it('Should be able to be shared', function() {
    cy.get('[data-dw=chart-title]').type('test title')

    // share as an insight
    cy.get('#dropdown-save-ddw').click()
    cy.get('[data-dw=share-insight]').click()
    cy.get('.modal')

    cy.get('[data-dw=insight-save-vega-lite-checkbox]').uncheck()
    cy.get('.btn-primary').click()

    cy.get('.alert-link').should(
      'have.attr',
      'href',
      'https://data.world/data-society/iris-species/insights/abcd-1234'
    )

    cy.get('.modal-footer > .btn').click()

    // share as a file
    cy.get('#dropdown-save-ddw').click()
    cy.get('[data-dw=share-file]').click()
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
    cy.get('[data-dw=share-markdown]').click()
    cy.get('.modal')

    cy.get('[data-dw=share-markdown-embed] input').then($i => {
      expect($i.val()).to.have.string('test title')
      expect($i.val()).to.have.string('```')
    })

    cy.get('.modal-footer > .btn').click()

    // share as a URL
    cy.get('#dropdown-save-ddw').click()
    cy.get('[data-dw=share-url]').click()

    cy.get('[data-dw=share-url-text] input').then($i => {
      cy.visit($i.val(), visitOptions)
    })
  })
})

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
  })

  it('Should perform basic functionalities', function() {
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

    // check that titles work
    cy.get('[data-test=chart-title]').type('test title')
    cy.get('svg .role-title').contains('test title')

    // check that chart exists
    cy.get('[data-test=vega-embed]')
    cy.screenshot('page with viz')

    cy.get('[data-test=license-open]').click()
    cy.get('[data-test=license-text]').contains('cypress license text')
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
    cy.get('.open > .dropdown-menu > :nth-child(3) > a').trigger('mousedown')
    cy.get('.open > .dropdown-menu > :nth-child(3) > a').should($m => {
      expect($m).to.have.length(1)
      expect($m.attr('href')).to.match(/^blob/)
    })

    // download as a vega file format
    cy.get('.open > .dropdown-menu > :nth-child(2) > a').trigger('mousedown')
    cy.get('.open > .dropdown-menu > :nth-child(2) > a').should($m => {
      expect($m).to.have.length(1)
      expect($m.attr('href')).to.match(/^blob/)
    })

    // download as a png file format
    cy.get('.open > .dropdown-menu > :nth-child(5) > a').trigger('mousedown')
    cy.get('.open > .dropdown-menu > :nth-child(5) > a').should($m => {
      expect($m).to.have.length(1)
      expect($m.attr('href')).to.match(/^data:image\/png/)
    })

    // download as a svg file format
    cy.get('.open > .dropdown-menu > :nth-child(6) > a').trigger('mousedown')
    cy.get('.open > .dropdown-menu > :nth-child(6) > a').should($m => {
      expect($m).to.have.length(1)
      expect($m.attr('href')).to.match(/^blob/)
    })

    // download as a HTML file format
    cy.get('.open > .dropdown-menu > :nth-child(8) > a').trigger('mousedown')
    cy.get('.open > .dropdown-menu > :nth-child(8) > a').should($m => {
      expect($m).to.have.length(1)
      expect($m.attr('href')).to.match(/^blob/)
    })
  })

  it('Should be able to be shared', function() {
    cy.get('[data-test=chart-title]').type('test title')

    // share as an insight
    cy.get('#dropdown-save-ddw').click()
    cy.get('.open > .dropdown-menu > :nth-child(2) > a').click()
    cy.get('.modal')

    cy.get('[type="checkbox"]').uncheck()
    cy.get('.btn-primary').click()

    cy.get('.alert-link').should(
      'have.attr',
      'href',
      'https://data.world/data-society/iris-species/insights/abcd-1234'
    )

    cy.get('.modal-footer > .btn').click()

    // share as a file
    cy.get('#dropdown-save-ddw').click()
    cy.get('.open > .dropdown-menu > :nth-child(3) > a').click()
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
    cy.get('.open > .dropdown-menu > :nth-child(4) > a').click()
    cy.get('.modal')

    cy.get('[data-test=share-markdown-embed] input').then($i => {
      expect($i.val()).to.have.string('test title')
      expect($i.val()).to.have.string('```')
    })

    cy.get('.modal-footer > .btn').click()

    // share as a URL
    cy.get('#dropdown-save-ddw').click()
    cy.get('[data-test=share-btn]').click()

    cy.get('[data-test=share-url-text] input').then($i => {
      cy.visit($i.val(), visitOptions)
    })

    cy.get('[data-test=vega-embed]')
    cy.screenshot('page with viz after reload')
  })
})

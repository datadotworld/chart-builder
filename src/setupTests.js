global.snap = (element: mixed) => {
  const renderer = require('react-test-renderer')

  const tree = renderer.create(element).toJSON()
  expect(tree).toMatchSnapshot()
}

jest.mock('react-select', () => 'react-select')

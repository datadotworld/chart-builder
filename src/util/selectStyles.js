// @flow
type StyleType = { [string]: (base: Object, state?: Object) => Object }
const sharedObj: StyleType = {
  option: () => ({
    padding: '4px 12px'
  }),
  control: () => ({
    minHeight: 28,
    height: 28,
    fontSize: 13,
    backgroundColor: '#fff',
    margin: '.25rem 0'
  }),
  dropdownIndicator: () => ({
    padding: 0
  }),
  clearIndicator: () => ({
    padding: 0
  }),
  singleValue: () => ({
    paddingRight: 4
  }),
  valueContainer: () => ({
    overflowX: 'hidden',
    padding: '0 8px'
  }),
  menu: () => ({
    marginTop: 0
  }),
  menuPortal: () => ({
    zIndex: 9999
  })
}

const sharedKeys = Object.keys(sharedObj)

const decorate = (target: StyleType) => {
  const combinedKeys = [...new Set([...Object.keys(target), ...sharedKeys])]
  const obj = {}
  combinedKeys.forEach(k => {
    const s = sharedObj[k]
    const t = target[k]
    obj[k] = (base, state) => ({
      ...base,
      ...(s ? s(base, state) : {}),
      ...(t ? t(base, state) : {})
    })
  })
  return obj
}

export default decorate

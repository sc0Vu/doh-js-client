const DoH = require('../src/doh')

describe('Test DNS-over-HTTPS client', () => {
  let doh = new DoH('google')
  let results = []
  let domainName = 'www.google.com'
  let domainType = 'A'
  test('initialize doh', () => {
    expect(doh.provider).toBe('google')
    doh.setProvider('cleanbrowsing')
    expect(doh.provider).toBe('cleanbrowsing')
  })
  test('fetch from google', async (done) => {
    doh.setProvider('google')
    expect(doh.provider).toBe('google')
    try {
      let result = await doh.resolve(domainName, domainType)
      results.push(result)
      done()
    } catch (err) {
      done.fail(err)
    }
  })
  test('fetch from cleanbrowsing', async (done) => {
    doh.setProvider('cleanbrowsing')
    expect(doh.provider).toBe('cleanbrowsing')
    try {
      let result = await doh.resolve(domainName, domainType)
      results.push(result)
      done()
    } catch (err) {
      done.fail(err)
    }
  })
  test('test the results', () => {
    let result0 = results[0]
    let result1 = results[1]
    expect(result0.length).toEqual(result1.length)
    for (let i=0; i<result0.length; i++) {
      expect(result0[i].name).toEqual(result1[i].name)
      expect(result0[i].type).toEqual(result1[i].type)
      expect(result0[i].class).toEqual(result1[i].class)
    }
  })
})

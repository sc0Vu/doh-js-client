const DoH = require('../src/doh')

describe('Test DNS-over-HTTPS client', () => {
  let doh = new DoH('google')
  let tests = [
    {
      domainName: 'www.google.com',
      domainType: 'A'
    }, {
      domainName: 'www.google.com',
      domainType: 'AAAA'
    }, {
      domainName: 'www.google.com',
      domainType: 'CNAME'
    }, {
      domainName: 'www.google.com',
      domainType: 'DS'
    }, {
      domainName: 'www.google.com',
      domainType: 'DNSKEY'
    }, {
      domainName: 'gmail.com',
      domainType: 'MX'
    }, {
      domainName: 'www.google.com',
      domainType: 'NS'
    }, {
      domainName: 'www.google.com',
      domainType: 'NSEC'
    }, {
      domainName: 'www.google.com',
      domainType: 'NSEC3'
    }, {
      domainName: 'www.google.com',
      domainType: 'RRSIG'
    }, {
      domainName: 'www.google.com',
      domainType: 'SOA'
    }, {
      domainName: 'www.google.com',
      domainType: 'TXT'
    }
    // Seems cleanbrowsing doesn't support caa query
    // {
    //   domainName: 'example.com',
    //   domainType: 'CAA'
    // }
  ]
  test('initialize doh', () => {
    expect(doh.provider).toBe('google')
    doh.setProvider('cleanbrowsing')
    expect(doh.provider).toBe('cleanbrowsing')
  })
  test('fetch dns over https through google, cloudflare and cleanbrowsing', async (done) => {
    let totalTests = tests.length
    let isOk = true
    for (let i=0; i<totalTests; i++) {
      const dnsTest = tests[i]
      doh.setProvider('google')
      expect(doh.provider).toBe('google')
      try {
        let gResult = await doh.resolve(dnsTest.domainName, dnsTest.domainType)
        doh.setProvider('cloudflare')
        expect(doh.provider).toBe('cloudflare')
        let cloudResult = await doh.resolve(dnsTest.domainName, dnsTest.domainType)
        doh.setProvider('cleanbrowsing')
        expect(doh.provider).toBe('cleanbrowsing')
        let cleanResult = await doh.resolve(dnsTest.domainName, dnsTest.domainType)
        expect(gResult.length).toEqual(cloudResult.length)
        expect(gResult.length).toEqual(cleanResult.length)
        for (let i=0; i<gResult.length; i++) {
          expect(gResult[i].name).toEqual(cloudResult[i].name)
          expect(gResult[i].type).toEqual(cloudResult[i].type)
          expect(gResult[i].class).toEqual(cloudResult[i].class)
          expect(gResult[i].name).toEqual(cleanResult[i].name)
          expect(gResult[i].type).toEqual(cleanResult[i].type)
          expect(gResult[i].class).toEqual(cleanResult[i].class)
        }
      } catch (err) {
        isOk = false
        done.fail(err)
        break
      }
    }
    if (isOk === true) {
      done()
    }
  }, 100000)
})

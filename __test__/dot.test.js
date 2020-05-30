const DoT = require('../src/index').DoT

describe('Test DNS-over-HTTPS client', () => {
  let dot = new DoT('google', './__test__/key.pem', './__test__/certificate.pem')
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
  test('initialize dot', () => {
    expect(dot.provider).toBe('google')
    dot.setProvider('cleanbrowsing')
    expect(dot.provider).toBe('cleanbrowsing')
  })
  test('fetch dns over https through google', async (done) => {
    let totalTests = tests.length
    let isOk = true
    for (let i=0; i<totalTests; i++) {
      const dnsTest = tests[i]
      dot.setProvider('google')
      expect(dot.provider).toBe('google')
      try {
        let gResult = await dot.resolve(dnsTest.domainName, dnsTest.domainType)
        dot.setProvider('cloudflare')
        expect(dot.provider).toBe('cloudflare')
        let cloudResult = await dot.resolve(dnsTest.domainName, dnsTest.domainType)
        dot.setProvider('cleanbrowsing')
        expect(dot.provider).toBe('cleanbrowsing')
        let cleanResult = await dot.resolve(dnsTest.domainName, dnsTest.domainType)
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

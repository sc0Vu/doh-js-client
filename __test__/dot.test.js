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

  test('fetch dns over tls through google, cloudflare, cleanbrowsing and quad9', async (done) => {
    let totalTests = tests.length
    let isOk = true
    for (let i=0; i<totalTests; i++) {
      const dnsTest = tests[i]
      dot.setProvider('google')
      expect(dot.provider).toBe('google')
      try {
        await dot.resolve(dnsTest.domainName, dnsTest.domainType)
        dot.setProvider('cloudflare')
        expect(dot.provider).toBe('cloudflare')
        await dot.resolve(dnsTest.domainName, dnsTest.domainType)
        dot.setProvider('cleanbrowsing')
        expect(dot.provider).toBe('cleanbrowsing')
        await dot.resolve(dnsTest.domainName, dnsTest.domainType)
        dot.setProvider('quad9')
        expect(dot.provider).toBe('quad9')
        await dot.resolve(dnsTest.domainName, dnsTest.domainType)
      } catch (err) {
        isOk = false
        done.fail(err)
        break
      }
    }
    if (isOk === true) {
      done()
    }
  }, 120000)
})

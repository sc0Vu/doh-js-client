const DoH = require('../src/index').DoH

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

  test('fetch dns over https through google, cloudflare ,cleanbrowsing and quad9', async (done) => {
    let totalTests = tests.length
    let isOk = true
    for (let i=0; i<totalTests; i++) {
      const dnsTest = tests[i]
      doh.setProvider('google')
      expect(doh.provider).toBe('google')
      try {
        await doh.resolve(dnsTest.domainName, dnsTest.domainType)
        doh.setProvider('cloudflare')
        expect(doh.provider).toBe('cloudflare')
        await doh.resolve(dnsTest.domainName, dnsTest.domainType)
        doh.setProvider('cleanbrowsing')
        expect(doh.provider).toBe('cleanbrowsing')
        await doh.resolve(dnsTest.domainName, dnsTest.domainType)
        doh.setProvider('quad9')
        expect(doh.provider).toBe('quad9')
        await doh.resolve(dnsTest.domainName, dnsTest.domainType)
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

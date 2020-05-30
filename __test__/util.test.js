const Util = require('../src/util')

describe('Test util', () => {
  let tests = [
    {
      domainType: 'A',
      value: 1
    }, {
      domainType: 'AAAA',
      value: 28
    }, {
      domainType: 'CNAME',
      value: 5
    }, {
      domainType: 'DS',
      value: 43
    }, {
      domainType: 'DNSKEY',
      value: 48
    }, {
      domainType: 'MX',
      value: 15
    }, {
      domainType: 'NS',
      value: 2
    }, {
      domainType: 'NSEC',
      value: 47
    }, {
      domainType: 'NSEC3',
      value: 50
    }, {
      domainType: 'RRSIG',
      value: 46
    }, {
      domainType: 'SOA',
      value: 6
    }, {
      domainType: 'TXT',
      value: 16
    }, {
      domainType: 'CAA',
      value: 257
    }
  ]
  test('test domain type', () => {
    let totalTests = tests.length
    for (let i=0; i<totalTests; i++) {
      let testDomainType = tests[i]
      expect(Util.getDomainType(testDomainType.domainType)).toEqual(testDomainType.value)
    }
  })
})

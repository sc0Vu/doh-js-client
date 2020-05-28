declare const Buffer
declare const require
declare const module

const XHR2 = require('xhr2')
const Packet = require('native-dns-packet')

function DoH (provider: string) {
  Object.defineProperties(this, {
    providers: {
      value: {
        google: 'https://dns.google/dns-query',
        cloudflare: 'https://cloudflare-dns.com/dns-query',
        cleanbrowsing: 'https://doh.cleanbrowsing.org/doh/family-filter'
      },
      writable: false
    }
  })
  if (typeof this.providers[provider] === 'undefined') {
    throw new Error('We only support these provider: google, cleanbrowsing, cloudflare')
  }
  this.provider = provider
  this.uri = this.providers[this.provider]
}

DoH.prototype.setProvider = function (provider :string) {
  if (this.provider === provider) {
    return
  }
  if (typeof this.providers[provider] === 'undefined') {
    throw new Error('We only support these provider: google, cleanbrowsing, cloudflare')
  }
  this.provider = provider
  this.uri = this.providers[this.provider]
}

// Seems cleanbrowsing doesn't support caa query
DoH.prototype.getDomainType = function (domainType: string) {
  let type: number = 0
  switch (domainType.toUpperCase()) {
    case 'A':
      type = 1
      break
    case 'AAAA':
      type = 28
      break
    case 'CAA':
      type = 257
      break
    case 'CNAME':
      type = 5
      break
    case 'DS':
      type = 43
      break
    case 'DNSKEY':
      type = 48
      break
    case 'MX':
      type = 15
      break
    case 'NS':
      type = 2
      break
    case 'NSEC':
      type = 47
      break
    case 'NSEC3':
      type = 50
      break
    case 'RRSIG':
      type = 46
      break
    case 'SOA':
      type = 6
      break
    case 'TXT':
      type = 16
      break
    default:
      // A
      type = 1
      break
  }
  return type
}

DoH.prototype.newBuffer = function (length: number) {
  let buf
  if (Buffer.alloc) {
    buf = Buffer.alloc(length)
  } else {
    buf = new Buffer(length)
  }
  return buf
}

DoH.prototype.resolve = function (domainName: string, domainType: string) {
  let type = this.getDomainType(domainType)
  let dnsPacket = new Packet()
  let dnsBuf = this.newBuffer(128)
  dnsPacket.question.push({
    name: domainName,
    type: type,
    class: 1
  })
  Packet.write(dnsBuf, dnsPacket)

  let provider = this.provider
  let query = `${this.uri}?dns=${dnsBuf.toString('base64').replace(/=+/, '')}`
  return new Promise(function (resolve, reject) {
    let xhr = new XHR2()
    xhr.open('GET', query, true)
    xhr.setRequestHeader('Accept', 'application/dns-message')
    xhr.setRequestHeader('Content-type', 'application/dns-message')
    xhr.responseType = 'arraybuffer'
    xhr.onload = function () {
      if (xhr.status === 200 && this.response) {
        try {
          let dnsResult = Buffer.from(this.response)
          let result = Packet.parse(dnsResult)
          resolve(result.answer)
        } catch (err) {
          reject(err)
        }
      } else {
        reject(new Error(`Cannot found the domain, provider: ${provider}, xhr status: ${xhr.status}.`))
      }
    }
    xhr.onerror = function (err) {
      reject(err)
    }
    xhr.send(null)
  })
}

module.exports = DoH
declare const Buffer
declare const require
declare const module

const XHR2 = require('xhr2')
const Packet = require('native-dns-packet')

// TODO:
// fix: cannot use native dns message in cloudflare
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

// TODO: support other domain type, eg MX
DoH.prototype.getDomainType = function (domainType: string) {
  let type: number = 0
  switch (domainType) {
    case 'AAAA':
      type = 28
      break
    case 'CNAME':
      type = 5
      break
    case 'NS':
      type = 2
      break
    default:
      // A
      type = 1
      break
  }
  return type
}

DoH.prototype.resolve = function (domainName: string, domainType: string) {
  let type = this.getDomainType(domainType)
  let dnsPacket = new Packet()
  let dnsBuf = new Buffer(128)
  dnsPacket.question.push({
    name: domainName,
    type: type,
    class: 1
  })
  Packet.write(dnsBuf, dnsPacket)

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
        reject(new Error(`Cannot found the domain, xhr status: ${xhr.status}.`))
      }
    }
    xhr.onerror = function (err) {
      reject(err)
    }
    xhr.send(null)
  })
}

module.exports = DoH
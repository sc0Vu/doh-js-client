import * as XHR2 from 'xhr2'
import * as Packet from 'native-dns-packet'
import * as Util from './util'

function DoH (provider: string) {
  Object.defineProperties(this, {
    providers: {
      value: {
        google: 'https://dns.google/dns-query',
        cloudflare: 'https://cloudflare-dns.com/dns-query',
        cleanbrowsing: 'https://doh.cleanbrowsing.org/doh/family-filter',
        quad9: 'https://dns9.quad9.net/dns-query'
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

DoH.prototype.getProviders = function () {
  return Object.keys(this.providers)
}

DoH.prototype.setProvider = function (provider :string) {
  if (this.provider === provider) {
    return
  }
  if (typeof this.providers[provider] === 'undefined') {
    throw new Error('We only support these provider: ' + this.getProviders().join(', '))
  }
  this.provider = provider
  this.uri = this.providers[this.provider]
}

DoH.prototype.resolve = function (domainName: string, domainType: string) {
  let type = Util.getDomainType(domainType)
  let dnsPacket = new Packet()
  let dnsBuf = Util.newBuffer(128)
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
        reject(new Error(`Cannot find the domain, provider: ${provider}, xhr status: ${xhr.status}.`))
      }
    }
    xhr.onerror = function (err) {
      reject(err)
    }
    xhr.send(null)
  })
}

module.exports = DoH
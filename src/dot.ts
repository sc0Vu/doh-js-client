import * as tls from 'tls'
import * as fs from 'fs'
import * as Packet from 'native-dns-packet'
import * as Util from './util'

function DoT (provider: string, keyPath: string, certPath: string) {
  Object.defineProperties(this, {
    providers: {
      value: {
        google: 'dns.google',
        cloudflare: '1.1.1.1',
        cleanbrowsing: '185.228.169.154',
        quad9: 'dns.quad9.net'
      },
      writable: false
    },
    key: {
      writable: true
    },
    cert: {
      writable: true
    },
  })
  if (typeof this.providers[provider] === 'undefined') {
    throw new Error('We only support these provider: google, cleanbrowsing, cloudflare')
  }
  const key = fs.readFileSync(keyPath)
  const cert = fs.readFileSync(certPath)
  this.provider = provider
  this.uri = this.providers[this.provider]
  this.key = key
  this.cert = cert
}

DoT.prototype.getProviders = function () {
  return Object.keys(this.providers)
}

DoT.prototype.setProvider = function (provider :string) {
  if (this.provider === provider) {
    return
  }
  if (typeof this.providers[provider] === 'undefined') {
    throw new Error('We only support these provider: ' + this.getProviders().join(', '))
  }
  this.provider = provider
  this.uri = this.providers[this.provider]
}

// TODO: refactor socket and provider, multiple query and keepalive connection
DoT.prototype.resolve = function (domainName: string, domainType: string) {
  let type = Util.getDomainType(domainType)
  let dnsPacket = new Packet()
  let dnsBuf = Util.newBuffer(128)
  let msgBuf = Util.newBuffer(130)
  dnsPacket.question.push({
    name: domainName,
    type: type,
    class: 1
  })
  Packet.write(dnsBuf, dnsPacket)
  msgBuf[1] = 128
  // copy dns buffer to message buffer
  dnsBuf.copy(msgBuf, 2, 0)

  const uri = this.uri
  const key = this.key
  const cert = this.cert
  return new Promise(function (resolve, reject) {
    const options = {
      key: key,
      cert: cert,
      // ca: [],
      checkServerIdentity: () => { 
        return null
      },
    }
    
    const socket = tls.connect(853, uri, options, () => {
      if (socket.authorized) {
        socket.write(msgBuf)
      } else {
        reject(new Error('socket authorized'))
      }
    })
    socket.on('data', (data) => {
      let sign = data[0] & (1 << 7)
      let totalLength = (data & 0xFF) << 8 | data[1] & 0xFF
      if (sign) {
        totalLength = 0xFFFF0000 | totalLength
      }
      let result = Packet.parse(data.slice(2))
      resolve(result.answer)
    })
    socket.on('error', (err) => {
      reject(err)
    })
    socket.on('end', () => {
      // finish query
    })
  })
}

module.exports = DoT
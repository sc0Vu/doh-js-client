# doh-js-client
[![Build Status](https://travis-ci.org/sc0Vu/doh-js-client.svg?branch=master)](https://travis-ci.org/sc0Vu/doh-js-client)

DNS-over-HTTPS/DNS-over-TLS client for nodejs, secure your nodejs dns query with modern tls.

# Install
```BASH
$ npm install doh-js-client
```

# Usage

## DNS over HTTPS (:443)

1. Initialize the instance with given provider (google, cloudflare, cleanbrowsing)
```JS
const DoH = require('doh-js-client').DoH

let dns = new DoH('google')
```

2. Resolve dns name
```JS
dns.resolve('example.com', 'A')
  .then(function (record) {
    // do something
  })
  .catch(function (err) {
    // something wrong happened
  })
```

## DNS over TLS (:583)

1. Initialize the instance with given provider (google, cloudflare, cleanbrowsing)
```JS
const DoT = require('doh-js-client').DoT

let dns = new DoT('google', privateKeyFilePath, certificateFilePath)
```

2. Resolve dns name
```JS
dns.resolve('example.com', 'A')
  .then(function (record) {
    // do something
  })
  .catch(function (err) {
    // something wrong happened
  })
```

# Known issue and supported dns type

1. Cleanbrowsing doesn't support caa query (return 400).

2. Supported dns type:
  * A
  * AAAA
  * CAA
  * CNAME
  * DS
  * DNSKEY
  * MX
  * NS
  * NSEC
  * NSEC3
  * RRSIG
  * SOA
  * TXT

# License

MIT
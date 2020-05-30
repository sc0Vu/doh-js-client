export function getDomainType (domainType: string) {
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

export function newBuffer (length: number) {
  let buf
  if (Buffer.alloc) {
    buf = Buffer.alloc(length)
  } else {
    buf = new Buffer(length)
  }
  return buf
}

import url from 'url';

export default function rootDomain(href) {
  if (!href) { return; }

  const parsedHref = url.parse(href);
  if (!parsedHref.host || parsedHref.protocol.indexOf('http') !== 0) { return; }

  const domainParts = parsedHref.host.split('.');
  if (domainParts.length >= 2) {
    const domainEnd = domainParts.length - 1;
    return `${domainParts[domainEnd - 1]}.${domainParts[domainEnd]}`;
  }
}

# Vercel DDNS Client

Vercel Dynamic DNS Update Client, will continually check for IP address changes and automatically updates your DNS records on vercel whenever it changes.

## Environment Variables

To run this project, you will need to add the following environment variables

`VERCEL_API_KEY`

You can generate a vercel api key (token) here: https://vercel.com/account/tokens

`DOMAIN`

The root domain that you have on vercel e.g. "example.com"

`SUBDOMAINS`

A string with comma separated values of the records you want to update.
Examples:

- "foo, bar, \*.bar"
- "\*"

The above multiple subdomain example would match or create the following records:

- foo.example.com
- bar.example.com
- \*.bar.example.com -> wildcard to forward any subdomain of bar.example.com

To update the root domain add a leading comma to the subdomain comma separated string.
Example:

- ", foo, bar" -> will update the root and subdomains foo and bar
- "foo, bar" -> will not update the root only the specified subdomains

## Installation

Install with docker

```bash
  docker run -d -e VERCEL_API_KEY="XXXXXXXXXX" -e DOMAIN="example.com" -e SUBDOMAINS="foo, bar, *.bar" jacobgad/vercel-ddns
```

## Appendix

Docker hub: https://hub.docker.com/r/jacobgad/vercel-ddns

## Authors

- [@jacobgad](https://www.github.com/jacobgad)

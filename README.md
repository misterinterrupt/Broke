broke
=====

Find broken links for a domain

## Install

```sh-session
$ git clone [the link you copy from this repo]
$ cd broke
$ npm install
```

## Use
<!-- usage -->
`./bin/run [proto://yourdomain.com]`

### Flags:

  - link depth: -d [number]
  - verbose: -v
  
```sh-session
$ ./bin/run https://google.com -d2 -v
Broke is checking google.com with a link depth of 2... 

2 broken out of 15 found
 
https://google.com/preferences%3Fhl=en was unreachable
  secure: true 
  malformed: false 
  reason: Request failed with status code 404 
  linked to from https://google.com/ 
  link depth: 1 
  status: 404 
  status text: Not Found
 
 
https://google.com/advanced_search%3Fhl=en-GB&authuser=0 was unreachable
  secure: true 
  malformed: false 
  reason: Request failed with status code 404 
  linked to from https://google.com/ 
  link depth: 1 
  status: 404 
  status text: Not Found

```
<!-- usagestop -->
<!-- # Commands -->
<!-- commands -->

<!-- commandsstop -->

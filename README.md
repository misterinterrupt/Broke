broke
=====

find broken links for a domain


<!-- toc -->
<!-- * [Usage](#usage)
* [Commands](#commands) -->
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install
$ ./bin/run https://google.com -d3
Broke is checking google.com with a link depth of 3 ...
 
https://google.com/store/apps was unreachable
  secure: true 
  malformed: false 
  reason: Error: Request failed with status code 404 
  linked to from https://play.google.com/?hl=en&tab=w8 
  link depth: 2 
  status: 0 
  status text: n/a
 
 
https://google.com/apps was unreachable
  secure: true 
  malformed: false 
  reason: Error: Request failed with status code 404 
  linked to from https://play.google.com/?hl=en&tab=w8 
  link depth: 2 
  status: 0 
  status text: n/a
 
 
https://google.com/store/movies/collection/cluster%3Fclp=0g5QChQKDm1vdmVyc19zaGFrZXJzEAcYBDI2CjBuZXdfaG9tZV9kZXZpY2VfZmVhdHVyZWRfbW92ZXJzX3NoYWtlcnNfMC03LTQtNjMQDBgEOAE%3D:S:ANO1ljLg5Y0&gsr=ClPSDlAKFAoObW92ZXJzX3NoYWtlcnMQBxgEMjYKMG5ld19ob21lX2RldmljZV9mZWF0dXJlZF9tb3ZlcnNfc2hha2Vyc18wLTctNC02MxAMGAQ4AQ%3D%3D:S:ANO1ljK7mJM was unreachable
  secure: true 
  malformed: false 
  reason: Error: Request failed with status code 404 
  linked to from https://play.google.com/?hl=en&tab=w8 
  link depth: 2 
  status: 0 
  status text: n/a
 
 
https://google.com/store/movies/details/Flashback%3Fid=pG-pivjVWyk.P was unreachable
  secure: true 
  malformed: false 
  reason: Error: Request failed with status code 404 
  linked to from https://play.google.com/?hl=en&tab=w8 
  link depth: 2 
  status: 0 
  status text: n/a
 
... 
 
https://google.com/preferences%3Fhl=en was unreachable
  secure: true 
  malformed: false 
  reason: Error: Request failed with status code 404 
  linked to from https://google.com/ 
  link depth: 1 
  status: 0 
  status text: n/a
 
 
https://google.com/advanced_search%3Fhl=en-GB&authuser=0 was unreachable
  secure: true 
  malformed: false 
  reason: Error: Request failed with status code 404 
  linked to from https://google.com/ 
  link depth: 1 
  status: 0 
  status text: n/a
 
 
https://marketingplatform.google.com/about/analytics/?utm_source=google-growth&utm_medium=referral-internal&utm_campaign=2018-q4-amer-all-gafree-analytics&utm_content=ads-website-footer was unreachable
  secure: true 
  malformed: false 
  reason: Error: connect ECONNREFUSED 127.0.0.1:443 
  linked to from https://google.com/intl/en/ads/ 
  link depth: 2 
  status: 0 
  status text: n/a
 
138 broken out of 211 found

```
<!-- usagestop -->
<!-- # Commands -->
<!-- commands -->

<!-- commandsstop -->

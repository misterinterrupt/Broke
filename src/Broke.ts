import axios, { AxiosPromise, AxiosResponse } from 'axios'
import * as cheerio from 'cheerio';

export interface LinkResult {
    href: String
    status: number
    statusText: String
    childLinks: LinkResult[]
    malformed: Boolean
    secure: boolean
}

export class Broke {
    
    private root?: URL
    
    async check(root: URL) {
        console.log(`Broke is checking ${root.host}...\n`)
        this.root = root
        this.fetch(root)
                        // .then( (links: LinkResult[]) => {
                            
                        // })
    }
    
    async fetch(url: URL) {
        return axios.get(url.href)
            .then( (res) => {
                var link: LinkResult = {
                    href: url.href,
                    status: res.status,
                    statusText: res.statusText,
                    childLinks: [],
                    malformed: false,
                    secure: url.port == "443"
                }
                var links: LinkResult[] = []
                links.push(link)
                var childLinks: URL[] = this.collectChildUrls(res)
                if (childLinks.length > 0) {
                    console.log("found:")
                    console.log(childLinks.map( link => link.toString() ).join('\n'))
                }                
            })
            .catch( (reason) => {
                console.log(`Couldn't load ${url}`, reason)
                return []
            })
    }
    
    collectChildUrls(pageRes: AxiosResponse): URL[] {
        const $ = cheerio.load(pageRes.data)
        const url = new URL(pageRes.config.url ?? '')
        var matchers: String[] = [
            `a[href^='/']`,
            `a[href*=".${url.host}/"]`,
            `a[href^=${url.origin}]`
        ]
        const linkSelector = matchers.join(", ")
        
        return $(linkSelector).map( (i, el): URL => {
                var childUrlStr = $(el).attr('href') ?? ''
                if (childUrlStr.startsWith('/')) {
                    var childUrl = new URL(this.root!.href)
                    childUrl.pathname = childUrlStr
                    return childUrl
                }
                return new URL(childUrlStr)
            }).get()
    }
}
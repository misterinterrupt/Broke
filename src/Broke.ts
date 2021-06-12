import axios, { AxiosPromise, AxiosResponse } from 'axios'
import * as cheerio from 'cheerio';

export interface LinkResult {
    href: string
    level: number
    linkedFrom: string
    broken: Boolean,
    reason?: any,
    status?: number
    statusText?: string
    links: LinkResult[]
    malformed: Boolean
    secure: boolean
}

export class Broke {

    linkDepth: number = 2
    // used by collectLinks
    private rootUrl: URL
    private visited: URL[] = []
    
    constructor(rootUrl: URL, linkDepth: number = 2) {
        this.rootUrl = rootUrl
        this.linkDepth = linkDepth
    }
    
    async check(): Promise<LinkResult[]> {
        return this.fetch(this.rootUrl, 0, this.rootUrl)
        .then( results => {
            return results.filter( link => {
                return !!link
            })
        })
        .catch( reason => { 
            throw new Error(reason)
        })
    }
    
    // recursive promise tree
    async fetch(currentUrl: URL, currentLevel: number, linkedFrom: URL): Promise<LinkResult[]> {
        
        var visited = this.alreadyVisited(currentUrl)

        if (visited) {
            return []
        } else {
            // console.log(`${currentLevel} currentUrl: ${currentUrl}`)
            this.visit(currentUrl)
        }

        var failReason: String | null = null
        var res = await axios.get(currentUrl.href)
            .catch( reason => {
                // console.log("axios error")
                failReason = reason
                return null
            })
        
        if (res == null) {
            // console.log(`broken link: ${currentUrl.href} was unreachable: ${failReason ?? 'unknown'}`)
            var brokenLink = [this.resultFor(currentUrl, currentLevel, linkedFrom, undefined, `${currentUrl.href} was unreachable: ${failReason ?? 'unknown'}`)]
            return Promise.resolve(brokenLink)
        }
            
        var links = this.collectLinks(res)
        
        var results: LinkResult[] = [this.resultFor(currentUrl, currentLevel, linkedFrom, res)]
        
        var nextLevel = currentLevel + 1
        var childResults: LinkResult[] = []
        if (nextLevel < this.linkDepth) {
            childResults = (await Promise.all(links.map( (linkUrl, i, allChildren) => {
                return this.fetch(linkUrl, currentLevel + 1, currentUrl)
                    .catch( reason => {
                        // FYI this shouldn't happen for happy path cases
                        throw new Error(`a child was unreachable: ${reason}`)
                    })
                })))
                .map( (val, i, all):LinkResult => {
                    return val.pop()!
                })
        } else {
            // console.log(`${currentUrl} has no links`)
        }
        
        return results.concat(childResults)
    }
    
    // the link scraper
    collectLinks(pageRes: AxiosResponse): URL[] {
        
        const $ = cheerio.load(pageRes.data)
        
        const url = new URL(pageRes.config.url ?? '')
        
        var matchers: String[] = [
            `a[href^='/']`,
            `a[href*=".${url.host}/"]`,
            `a[href^=${url.origin}]`
        ]
        
        const sameOriginLinksSelectors = matchers.join(", ")
        
        return $(sameOriginLinksSelectors).map( (i, el): URL => {
                var childUrlStr = $(el).attr('href') ?? ''
                if (childUrlStr.startsWith('/')) {
                    var childUrl = new URL(this.rootUrl.href)
                    childUrl.pathname = childUrlStr
                    return childUrl
                }
                return new URL(childUrlStr)
            }).get()
    }
    
    // metadata structure
    resultFor(url: URL, level: number, linkedFrom: URL, res?: AxiosResponse, reason?: any): LinkResult {
        return {
            href: url.href,
            level: level,
            linkedFrom: linkedFrom.href,
            broken: res == null,
            reason: reason,
            status: res?.status ?? -1,
            statusText: res?.statusText ?? 'N/A',
            links: [],
            malformed: false,
            secure: url.port == "443"
        }
    }

    visit(url: URL) {
        this.visited.push(url)
        // console.log(`${this.visited.length} visiting ${url.href}`)
    }
    
    alreadyVisited(url: URL): Boolean {
        
        var visited = this.visited.find((found, i, allVisits): Boolean => {
            return url.href == found.href
        })
        
        return !!visited
    }
}
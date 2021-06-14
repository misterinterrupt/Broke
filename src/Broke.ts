import axios, { AxiosError, AxiosPromise, AxiosResponse } from 'axios'
import * as cheerio from 'cheerio';

export interface ResponseData {
    href: string
    level: number
    linkedFrom: string
    broken: Boolean,
    reason?: any,
    status: string
    statusText?: string
    links: ResponseData[]
    malformed: Boolean
    secure: boolean
}

export class Broke {

    linkDepthStart: number = 0
    linkDepth: number = 2
    verboseMode: Boolean = false
    debugMode: Boolean = false
    
    // used by collectLinks
    private rootUrl: URL
    private visited: URL[] = []
    
    constructor(rootUrl: URL, linkDepth: number = 2, verbose: Boolean = false, debug: Boolean = false) {
        this.rootUrl = rootUrl
        this.linkDepth = linkDepth
        this.verboseMode = verbose
        this.debugMode = debug
    }
    
    async check(): Promise<ResponseData[]> {
        return this.fetch(this.rootUrl, this.linkDepthStart, this.rootUrl)
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
    async fetch(currentUrl: URL, currentLevel: number, linkedFrom: URL): Promise<ResponseData[]> {
        
        var seen = this.alreadyVisited(currentUrl)

        if (seen) {
            return []
        } else {
            if(this.debugMode) {
                console.log(`${currentLevel} currentUrl: ${currentUrl}`)
            }
            this.visit(currentUrl)
        }

        var error: AxiosError|null = null
        var res: AxiosResponse|null = null
        
        try {
            res = await axios.get(currentUrl.href)
        } catch(resError) {
            if (resError && resError.response) {
                // console.log("Broken Link ")
                error = resError
                res = resError.response
            } else {
                // console.log("Axios error ")
                throw new Error("Failed to fetch link, Axios returned no error response");
            }
        }
        
        if (error) {
            if(this.debugMode) {
                console.log(`broken link: ${currentUrl.href} was unreachable: ${error}`)
            }
            var brokenLink = [this.resultFor(currentUrl, currentLevel, linkedFrom, res!, error)]
            // important that we return the result here or pay extra..
            return brokenLink
        }
            
        var links = this.collectLinks(res!)
        
        var currentResponseData: ResponseData[] = [this.resultFor(currentUrl, currentLevel, linkedFrom, res!)]
        
        var nextLevel = currentLevel + 1
        
        var nextResponseData: ResponseData[] = []
        
        if (nextLevel < this.linkDepth) {
            nextResponseData = await Promise.all(links.map( (linkUrl) => {
                return this.fetch(linkUrl, currentLevel + 1, currentUrl)
                    .catch( reason => {
                        // FYI this shouldn't happen for happy path cases
                        throw new Error(`Unexpected Failure while scraping links: \n${reason}`)
                    })
            }))
            .then( res => {
                return res.flat()
            })
        } else {
            if(this.debugMode) {
                console.log(`${currentUrl} has no links`)
            }
        }
        
        return currentResponseData.concat(nextResponseData)
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
    resultFor(url: URL, level: number, linkedFrom: URL, res: AxiosResponse, err?: AxiosError): ResponseData {
        var linkResult =  {
            href: url.toString(),
            level: level,
            linkedFrom: linkedFrom.toString(),
            broken: !!err,
            reason: err?.message ?? 'n/a',
            status: res.status.toString() ?? 'none',
            statusText: res.statusText ?? 'none',
            links: [],
            malformed: false,
            secure: url.protocol == "https:"
        }
        return linkResult
    }

    visit(url: URL) {
        this.visited.push(url)
        if(this.debugMode) {
            console.log(`${this.visited.length} visited`)
        }
    }
    
    alreadyVisited(url: URL): Boolean {
        
        var seen = this.visited.find((found): Boolean => {
            return url.href == found.href
        })
        
        return !!seen
    }
}
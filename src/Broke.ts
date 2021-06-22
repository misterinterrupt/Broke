/* eslint-disable max-params */
/* eslint-disable no-console */
import axios, {AxiosError, AxiosInstance, AxiosResponse} from 'axios'
import * as cheerio from 'cheerio'

export interface ResponseData {
    href: string;
    level: number;
    linkedFrom: string;
    broken: boolean;
    reason?: any;
    status: string;
    statusText?: string;
    links: ResponseData[];
    malformed: boolean;
    secure: boolean;
}

export class Broke {
    axios: AxiosInstance

    linkDepthStart = 0

    linkDepth = 2

    verboseMode = false

    debugMode = false

    // used by collectLinks
    private rootUrl: URL

    private visited: URL[] = []

    constructor(rootUrl: URL, linkDepth = 2, verbose = false, debug = false) {
      this.rootUrl = rootUrl
      this.linkDepth = linkDepth
      this.verboseMode = verbose
      this.debugMode = debug
      this.axios = axios.create({baseURL: rootUrl.host})
    }

    async check(): Promise<ResponseData[]> {
      return this.fetch(this.rootUrl, this.linkDepthStart, this.rootUrl)
      .then(results => {
        return results.filter(link => {
          return Boolean(link)
        })
      })
      .catch(error => {
        throw new Error(error)
      })
    }

    // recursive promise tree
    async fetch(currentUrl: URL, currentLevel: number, linkedFrom: URL): Promise<ResponseData[]> {
      const seen = this.alreadyVisited(currentUrl)

      if (seen) {
        return []
      }
      if (this.debugMode) {
        console.log(`${currentLevel} currentUrl: ${currentUrl}`)
      }
      this.visit(currentUrl)

      let resError: AxiosError|null = null
      let res: AxiosResponse|null = null

      try {
        res = await this.axios.get(currentUrl.href)
      } catch (error) {
        if (error && error.response) {
          // console.log("Broken Link ")
          resError = error
          res = error.response
        } else {
          // console.log("Axios error ")
          throw new Error('Failed to fetch link, Axios returned no error response')
        }
      }

      if (resError) {
        if (this.debugMode) {
          console.log(`broken link: ${currentUrl.href} was unreachable: ${resError}`)
        }
        const brokenLink = [this.resultFor(currentUrl, currentLevel, linkedFrom, res!, resError)]
        // important that we return the result here or pay extra..
        return brokenLink
      }

      const links = this.collectLinks(res!)

      const currentResponseData: ResponseData[] = [this.resultFor(currentUrl, currentLevel, linkedFrom, res!)]

      const nextLevel = currentLevel + 1

      let nextResponseData: ResponseData[] = []

      if (nextLevel < this.linkDepth) {
        nextResponseData = await Promise.all(links.map(linkUrl => {
          return this.fetch(linkUrl, currentLevel + 1, currentUrl)
          .catch(error => {
            // FYI this shouldn't happen for happy path cases
            throw new Error(`Unexpected Failure while scraping links: \n${error}`)
          })
        }))
        .then(res => {
          return res.flat()
        })
      } else if (this.debugMode) {
        console.log(`${currentUrl} has no links`)
      }

      return currentResponseData.concat(nextResponseData)
    }

    // the link scraper
    collectLinks(pageRes: AxiosResponse): URL[] {
      const $ = cheerio.load(pageRes.data)

      const url = new URL(pageRes.config.url ?? '')

      const matchers: string[] = [
        'a[href^=\'/\']',
        `a[href*=".${url.host}/"]`,
        `a[href^=${url.origin}]`,
      ]

      const sameOriginLinksSelectors = matchers.join(', ')

      return $(sameOriginLinksSelectors).map((i, el): URL => {
        const childUrlStr = $(el).attr('href') ?? ''
        if (childUrlStr.startsWith('/')) {
          const childUrl = new URL(this.rootUrl.href)
          childUrl.pathname = childUrlStr
          return childUrl
        }
        return new URL(childUrlStr)
      }).get()
    }

    // metadata structure
    resultFor(url: URL,
      level: number,
      linkedFrom: URL,
      res: AxiosResponse,
      err?: AxiosError): ResponseData {
      const linkResult =  {
        href: url.toString(),
        level: level,
        linkedFrom: linkedFrom.toString(),
        broken: Boolean(err),
        reason: err?.message ?? 'n/a',
        status: res.status.toString() ?? 'none',
        statusText: res.statusText ?? 'none',
        links: [],
        malformed: false,
        secure: url.protocol === 'https:',
      }
      return linkResult
    }

    visit(url: URL) {
      this.visited.push(url)
      if (this.debugMode) {
        console.log(`${this.visited.length} visited`)
      }
    }

    alreadyVisited(url: URL): boolean {
      const seen = this.visited.find((found): boolean => {
        return url.href === found.href
      })

      return Boolean(seen)
    }
}

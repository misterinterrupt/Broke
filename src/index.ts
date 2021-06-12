import { Command, flags } from '@oclif/command'
import { Broke, ResponseData } from './Broke'

class BrokeCommand extends Command {

    static hidden = false
    static description = 'finds broken links'
    // static usage = ""
    static flags = {
        depth: flags.integer({ char: 'd' }),
        verbose: flags.boolean({ char: 'v' }),
        // add --version flag to show CLI version
        version: flags.version({ char: 'v' }),
        help: flags.help({ char: 'h' }),
    }

    static args = [{ name: 'domain' }]

    async run() {
        const { args, flags } = this.parse(BrokeCommand)
        if (args.domain) {
            var rootUrl = new URL(args.domain)
            var depthMsg = (!!flags.depth) ? `with a link depth of ${flags.depth} ` : ''
            this.log(`Broke is checking ${rootUrl.host} ${depthMsg}...`)
            var results: ResponseData[] = []
            try {
                results = await new Broke(rootUrl, flags.depth, flags.verbose).check()
            } catch (err) {
                this.debug(err)
                return
            }
            var broken = results.filter( (link:ResponseData) => {
                return link.broken
            })
            broken.forEach( (link:ResponseData) => {
                this.log(` `)
                this.log(`${link.href} was unreachable`)
                this.log(`  secure: ${link.secure} `)
                this.log(`  malformed: ${link.malformed} `)
                this.log(`  reason: ${link.reason ?? 'unknown'} `)
                this.log(`  linked to from ${link.linkedFrom} `)
                this.log(`  link depth: ${link.level} `)
                this.log(`  status: ${link.status} `)
                this.log(`  status text: ${link.statusText}`)
                this.log(` `)
            })
            if (broken.length > 0) {
                this.log(`${broken.length} broken out of ${results.length} found`)
            }
        }
    }
}

export = BrokeCommand
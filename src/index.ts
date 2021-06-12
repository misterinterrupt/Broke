import { Command, flags } from '@oclif/command'
import { Broke, LinkResult } from './Broke'

class BrokeCommand extends Command {

    static hidden = false
    static description = 'finds broken links'

    static flags = {
        // add --version flag to show CLI version
        version: flags.version({ char: 'v' }),
        help: flags.help({ char: 'h' }),
    }

    static args = [{ name: 'domain' }]

    async run() {
        const { args, flags } = this.parse(BrokeCommand)
        if (args.domain) {
            var rootUrl = new URL(args.domain)
            
            this.log(`Broke is checking ${rootUrl.host} ...`)
            var results: LinkResult[] = []
            try {
                results = await new Broke(rootUrl).check()
            } catch (err) {
                this.debug(err)
                return
            }
            var broken = results.filter( (link:LinkResult) => {
                return link.broken
            })
            if (broken.length > 0) {
                this.log(`${broken.length} broken out of ${results.length} found`)
            }
            broken.forEach( (link:LinkResult) => {
                if(!!link) {
                    if (link.broken) {
                        this.log(`${link.href} was unreachable: ${link.reason ?? 'unknown'} `)
                    }
                }
            })
        }
    }
}

export = BrokeCommand
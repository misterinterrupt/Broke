import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
import {Broke, ResponseData} from './broke'
class BrokeCommand extends Command {
    static hidden = false

    static description = 'finds broken links'

    // static usage = ""
    static flags = {
      depth: flags.integer({char: 'd'}),
      verbose: flags.boolean({char: 'v'}),
      debug: flags.boolean(),
      // add --version flag to show CLI version
      version: flags.version({char: 'v'}),
      help: flags.help({char: 'h'}),
    }

    static args = [{name: 'domain'}]

    async run() {
      const {args, flags} = this.parse(BrokeCommand)
      if (args.domain) {
        const rootUrl = new URL(args.domain)
        const broke = new Broke(rootUrl, flags.depth, flags.verbose, flags.debug)
        const depthMsg = `with a link depth of ${flags.depth ?? broke.linkDepth}`
        const startMsg = `Broke is checking ${rootUrl.host} ${depthMsg}`

        cli.action.start(startMsg)

        let results: ResponseData[] = []

        try {
          results = await broke.check()
        } catch (error) {
          this.debug(error)
          return
        }

        const broken = results.filter((link: ResponseData) => {
          return link.broken
        })

        const stopMsg = `\n\n${broken.length} broken out of ${results.length} found`

        cli.action.stop(stopMsg)

        if (flags.verbose ?? false) {
          broken.forEach((link: ResponseData) => {
            this.log(' ')
            this.log(`${link.href} was unreachable`)
            this.log(`  secure: ${link.secure} `)
            this.log(`  malformed: ${link.malformed} `)
            this.log(`  reason: ${link.reason ?? 'unknown'} `)
            this.log(`  linked to from ${link.linkedFrom} `)
            this.log(`  link depth: ${link.level} `)
            this.log(`  status: ${link.status} `)
            this.log(`  status text: ${link.statusText}`)
            this.log(' ')
          })
        } else {
          broken.forEach((link: ResponseData) => {
            this.log(' ')
            this.log(`${link.href} was unreachable`)
            this.log(`  reason: ${link.reason} `)
            this.log(`  status: ${link.status}`)
            this.log(' ')
          })
        }
      }
    }
}

export = BrokeCommand

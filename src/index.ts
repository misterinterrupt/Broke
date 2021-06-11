import {Command, flags} from '@oclif/command'
import { Broke, LinkResult } from './Broke'

class BrokeCommand extends Command {
  
  static hidden = false
  static description = 'finds broken links'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
  }

  static args = [{name: 'domain'}]
  
  broker: Broke = new Broke()
  
  async run() {
    const {args, flags} = this.parse(BrokeCommand)
    if (args.domain) {
      var root = new URL(args.domain)
      // let results: LinkResult[] = await 
      this.broker.check(root)
      // results.forEach( res:LinkResult => {
        
      // });
    }
  }
}

export = BrokeCommand
import { configureAllowedScripts } from '@ministryofjustice/hmpps-npm-script-allowlist'

export default configureAllowedScripts({
  allowlist: {
    'node_modules/dtrace-provider@0.8.8': 'FORBID',
    'node_modules/fsevents@2.3.3': 'FORBID',
    'node_modules/unrs-resolver@1.11.1': 'ALLOW',
  },
})

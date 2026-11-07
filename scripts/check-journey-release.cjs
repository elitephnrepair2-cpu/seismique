/* Repeatable release gate: failure stops publication, rather than hiding regressions. */
const {spawnSync}=require('node:child_process'),path=require('node:path');
for(const name of ['branch-build','jungle-surfaces','journey-health','preparation-recovery','opening-readiness','progressive-preparation','frame-pacing','crisp-rendering','network-loading','journey-performance','tablet-rendering','jungle-light-budget','mobile-journey','portal-transition','portal-depth']){
  const check=spawnSync(process.execPath,[path.join(__dirname,'check-'+name+'.cjs')],{stdio:'inherit'});
  if(check.status!==0)process.exit(check.status||1);
}

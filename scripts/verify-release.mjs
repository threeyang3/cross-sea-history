import { spawnSync } from 'node:child_process';

const npm=process.env.npm_execpath;
if(!npm)throw new Error('Run via npm run verify:release');
const args=new Set(process.argv.slice(2));
for(const arg of args)if(!['--require-local','--typecheck','--skip-build'].includes(arg))throw new Error('Unknown option '+arg);
const tasks=[['run','check:reader'],['run','check:ui',...(args.has('--require-local')?['--','--require-local']:[])],['run','lint']];
if(args.has('--typecheck'))tasks.push(['exec','--offline','--','tsc','--noEmit']);
if(!args.has('--skip-build'))tasks.push(['run','build']);
for(const task of tasks){
 console.log('\n> npm '+task.join(' '));
 const result=spawnSync(process.execPath,[npm,...task],{stdio:'inherit'});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status??1);
}
console.log('Requested release verification steps passed. Browser review and deployment are separate steps.');

/* Standard concept: a generic, industry-neutral org (fictional names only).
   Same request shape as flow/requests.js so the shared flow engine runs unchanged. */
window.FLOW_CFG={org:'Example Co.',orgFull:'EXAMPLE CO.',link:'exco.io',event:'This weekend',date:'Sat–Sun, Nov 21–22',planTitle:'The weekend plan',planRole:'Weekend plan',unit:'teams',approverRole:'Operations manager'};
const TEAMS={sup:{n:'Customer Support',c:'#0ea5a4',hc:42},ops:{n:'Operations',c:'#2563eb',hc:64},fac:{n:'Facilities',c:'#7c3aed',hc:18},sec:{n:'Security',c:'#4f46e5',hc:22},
 rec:{n:'Reception',c:'#db2777',hc:8},fld:{n:'Field Service',c:'#d97706',hc:26},it:{n:'IT Service Desk',c:'#059669',hc:14},log:{n:'Logistics',c:'#64748b',hc:30}};
window.FROM_EXTRA=Object.fromEntries(Object.entries(TEAMS).map(([k,t])=>[k,t.n]).concat([['agency','Approved agency']]));
const REQ={
 sup:{dept:'sup',deptName:'Customer Support',c:'#0ea5a4',
  callout:'Support is short 3 agents on Saturday, 9 AM to 5 PM, for the product launch.',
  hl:[['3 agents','need'],['Saturday','when'],['9 AM to 5 PM','when'],['Support','loc']],
  role:'Support Agent',loc:'Support Center · Floor 2',when:'Sat 9:00 AM – 5:00 PM',need:3,quals:['Product training','Phone system'],incentive:0,
  cands:[['Alex Kim','sup','Agent · 32 hrs this week','ok','accept',94],['Jordan Lee','rec','Cross-trained from Reception','ok','accept',88],['Mira Patel','sup','Agent · 30 hrs','ok','accept',90],
   ['Sam Ortiz','sup','Agent · 34 hrs','ok','decline',85],['Ben Shaw','sup','Agent · 26 hrs','ok','none',83],['Taylor Ng','sup','On PTO Saturday','no']]},
 ops:{dept:'ops',deptName:'Operations',c:'#2563eb',
  callout:'Operations needs 4 more associates on the Saturday night shift, 10 PM to 6 AM.',
  hl:[['4 more associates','need'],['Saturday night','when'],['10 PM to 6 AM','when'],['Operations','loc']],
  role:'Operations Associate',loc:'Building A',when:'Sat 10:00 PM – 6:00 AM',need:4,quals:['Equipment certified'],incentive:0,
  cands:[['Chris Dunn','ops','Associate · 30 hrs','ok','accept',91],['Lee Moss','ops','Associate · 28 hrs','ok','accept',89],['Pat Rivera','ops','Associate · 32 hrs','ok','decline',86],
   ['Robin Hale','log','Cross-trained from Logistics','ok','decline',84],['Uma Rao','ops','Associate · 24 hrs','ok','none',82],['Drew Cole','ops','Would break the 10 hr rest rule','no']],
  next:{t:'Add a $50 night bonus',p:'Pat and Robin said they’d take it with a bonus. A bonus needs a second manager to approve, so I’ll send it to Taylor Brooks first.',approval:true,incentive:50,
   cands:[['Pat Rivera','ops','Re-offer with bonus','ok','accept',86],['Robin Hale','log','Re-offer with bonus','ok','accept',84]]}},
 sec:{dept:'sec',deptName:'Security',c:'#4f46e5',
  callout:'Security needs 2 officers for the Saturday evening event, 4 PM to midnight.',
  hl:[['2 officers','need'],['Saturday evening','when'],['4 PM to midnight','when'],['Security','loc']],
  role:'Security Officer',loc:'Main Entrance',when:'Sat 4:00 PM – 12:00 AM',need:2,quals:['Guard license'],incentive:0,
  cands:[['Dana Fox','sec','Officer · 30 hrs','ok','accept',93],['Kai Lowe','sec','Officer · 26 hrs','ok','accept',90],['Noor Haddad','sec','Officer · 38 hrs · 6 hrs OT','ok','accept',88],['Ellis Park','sec','License expired Oct 30','no']]},
 rec:{dept:'rec',deptName:'Reception',c:'#db2777',
  callout:'Reception needs 1 person to cover the front desk Saturday morning, 8 AM to noon.',
  hl:[['1 person','need'],['Saturday morning','when'],['8 AM to noon','when'],['front desk','loc']],
  role:'Receptionist',loc:'Main Lobby',when:'Sat 8:00 AM – 12:00 PM',need:1,quals:['Visitor system'],incentive:0,
  cands:[['Rae Quinn','rec','Receptionist · 24 hrs','ok','accept',95],['Jordan Lee','rec','Already moving to Support','no']]},
 it:{dept:'it',deptName:'IT Service Desk',c:'#059669',
  callout:'IT needs an on-call engineer for Saturday night, 6 PM to 6 AM, during the system upgrade.',
  hl:[['an on-call engineer','need'],['Saturday night','when'],['6 PM to 6 AM','when'],['IT','loc']],
  role:'On-call Engineer',loc:'Remote',when:'Sat 6:00 PM – 6:00 AM',need:1,quals:['Admin access'],incentive:0,
  cands:[['Jamie Fox','it','Engineer · 32 hrs','ok','accept',92],['Robin Lee','it','On call last weekend','ok','decline',87]]},
 fld:{dept:'fld',deptName:'Field Service',c:'#d97706',
  callout:'Field Service needs 2 technicians Sunday, 7 AM to 3 PM, for the North region backlog.',
  hl:[['2 technicians','need'],['Sunday','when'],['7 AM to 3 PM','when'],['North region','loc']],
  role:'Field Technician',loc:'North Region',when:'Sun 7:00 AM – 3:00 PM',need:2,quals:['Driver’s license','Level 2 certified'],incentive:0,
  cands:[['Morgan Reyes','fld','Technician · 32 hrs','ok','accept',92],['Casey Brooks','fld','Technician · 28 hrs','ok','accept',90],['Avery Kim','fld','Technician · 24 hrs','ok','accept',88],['Lou Grant','fld','Level 1 only','no']]}
};
Object.values(REQ).forEach(r=>{r.cands=r.cands.map(a=>({name:a[0],from:a[1],note:a[2],ok:a[3]==='ok',resp:a[4],fit:a[5],n:a[6]||1}));if(r.next)r.next.cands=r.next.cands.map(a=>({name:a[0],from:a[1],note:a[2],ok:true,resp:a[4],fit:a[5],n:a[6]||1}))});
/* seniority (yrs), extra shifts last 30 days, overtime hrs this shift would add, asked for more hours */
const FACT={'Dana Fox':[6,2,0,0],'Kai Lowe':[2,0,0,1],'Noor Haddad':[8,3,6,0],'Morgan Reyes':[7,2,0,0],'Casey Brooks':[4,1,0,0],'Avery Kim':[2,0,0,1]};
const POLICY={sec:{rule:'Company policy: avoid overtime over 4 hrs, then fewest extra shifts',pick:['Dana Fox','Kai Lowe'],
   why:'Noor is the most senior, but this shift would put Noor at 6 hours of overtime. Dana and Kai cover it with no overtime, and Kai asked for more hours.'},
 fld:{rule:'Labor agreement: extra shifts go in seniority order',pick:['Morgan Reyes','Casey Brooks'],
   why:'Seniority order is Morgan (7 yrs), then Casey (4 yrs), then Avery (2 yrs). Avery asked for more hours, so I’ll put Avery first in line for the next opening. You can override this with a note.'}};
Object.values(REQ).forEach(r=>r.cands.forEach(c=>{const f=FACT[c.name];if(f)c.f={sen:f[0],extra:f[1],ot:f[2],wants:f[3]}}));
/* decisions a person has to make (not requests) */
const DECISIONS=[
 {id:'dbl',team:'sup',t:'Alex Kim is booked twice on Saturday',p:'Support has Alex from 9 to 5. Reception scheduled Alex for visitor-system training from 1 to 3.',when:'Sat 1 PM – 3 PM',
  opts:[['Move the training to Monday','Alex stays on Support all day. Training has open seats Monday at 10.',1],['Keep the training, cover 1 to 3','I’d ask Sam Ortiz to cover Support for two hours.',0]]},
 {id:'ot',team:'ops',t:'Chris Dunn would reach 46 hours',p:'Picking up the Saturday night shift puts Chris 6 hours over 40 this week.',when:'Week of Nov 16',
  opts:[['Approve 6 hours of overtime','Chris asked for the shift. Overtime over 4 hours needs your approval.',0],['Swap Chris’s Thursday shift to Lee Moss','Chris stays at 40 hours. Lee is at 28 and asked for more.',1]]}];

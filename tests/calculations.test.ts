import {createHash} from 'node:crypto';
import {describe,expect,it} from 'vitest';
import {BASE_BANK, createExam, SUBJECTS} from '../src/model';
const variants=BASE_BANK.filter(q=>q.calculation);
// Independent implementation: JS floating-point with explicit decimal half-up.
// Python generator uses Decimal, and no generation functions are imported here.
function roundHalfUp(x:number,p=3){const scale=10**p;return Math.floor((x+Number.EPSILON*Math.max(1,Math.abs(x)))*scale+0.5)/scale;}
const equations:Record<string,(v:number[])=>number>={
 sensible:([mass,capacity,rise])=>capacity*rise*mass,
 latent:([mass,latent])=>latent*mass,
 hrr:([massPerSecond,megaJoulesPerKg])=>(massPerSecond*1e3)*megaJoulesPerKg,
 conduction:([conductivity,area,temperatureDifference,thickness])=>temperatureDifference/(thickness/(conductivity*area)),
 fireload:([mass,heatPerKg,area])=>heatPerKg*(mass/area),
 gaspressure:([initialPressure,initialKelvin,finalKelvin])=>(initialPressure/initialKelvin)*finalKelvin,
 ohm:([voltage,resistance])=>voltage*(1/resistance),
 series:([r1,r2])=>[r1,r2].reduce((a,b)=>a+b,0),
 parallel:([r1,r2])=>1/(1/r1+1/r2),
 dcPower:([volts,amps])=>amps*volts,
 energy:([watts,hours])=>hours*(watts*1e-3),
 capacitorCharge:([microfarads,volts])=>(microfarads*1e-6)*volts*1e3,
 transformer:([volts,primary,secondary])=>volts/(primary/secondary),
 batteryDuty:([standbyAmps,standbyHours,alarmAmps,alarmHours])=>[standbyAmps*standbyHours,alarmAmps*alarmHours].reduce((a,b)=>a+b,0),
 voltageDrop:([rho,oneWayMetres,amps,squareMm])=>amps*((oneWayMetres+oneWayMetres)*rho/squareMm),
 alarmLoads:([count,perDevice,controller])=>controller+Array.from({length:count},()=>perDevice).reduce((a,b)=>a+b,0),
 eolCurrent:([volts,termination,loop])=>(volts/(loop+termination))*1e3,
 speakerLoad:([n1,p1,n2,p2])=>[...Array.from({length:n1},()=>p1),...Array.from({length:n2},()=>p2)].reduce((a,b)=>a+b,0),
 terminalVoltage:([source,current,loopOhms])=>source-loopOhms*current,
 batteryUsable:([ampHours,usableFraction,amps])=>(ampHours/amps)*usableFraction,
};
const units:Record<string,string>={sensible:'kJ',latent:'kJ',hrr:'kW',conduction:'W',fireload:'MJ/m²',gaspressure:'kPa',ohm:'A',series:'Ω',parallel:'Ω',dcPower:'W',energy:'kWh',capacitorCharge:'mC',transformer:'V',batteryDuty:'Ah',voltageDrop:'V',alarmLoads:'A',eolCurrent:'mA',speakerLoad:'W',terminalVoltage:'V',batteryUsable:'h'};
describe('변형 수량과 보존',()=>{
 it('기존 80문항의 전체 속성 및 순서를 보존',()=>expect(createHash('sha256').update(JSON.stringify(BASE_BANK.slice(0,80))).digest('hex')).toBe('8b6dddf6a99b21e207b6e12ac46da6701886cd4481a4ff0c1c09dd271bf4458a'));
 it('개념200 + 20유형×40조건=1000, 대기/기출로 위장하지 않음',()=>{
  expect(BASE_BANK.filter(q=>!q.family)).toHaveLength(200);expect(variants).toHaveLength(800);expect(new Set(variants.map(q=>q.family)).size).toBe(20);
  for(const kind of Object.keys(equations)){const group=variants.filter(q=>q.calculation?.kind===kind);expect(group).toHaveLength(40);expect(new Set(group.map(q=>JSON.stringify(q.calculation?.values))).size).toBe(40);}
  expect(BASE_BANK.every(q=>q.type==='original'&&q.year===null&&q.session===null&&q.verificationStatus==='reviewed')).toBe(true);
 });
 it('기본 모의시험은 수치 변형 family를 중복 추출하지 않음',()=>{
  // Each subject also has >=20 distinct concept items, so fallback is unnecessary.
  for(let run=0;run<30;run++){const exam=createExam(BASE_BANK,'main');const families=exam.questions.flatMap(q=>q.family?[q.family]:[]);expect(new Set(families).size).toBe(families.length);for(const s of SUBJECTS)expect(exam.questions.filter(q=>q.subject===s)).toHaveLength(20);}
 });
 it('반올림 경계는 양수 사사오입이며 잘라내기가 아님',()=>{expect(roundHalfUp(0.0625)).toBe(0.063);expect(roundHalfUp(1.2345)).toBe(1.235);expect(roundHalfUp(1.234499)).toBe(1.234);});
});
for(const q of variants)it(`별도 계산·단위·보기·해설 대입 검증 ${q.id}`,()=>{
 const c=q.calculation!;
 expect(equations[c.kind]).toBeDefined();expect(c.precision).toBe(3);expect(c.unit).toBe(units[c.kind]);
 expect(c.values.every(x=>Number.isFinite(x)&&x>0)).toBe(true);
 const computed=equations[c.kind](c.values);expect(Number.isFinite(computed)).toBe(true);expect(computed).toBeGreaterThan(0);
 const expected=roundHalfUp(computed);
 expect(c.result).toBeCloseTo(expected,10);
 const options=q.choices.map(choice=>{const [value,...unit]=choice.split(' ');expect(unit.join(' ')).toBe(units[c.kind]);expect(value).toMatch(/^\d+(?:\.\d{1,3})?$/);return Number(value);});
 expect(options[q.answer-1]).toBe(expected);expect(options.filter(x=>x===expected)).toHaveLength(1);expect(new Set(options).size).toBe(4);
 expect(q.explanation).toContain(`${expected} ${units[c.kind]}`);expect(q.explanation).toContain('대입');expect(q.question).toContain('소수 셋째 자리');expect(q.family).toBe(`FPE-${c.kind}`);
 for(const input of c.values)expect(q.question).toContain(String(input));
 if(c.kind==='parallel')expect(computed).toBeLessThan(Math.min(...c.values));
 if(c.kind==='terminalVoltage')expect(computed).toBeLessThan(c.values[0]);
 if(c.kind==='batteryUsable')expect(c.values[1]).toBeLessThanOrEqual(1);
});

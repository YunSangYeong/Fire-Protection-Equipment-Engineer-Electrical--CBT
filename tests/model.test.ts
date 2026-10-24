import { describe, expect, it } from 'vitest';
import { BASE_BANK as bank, SUBJECTS, createExam, grade, answerExam, submitExam, emptyStore, restoreStore, remainingSeconds, startPractice, nextPractice, checkPractice, importQuestions, fingerprint, validateQuestion, parseCsv } from '../src/model';
import { PROFILE } from '../src/qualification';
describe('대상 자격증 구성과 내부 검토 문항', () => {
 it('1000개 고유 자체 제작 문항과 실제 과목 분포, 미확인 기출 정보 없음', () => {
  expect(bank).toHaveLength(1000); expect(new Set(bank.map(q=>q.id)).size).toBe(1000);expect(new Set(bank.map(fingerprint)).size).toBe(1000);
  SUBJECTS.forEach((s,i)=>expect(bank.filter(q=>q.subject===s)).toHaveLength([300,340,20,340][i]));
  for(const q of bank) {validateQuestion(q); expect(q.type).toBe('original');expect(q.year).toBeNull();expect(q.session).toBeNull();expect(q.explanation.length).toBeGreaterThan(40);}
 });
 it('목표 수량 충족과 공식 대조 대기를 구별하는 구성',()=>{expect(1000-bank.length).toBe(0);expect(PROFILE.rulesVerificationStatus).toBe('pending');});
 it('보기 순서가 다른 동일 문항과 중복 ID를 제거하고 가져오기는 대기로 등록',()=>{
  expect(importQuestions([{...bank[0],id:'OTHER',choices:[...bank[0].choices].reverse(),answer:5-bank[0].answer},bank[0]],bank).duplicates).toBe(2);
  expect(importQuestions([{...bank[0],id:'NEW',question:'서로 다른 학습용 문항'}],bank).added[0].verificationStatus).toBe('pending');
 });
 it('오류 행은 전체 가져오기를 중단',()=>{expect(()=>importQuestions([{...bank[0],id:'NEW'}, {...bank[1],id:'BAD',answer:8}],bank)).toThrow('2번');});
 it('위험한 URL·가짜 기출 연도·중복 보기·깨진 CSV 거부',()=>{
  for(const q of [{...bank[0],sourceUrl:'javascript:alert(1)'},{...bank[0],year:2024},{...bank[0],choices:['a','a','b','c']}])expect(()=>validateQuestion(q)).toThrow();
  expect(()=>parseCsv('id,id\na,b')).toThrow(); expect(()=>parseCsv('id,question\n"bad')).toThrow();
 });
});
describe('80문항 120분·평균60/과목40 학습 규칙',()=>{
 it('과목별20, 중복 없고 대기 제외',()=>{const e=createExam([...bank,{...bank[0],id:'PENDING',verificationStatus:'pending'}],'main',1000);expect(e.questions).toHaveLength(80);expect(new Set(e.questions.map(q=>q.id)).size).toBe(80);for(const s of SUBJECTS)expect(e.questions.filter(q=>q.subject===s)).toHaveLength(20);expect(e.deadline).toBe(7201000);expect(e.questions.some(q=>q.id==='PENDING')).toBe(false);});
 it('과목 부족은 시작 불가',()=>expect(()=>createExam(bank.filter(q=>q.subject!==SUBJECTS[2]||q.id!=='FPE-3-001'),'main')).toThrow());
 for(const counts of [[12,12,12,12],[7,13,14,14],[8,12,13,14],[8,12,14,14]])it(`과목 정답 ${counts}의 합격 경계`,()=>{const e=createExam(bank,'main');SUBJECTS.forEach((s,i)=>e.questions.filter(q=>q.subject===s).slice(0,counts[i]).forEach(q=>e.answers[q.id]=q.answer));expect(grade(e).passed).toBe(counts.reduce((a,b)=>a+b,0)>=48&&counts.every(n=>n>=8));});
 it('표시 반올림으로 합격 판정을 바꾸지 않음',()=>{const e=createExam(bank,'main');e.questions.slice(0,47).forEach(q=>e.answers[q.id]=q.answer);expect(grade(e).score).toBe(58.8);expect(grade(e).passed).toBe(false);});
 it('답안 변경·만료 후 차단·중복 제출 방지',()=>{let s=emptyStore();s.exam=createExam(bank,'main',1000);const id=s.exam.questions[0].id;s=answerExam(s,id,1,2000);s=answerExam(s,id,2,3000);expect(s.exam?.answers[id]).toBe(2);s=answerExam(s,id,3,7201000);expect(s.exam).toBeNull();expect(s.results[0].answers[id]).toBe(2);expect(s.results[0].reason).toBe('timeout');expect(submitExam(s)).toEqual(s);expect(s.attempts).toHaveLength(80);});
 it('절대 종료시각 복원 후 재접속해도 시간 연장 없음',()=>{const s={...emptyStore(),exam:createExam(bank,'main',1000)};const restored=restoreStore(JSON.stringify(s));expect(restored.exam?.deadline).toBe(7201000);expect(remainingSeconds(restored.exam!.deadline,7200000)).toBe(1);expect(remainingSeconds(restored.exam!.deadline,7202000)).toBe(0);expect(()=>restoreStore(JSON.stringify({...s,exam:{...s.exam,deadline:3601000}}))).toThrow();});
 it('손상 데이터와 잘못된 답안 참조 거부',()=>{expect(()=>restoreStore('{bad')).toThrow();const s={...emptyStore(),exam:createExam(bank,'main')};s.exam.answers.unknown=1;expect(()=>restoreStore(JSON.stringify(s))).toThrow();});
});
describe('복습과 기록',()=>{
 it('과목 300개를 순회하기 전에 중복하지 않음',()=>{let p=startPractice(bank,'main',SUBJECTS[0]);const seen=new Set();for(let i=0;i<300;i++){expect(seen.has(p.currentId)).toBe(false);seen.add(p.currentId);p=nextPractice(p,bank);}expect(seen.size).toBe(300);});
 it('즉시 채점은 한번·재학습 정답은 오답 제거',()=>{const p=startPractice(bank,'main');const q=bank.find(q=>q.id===p.currentId)!;const s=checkPractice({...emptyStore(),wrongIds:[q.id],practice:{...p,selected:q.answer}},bank);expect(s.wrongIds).toEqual([]);expect(s.attempts).toHaveLength(1);expect(checkPractice(s,bank)).toEqual(s);expect(s.practice?.streak).toBe(1);});
 it('단일 문항 오답 복습과 CSV 인용 지원',()=>{const p=startPractice(bank,'main','전체',[bank[0].id]);expect(nextPractice(p,bank).currentId).toBe(bank[0].id);expect(parseCsv('id,question\nx,"a,b"')[0]).toMatchObject({question:'a,b'});});
});

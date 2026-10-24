// Official page access was blocked; this is a learning configuration pending official cross-check.
export const PROFILE = {
  name: "소방설비기사(전기)",
  subjects: ["소방원론", "소방전기일반", "소방관계법규", "소방전기시설의 구조 및 원리"] as const,
  questionCount: 80, perSubject: 20, durationMinutes: 120,
  choiceCount: 4, passRate: 0.6, subjectPassRate: 0.4,
  rulesVerificationStatus: "pending",
  officialSource: "https://www.q-net.or.kr/crf005.do?id=crf00503&jmCd=1900",
} as const;

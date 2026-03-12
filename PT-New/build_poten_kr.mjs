// Shadowgram — 유형별 포텐 설명서 + 개발법
// 구조: 진단 → 처방전 → 복용법
// 출력: PT-New/KR/포텐개발법/[유형]_KR_포텐개발법.docx

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel,
  PageBreak, VerticalAlign, Header, Footer, PageNumber
} from 'docx';
import fs from 'fs';
import path from 'path';

// ── 컬러 팔레트 ──────────────────────────────────────────────
const C = {
  DARK:   '1A2030',
  GOLD:   'B8860B',
  GOLD_L: 'D4A017',
  SILVER: '8899AA',
  WHITE:  'FFFFFF',
  BG:     'F7F5F0',
  LIGHT:  'EEF0F3',
};

// ── 8유형 데이터 ─────────────────────────────────────────────
const TYPES = [
  {
    id: 'SPARK',
    emoji: '⚡',
    title: '탐험가 · 가능성의 불꽃',
    mbti: 'ENFP · ENTP',
    main: 'Ne (외향적 직관)',
    inferior: 'Si (내향적 감각)',
    // 진단 — 칭찬 + 찔림
    praise: [
      '"머리 좋다. 이런 생각 어떻게 한 거야?"',
      '"넌 아이디어가 정말 많다."',
      '"분위기를 확 바꾸는 능력이 있어."',
    ],
    sting: [
      '"또 다른 거 시작이야? 이전 것 끝냈어?"',
      '"넌 왜 한 가지를 끝까지 못 하니?"',
      '"아이디어는 좋은데... 실행이 안 되잖아."',
    ],
    poten_core: '아직 안 깨어난 포텐: 완성의 힘 (Si 통합)',
    poten_desc: '넘치는 가능성과 아이디어가 "완성"으로 연결될 때, 당신은 단순한 탐험가가 아니라 세상을 바꾸는 창조자가 됩니다. Si(내향적 감각)는 당신의 열등기능이지만, 그것이 곧 가장 큰 성장의 보물창고예요.',
    // 처방전 — 왜 이 패턴이 생기는가 + 4가지 핵심 패턴
    rx_intro: 'Ne(외향적 직관)가 강한 당신은 세상을 가능성의 연결망으로 봅니다. 새로운 자극이 올 때마다 에너지가 솟구치죠. 문제는 Si(내향적 감각) — 반복, 루틴, 마무리 — 이 영역이 당신의 "그림자"예요. 억압된 Si는 세 가지 방식으로 당신을 방해합니다.',
    patterns: [
      {
        name: '패턴 1 · 90% 완성 증후군',
        desc: '아이디어는 넘치고, 시작은 잘 하는데 마지막 10%에서 에너지가 뚝 끊겨요. "이미 다음 아이디어가 보이는데 이걸 왜 마무리해야 하지?"라는 생각이 들기 시작하면 신호예요.',
        insight: '이건 의지력 부족이 아닙니다. Ne가 새로운 가능성에 반응하는 방식이에요. 하지만 완성된 것만이 세상에 실제로 존재합니다.'
      },
      {
        name: '패턴 2 · 루틴 거부 반응',
        desc: '반복적인 일을 하면 몸이 반응해요. 무기력, 지루함, "이게 내 일이 맞나?" 하는 의심. 정해진 방식대로만 해야 하는 환경에서 재능이 죽어가는 느낌.',
        insight: '루틴 자체가 문제가 아니에요. Ne를 살리는 루틴은 가능해요. 미세한 실험과 변주를 허용하는 구조만 있으면 됩니다.'
      },
      {
        name: '패턴 3 · 스트레스 Si 폭발',
        desc: '극도의 압박이 오면 갑자기 강박적으로 정리하거나, 아주 작은 것들에 집착하게 돼요. 평소 자유로운 SPARK가 갑자기 세세한 것에 예민해지는 순간입니다.',
        insight: '이것이 Si 그림자가 날것으로 튀어나오는 순간이에요. 공황이 아닙니다. 억압된 기능이 터지는 것입니다.'
      },
      {
        name: '패턴 4 · 아이덴티티 위기',
        desc: '"나는 왜 이렇게 시작만 잘 할까?" 이 질문이 자기비판이 되면 위험해요. "난 믿을 수 없는 사람이야"라는 낙인이 돼버립니다.',
        insight: '당신의 패턴은 결함이 아닙니다. 아직 통합되지 않은 기능입니다. 이 차이가 전부예요.'
      }
    ],
    // 복용법 — 실제 개발 방법
    rx_action: [
      {
        step: '복용 1단계 · 인식 (1~2주)',
        title: '"나는 언제 Si가 필요한가" 알아차리기',
        actions: [
          '하루 끝에 딱 1분: 오늘 내가 시작한 것, 완성한 것 체크',
          '"끝내기 싫은 이유"를 판단 없이 적어보기',
          '강박적 정리가 나타나면 "아, 지금 스트레스 Si구나" 인식만 하기',
        ]
      },
      {
        step: '복용 2단계 · 실험 (3~4주)',
        title: '"작게 완성하는 근육" 키우기',
        actions: [
          '프로젝트를 "24시간 안에 완성 가능한 단위"로 쪼개기',
          '매일 딱 하나만 "완전히 끝내기" 실험 (크기 무관)',
          '루틴에 미세한 변주 허용하기 — 같은 일, 다른 순서로',
        ]
      },
      {
        step: '복용 3단계 · 통합 (2개월+)',
        title: 'Ne + Si 시너지 구조 만들기',
        actions: [
          '"탐험 시간"과 "완성 시간"을 주간 단위로 분리 설계',
          '아이디어 노트 + 완성 로그를 병렬 유지 (버리지 말고 쌓기)',
          '완성한 것을 소리내어 또는 글로 자신에게 인정하기',
        ]
      }
    ],
    community: '핫마트 클럽 SPARK 그룹에서 같은 유형의 완성 사례, 루틴 실험, Si 통합 여정을 함께 나누세요. 혼자 하는 개발보다 3배 빠릅니다.',
    hotmart: 'https://go.hotmart.com/J104717194W',
  },
  {
    id: 'VISION',
    emoji: '🔮',
    title: '선지자 · 깊은 통찰',
    mbti: 'INFJ · INTJ',
    main: 'Ni (내향적 직관)',
    inferior: 'Se (외향적 감각)',
    praise: [
      '"어떻게 그걸 미리 알았어? 통찰력이 대단해."',
      '"넌 남들이 못 보는 걸 보는 것 같아."',
      '"깊이가 있어. 이런 관점은 처음 들어봐."',
    ],
    sting: [
      '"그게 될 것 같아? 좀 현실적으로 생각해."',
      '"혼자만 그렇게 생각하는 거야."',
      '"왜 그렇게 완벽하게 하려고 해? 그냥 해."',
    ],
    poten_core: '아직 안 깨어난 포텐: 현실 구현력 (Se 통합)',
    poten_desc: '당신의 통찰은 세상에서 가장 깊습니다. 그런데 그 통찰이 실제 세상에 닿을 때, 비로소 완성됩니다. Se(외향적 감각)를 통합하면 비전이 현실이 됩니다.',
    rx_intro: 'Ni(내향적 직관)가 강한 당신은 패턴과 미래를 봅니다. 문제는 Se(외향적 감각) — 지금 이 순간, 몸, 현실의 디테일 — 이 영역이 당신의 그림자예요.',
    patterns: [
      {
        name: '패턴 1 · 완벽주의 마비',
        desc: '"아직 완벽하지 않아서" 내놓지 못하는 작업들이 쌓입니다. 비전은 명확한데 실행이 계속 미뤄져요.',
        insight: '완벽한 준비를 기다리는 동안 세상은 70점짜리를 먼저 낸 사람에게 갑니다.'
      },
      {
        name: '패턴 2 · 현재 이탈',
        desc: '몸은 여기 있는데 마음은 이미 5년 뒤에 있어요. 지금 이 대화, 이 순간의 감각을 놓치는 일이 많습니다.',
        insight: 'Ni가 미래를 보는 동안 Se가 놓친 현재의 정보들이 쌓입니다. 관계에서 특히 크게 나타납니다.'
      },
      {
        name: '패턴 3 · 고독한 비전가',
        desc: '"내가 보는 걸 아무도 이해 못 해." 이 외로움이 반복됩니다. 공유해도 공감을 못 받으면 더 안으로 들어갑니다.',
        insight: 'Se를 통합하면 비전을 남들이 이해할 수 있는 언어와 형태로 표현하는 능력이 열립니다.'
      },
      {
        name: '패턴 4 · 극단적 Se 분출',
        desc: '평소 절제된 VISION이 과부하 시 갑자기 과식, 충동구매, 극단적 감각 추구로 터집니다.',
        insight: '억압된 Se가 날것으로 나오는 것입니다. 의식적 Se 개발이 이것을 막습니다.'
      }
    ],
    rx_action: [
      {
        step: '복용 1단계 · 인식 (1~2주)',
        title: '"나는 언제 Se가 필요한가" 알아차리기',
        actions: [
          '하루 5분: 지금 이 순간의 감각 3가지 적기 (소리, 냄새, 온도)',
          '비전을 누군가에게 설명할 때 "구체적 예시"를 하나씩 추가해보기',
          '완벽주의가 올 때 "70점으로 내놓기" 실험 딱 한 번',
        ]
      },
      {
        step: '복용 2단계 · 실험 (3~4주)',
        title: '"비전을 현실로" 연결하는 근육 키우기',
        actions: [
          '주 1회 "몸으로 하는 활동" — 요리, 산책, 만들기',
          '프로토타입 빠르게 만들기 연습 — 완성보다 존재가 먼저',
          '비전을 설명할 때 그림, 도표, 손 제스처 활용해보기',
        ]
      },
      {
        step: '복용 3단계 · 통합 (2개월+)',
        title: 'Ni + Se 시너지: 비전의 현실화',
        actions: [
          '"90일 실행 지도" — 비전을 90일 단위 행동으로 분해',
          '월 1회 비전을 소리내어 발표하거나 글로 공개하기',
          '현재 순간 감사 루틴 — 통찰과 현실을 연결하는 닻',
        ]
      }
    ],
    community: '핫마트 클럽 VISION 그룹에서 같은 유형의 현실화 사례, 비전 공유, Se 통합 여정을 함께 나누세요.',
    hotmart: 'https://go.hotmart.com/I104717374F',
  },
  {
    id: 'STEADY',
    emoji: '🏔',
    title: '수호자 · 든든한 토대',
    mbti: 'ISFJ · ISTJ',
    main: 'Si (내향적 감각)',
    inferior: 'Ne (외향적 직관)',
    praise: [
      '"넌 정말 믿을 수 있어. 부탁하면 꼭 해줘."',
      '"꼼꼼하고 철저해. 네가 있으면 안심돼."',
      '"경험에서 나온 지혜가 있어."',
    ],
    sting: [
      '"왜 그렇게 변화를 무서워해?"',
      '"좀 새로운 걸 해봐. 맨날 똑같이 하잖아."',
      '"유연하게 생각 좀 해봐."',
    ],
    poten_core: '아직 안 깨어난 포텐: 변화를 이끄는 힘 (Ne 통합)',
    poten_desc: '당신의 안정감과 신뢰성은 최고입니다. 여기에 Ne(외향적 직관)의 유연성과 혁신이 더해지면 — 변화를 두려워하지 않고 이끄는 사람이 됩니다.',
    rx_intro: 'Si(내향적 감각)가 강한 당신은 검증된 것, 익숙한 것에서 안정을 찾습니다. Ne(외향적 직관) — 새로운 가능성, 변화, 실험 — 이 영역이 그림자예요.',
    patterns: [
      {
        name: '패턴 1 · 변화 저항',
        desc: '"그냥 하던 대로 하면 되는데 왜 바꿔?" 라는 반응이 자동으로 나옵니다. 새로운 방식 앞에서 불안이 먼저 와요.',
        insight: '변화 저항은 약함이 아니라 Si의 자기보호 방식입니다. 하지만 세상이 바뀌는 속도는 Si의 편안함을 기다려주지 않아요.'
      },
      {
        name: '패턴 2 · 보이지 않는 헌신',
        desc: '"내가 이렇게 했는데 왜 아무도 몰라줄까." 말 없이 다 해주지만 인정받지 못하는 패턴이 반복됩니다.',
        insight: 'Si는 묵묵히 하는 것을 미덕으로 여깁니다. 하지만 세상은 자기 것을 표현하는 사람에게 기회를 줍니다.'
      },
      {
        name: '패턴 3 · 과부하 Ne 폭발',
        desc: '극도의 스트레스 상황에서 갑자기 충동적인 결정을 내리거나 산만해집니다. 평소와 전혀 다른 모습에 스스로도 당황해요.',
        insight: '억압된 Ne가 날것으로 나오는 것입니다. 평소 작은 실험을 통해 Ne를 의식적으로 개발하면 이것이 줄어듭니다.'
      },
      {
        name: '패턴 4 · 기회 놓치기',
        desc: '"그건 위험할 것 같아서" 라는 이유로 좋은 기회를 놓친 경험들이 있습니다. 나중에 "그때 했으면 어땠을까"라는 아쉬움이 남아요.',
        insight: '리스크 평가는 Si의 강점입니다. 하지만 Ne가 없으면 가능성 자체를 못 봅니다.'
      }
    ],
    rx_action: [
      {
        step: '복용 1단계 · 인식 (1~2주)',
        title: '"나는 언제 Ne가 필요한가" 알아차리기',
        actions: [
          '"하던 대로"를 선택할 때, 잠깐 멈추고 다른 방법 하나만 떠올려보기',
          '오늘 내가 한 것 중 "새로운 시도" 하나를 찾아 적기',
          '"변화가 두려운 이유"를 판단 없이 적어보기',
        ]
      },
      {
        step: '복용 2단계 · 실험 (3~4주)',
        title: '"작은 변화" 근육 키우기',
        actions: [
          '매주 하나의 "아주 작은 새로운 시도" — 다른 길로 출근, 새 메뉴 주문',
          '아이디어를 떠올렸을 때 바로 버리지 말고 적어두기만 하기',
          '누군가에게 "이런 생각도 해봤어"라고 말해보기',
        ]
      },
      {
        step: '복용 3단계 · 통합 (2개월+)',
        title: 'Si + Ne 시너지: 안정적 혁신',
        actions: [
          '"검증된 것 + 새로운 것" 조합 프로젝트 설계하기',
          '월 1회 의도적으로 새로운 환경에 노출하기',
          '자신의 헌신을 소리내어 표현하는 연습 — 자기 어필 루틴',
        ]
      }
    ],
    community: '핫마트 클럽 STEADY 그룹에서 같은 유형의 변화 실험, Ne 통합 여정, 자기표현 연습을 함께 나누세요.',
    hotmart: 'https://go.hotmart.com/E104716942R',
  },
  {
    id: 'PLAYER',
    emoji: '🎯',
    title: '활동가 · 현재의 불꽃',
    mbti: 'ESFP · ESTP',
    main: 'Se (외향적 감각)',
    inferior: 'Ni (내향적 직관)',
    praise: [
      '"넌 에너지가 넘쳐. 있으면 분위기가 달라져."',
      '"순발력이 대단해. 그 상황에서 어떻게 그렇게 했어?"',
      '"현실 감각이 최고야. 현장에서 강하다."',
    ],
    sting: [
      '"왜 그렇게 충동적이야? 생각 좀 하고 행동해."',
      '"나중을 생각 안 하니? 미래 준비가 없잖아."',
      '"계획 없이 사냐?"',
    ],
    poten_core: '아직 안 깨어난 포텐: 지속 가능한 영향력 (Ni 통합)',
    poten_desc: '당신의 현재 순간 에너지는 독보적입니다. 여기에 Ni(내향적 직관)의 패턴 인식과 장기 비전이 더해지면 — 지금의 화려함이 지속되는 레거시가 됩니다.',
    rx_intro: 'Se(외향적 감각)가 강한 당신은 지금 이 순간을 가장 잘 삽니다. 문제는 Ni(내향적 직관) — 패턴 인식, 미래 예측, 장기 전략 — 이 영역이 그림자예요.',
    patterns: [
      {
        name: '패턴 1 · 현재 소비 사이클',
        desc: '지금 잘 되고 있는데 왜 미래 걱정을 해야 하지? 라는 생각이 반복됩니다. 결과적으로 좋은 시기에 다음을 준비하지 못해요.',
        insight: 'Se는 현재를 최적화합니다. 하지만 Ni 없이는 패턴을 못 봅니다. 같은 사이클이 반복되는 이유입니다.'
      },
      {
        name: '패턴 2 · 관계의 휘발성',
        desc: '강렬하게 연결되었다가 흥미가 식으면 자연스럽게 멀어집니다. 장기적인 관계 유지가 어렵고, 상대방이 상처를 받기도 해요.',
        insight: 'Ni를 통합하면 "이 관계가 어떤 방향으로 가고 있는가"를 볼 수 있게 됩니다.'
      },
      {
        name: '패턴 3 · 성과의 단기성',
        desc: '빠르게 성과를 만들지만 유지가 어렵습니다. "나는 왜 계속 재시작하는 느낌이지?"라는 질문이 반복돼요.',
        insight: '이것이 Ni 없는 Se의 한계입니다. 지속 가능한 구조를 설계하는 능력이 Ni에서 옵니다.'
      },
      {
        name: '패턴 4 · 과부하 Ni 공포',
        desc: '극도의 스트레스에서 갑자기 "다 망할 것 같은" 극단적인 불안이 찾아옵니다. 근거 없는 최악의 시나리오가 머릿속에 가득 차요.',
        insight: '억압된 Ni가 왜곡된 형태로 나오는 것입니다. 의식적 Ni 개발로 불안이 인사이트로 전환됩니다.'
      }
    ],
    rx_action: [
      {
        step: '복용 1단계 · 인식 (1~2주)',
        title: '"나는 언제 Ni가 필요한가" 알아차리기',
        actions: [
          '주 1회: 지난 3개월의 패턴 돌아보기 — 반복되는 게 있는가?',
          '"5년 뒤 나는 어디 있을까?" 질문을 5분만 생각해보기',
          '불안이 올 때 "이게 근거 있는 것인가, Ni 그림자인가" 구분해보기',
        ]
      },
      {
        step: '복용 2단계 · 실험 (3~4주)',
        title: '"패턴 보기" 근육 키우기',
        actions: [
          '현재 프로젝트 하나를 "90일 버전"으로 설계해보기',
          '중요한 결정 전 24시간 기다리기 연습',
          '"이 행동이 1년 뒤 나에게 어떤 영향인가?" 질문 습관 만들기',
        ]
      },
      {
        step: '복용 3단계 · 통합 (2개월+)',
        title: 'Se + Ni 시너지: 현재의 힘 + 미래의 설계',
        actions: [
          '연간 전략 1페이지 — 현재 강점을 미래로 연결하는 지도',
          '멘토 관계 구축 — Ni가 강한 사람에게 배우기',
          '분기별 회고 루틴 — 패턴 발견 + 방향 조정',
        ]
      }
    ],
    community: '핫마트 클럽 PLAYER 그룹에서 같은 유형의 지속 가능한 성과 설계, Ni 통합 사례를 함께 나누세요.',
    hotmart: 'https://go.hotmart.com/I104717428N',
  },
  {
    id: 'HARMONY',
    emoji: '🌊',
    title: '조화자 · 따뜻한 연결',
    mbti: 'ESFJ · ENFJ',
    main: 'Fe (외향적 감정)',
    inferior: 'Ti (내향적 사고)',
    praise: [
      '"넌 정말 따뜻해. 네가 있으면 분위기가 좋아져."',
      '"공감 능력이 대단해. 사람 마음을 잘 알아."',
      '"모두를 챙기는 네가 정말 대단해."',
    ],
    sting: [
      '"왜 남 신경을 그렇게 써? 네 것도 못 챙기면서."',
      '"너무 감정적으로 판단하는 거 아니야?"',
      '"냉정하게 볼 줄도 알아야 해."',
    ],
    poten_core: '아직 안 깨어난 포텐: 내면의 중심 (Ti 통합)',
    poten_desc: '당신의 공감과 연결 능력은 탁월합니다. 여기에 Ti(내향적 사고)의 내면 기준과 논리적 자기 중심이 더해지면 — 모두를 챙기면서도 자신을 잃지 않는 진정한 리더가 됩니다.',
    rx_intro: 'Fe(외향적 감정)가 강한 당신은 타인의 감정과 조화를 최우선으로 합니다. 문제는 Ti(내향적 사고) — 내면의 논리적 기준, 자기 중심, 객관적 판단 — 이 영역이 그림자예요.',
    patterns: [
      {
        name: '패턴 1 · 자기 소멸의 친절',
        desc: '"싫다"고 말하지 못하는 패턴이 반복됩니다. 모두의 기대에 맞추다 보면 어느 순간 내가 뭘 원하는지 모르게 돼요.',
        insight: 'Fe는 조화를 위해 자신을 조정합니다. 하지만 Ti 없이는 "나는 어디 있는가?"라는 중심이 사라집니다.'
      },
      {
        name: '패턴 2 · 감사의 굶주림',
        desc: '다 챙겨줬는데 아무도 나를 챙겨주지 않는 느낌. "내가 이렇게 했는데 왜?"라는 서운함이 쌓입니다.',
        insight: '타인을 돕는 것과 자신을 채우는 것은 다른 에너지원입니다. Ti가 이 균형을 잡아줍니다.'
      },
      {
        name: '패턴 3 · 갈등 회피',
        desc: '어색한 분위기가 싫어서 필요한 말을 못 합니다. 관계를 유지하기 위해 중요한 진실을 삼킵니다.',
        insight: '진정한 관계는 어색함을 견디는 솔직함에서 만들어집니다. Ti를 통합하면 이것이 가능해집니다.'
      },
      {
        name: '패턴 4 · 과부하 Ti 폭발',
        desc: '극도의 스트레스에서 갑자기 냉소적이고 날카로운 비판이 튀어나옵니다. 평소의 따뜻한 HARMONY가 아닌 것 같아요.',
        insight: '억압된 Ti가 왜곡된 형태로 나오는 것입니다. 의식적으로 자기 의견을 표현하면 이것이 줄어듭니다.'
      }
    ],
    rx_action: [
      {
        step: '복용 1단계 · 인식 (1~2주)',
        title: '"나는 언제 Ti가 필요한가" 알아차리기',
        actions: [
          '"나는 이것을 원한다/원하지 않는다"를 매일 하나씩 적기',
          '"싫다"고 말하고 싶었지만 말하지 못한 순간 기록하기',
          '오늘 내가 나를 위해 한 것 하나 찾아보기',
        ]
      },
      {
        step: '복용 2단계 · 실험 (3~4주)',
        title: '"자기 기준" 세우기',
        actions: [
          '작은 요청에 "잠깐만요, 생각해볼게요"라고 대답하는 연습',
          '한 주에 하나 — 나를 위한 시간 의도적으로 확보하기',
          '"나는 왜 이것이 옳다고 생각하는가"를 논리적으로 써보기',
        ]
      },
      {
        step: '복용 3단계 · 통합 (2개월+)',
        title: 'Fe + Ti 시너지: 진심 어린 리더십',
        actions: [
          '"나의 경계선" 문서화 — 내가 할 수 있는 것과 없는 것 명확히',
          '월 1회 솔직한 피드백을 주는 연습',
          '자기 돌봄 루틴 의무화 — 비워야 채울 수 있다',
        ]
      }
    ],
    community: '핫마트 클럽 HARMONY 그룹에서 같은 유형의 자기 중심 찾기, Ti 통합, 경계선 설정 사례를 함께 나누세요.',
    hotmart: 'https://go.hotmart.com/I104717484Y',
  },
  {
    id: 'SOUL',
    emoji: '🌙',
    title: '탐구자 · 내면의 깊이',
    mbti: 'INFP · ISFP',
    main: 'Fi (내향적 감정)',
    inferior: 'Te (외향적 사고)',
    praise: [
      '"너랑 얘기하면 뭔가 다르게 보여. 감수성이 대단해."',
      '"진짜 나를 이해해주는 사람이 너밖에 없어."',
      '"넌 가치관이 확실해. 자기 것이 있어."',
    ],
    sting: [
      '"왜 그렇게 예민해? 별것도 아닌 걸로 상처받아."',
      '"현실적으로 생각해. 이상만으로는 안 돼."',
      '"결과를 내야 하잖아. 감성만으로는 안 되지."',
    ],
    poten_core: '아직 안 깨어난 포텐: 가치를 현실로 (Te 통합)',
    poten_desc: '당신의 깊은 내면과 가치관은 세상에서 가장 진실합니다. 여기에 Te(외향적 사고)의 실행력과 구조가 더해지면 — 당신의 가치가 실제 세상에 닿는 영향력이 됩니다.',
    rx_intro: 'Fi(내향적 감정)가 강한 당신은 내면의 가치와 진정성을 최우선으로 합니다. 문제는 Te(외향적 사고) — 효율적 실행, 객관적 구조, 결과 측정 — 이 영역이 그림자예요.',
    patterns: [
      {
        name: '패턴 1 · 깊이의 비가시성',
        desc: '내면에 가진 것은 많은데 세상에 보이지 않습니다. "나의 진짜 모습을 아무도 몰라"라는 외로움이 반복돼요.',
        insight: 'Fi는 내면을 정제합니다. 하지만 Te 없이는 그것을 세상에 전달하는 구조가 없습니다.'
      },
      {
        name: '패턴 2 · 실행 공포',
        desc: '"시작했다가 실패하면 내 가치관이 틀린 게 될 것 같아서" 시작을 미룹니다. 완벽한 준비를 기다리다가 기회가 지나가요.',
        insight: 'Te를 통합하면 "실행은 가치관의 적이 아니라 증거"라는 것을 알게 됩니다.'
      },
      {
        name: '패턴 3 · 인정과 이상의 충돌',
        desc: '세상이 원하는 방식으로 하면 자신을 잃는 것 같습니다. "돈을 위해 나를 팔고 싶지 않아"라는 저항이 성장을 막기도 해요.',
        insight: '자신의 가치관으로 돈을 버는 구조를 설계하는 것이 Te 통합의 핵심입니다.'
      },
      {
        name: '패턴 4 · 과부하 Te 폭발',
        desc: '극도의 스트레스에서 갑자기 지나치게 비판적이고 결과 중심적으로 변합니다. "다 쓸모없어"라는 식의 냉소가 튀어나옵니다.',
        insight: '억압된 Te가 왜곡된 형태로 나오는 것입니다. 의식적 Te 개발로 에너지를 전환하세요.'
      }
    ],
    rx_action: [
      {
        step: '복용 1단계 · 인식 (1~2주)',
        title: '"나는 언제 Te가 필요한가" 알아차리기',
        actions: [
          '오늘 내가 한 것 중 "결과"가 있는 것 하나 찾아보기',
          '"실행이 두려운 이유"를 판단 없이 적어보기',
          '작은 것 하나를 "완성"해서 눈에 보이게 만들기',
        ]
      },
      {
        step: '복용 2단계 · 실험 (3~4주)',
        title: '"가치를 구조로" 연결하기',
        actions: [
          '나의 가치관을 담은 작은 프로젝트 하나 설계하기 (혼자 완성 가능한 규모)',
          '결과를 측정하는 지표 하나 만들기 — 숫자, 피드백, 반응',
          '"이 가치관으로 수익화하면 어떻게 될까?" 5분 브레인스토밍',
        ]
      },
      {
        step: '복용 3단계 · 통합 (2개월+)',
        title: 'Fi + Te 시너지: 가치 기반 실행력',
        actions: [
          '가치관 선언문 + 90일 실행 계획 연결하기',
          '월 1회 외부에 나의 작업 공개 (SNS, 블로그, 전시 등)',
          '수익 구조 설계 — 나의 깊이를 세상이 원하는 형태로',
        ]
      }
    ],
    community: '핫마트 클럽 SOUL 그룹에서 같은 유형의 가치 기반 실행, Te 통합, 비가시성 극복 사례를 함께 나누세요.',
    hotmart: 'https://go.hotmart.com/U104717553C',
  },
  {
    id: 'LOGIC',
    emoji: '🔬',
    title: '분석가 · 날카로운 정밀',
    mbti: 'ISTP · INTP',
    main: 'Ti (내향적 사고)',
    inferior: 'Fe (외향적 감정)',
    praise: [
      '"네 분석은 정확해. 어떻게 그렇게 명확하게 볼 수 있어?"',
      '"논리적이야. 감정에 흔들리지 않고 냉정하게 판단해."',
      '"문제 해결 능력이 대단해. 복잡한 걸 단순하게 만들어."',
    ],
    sting: [
      '"왜 그렇게 차가워? 감정이 없어?"',
      '"좀 따뜻하게 말하면 안 돼?"',
      '"넌 왜 맨날 따지고 들어? 그냥 하면 안 돼?"',
    ],
    poten_core: '아직 안 깨어난 포텐: 연결과 영향력 (Fe 통합)',
    poten_desc: '당신의 분석과 논리는 세상에서 가장 정확합니다. 여기에 Fe(외향적 감정)의 공감과 연결이 더해지면 — 당신의 통찰이 사람들을 움직이는 힘이 됩니다.',
    rx_intro: 'Ti(내향적 사고)가 강한 당신은 논리와 정확성이 최우선입니다. 문제는 Fe(외향적 감정) — 공감, 관계의 감정적 연결, 사회적 조화 — 이 영역이 그림자예요.',
    patterns: [
      {
        name: '패턴 1 · 정확함의 고독',
        desc: '"그건 틀렸어"라고 말했는데 상대가 상처를 받습니다. 사실을 말했을 뿐인데 관계가 어색해지는 경험이 반복됩니다.',
        insight: '정확함은 Ti의 선물입니다. 하지만 Fe 없이는 정확함이 관계를 단절시킵니다.'
      },
      {
        name: '패턴 2 · 보이지 않는 감정',
        desc: '감정이 없는 것처럼 보이지만, 내면에서는 많은 것을 느낍니다. 표현하지 않아서 주변이 모를 뿐이에요.',
        insight: 'Fe를 통합하면 내면의 감정이 연결의 언어로 외부로 흘러나옵니다.'
      },
      {
        name: '패턴 3 · 팀 안에서의 마찰',
        desc: '혼자 하면 훌륭한데 팀 안에서 마찰이 생깁니다. "왜 이렇게 비효율적으로 하는 거지?"라는 내면의 답답함이 표정과 태도로 새어나와요.',
        insight: 'Fe를 통합하면 팀의 감정적 리듬을 읽고, 효율을 해치지 않으면서 연결하는 방식을 찾게 됩니다.'
      },
      {
        name: '패턴 4 · 과부하 Fe 폭발',
        desc: '극도의 스트레스에서 갑자기 감정적으로 격해지거나, 지나치게 타인의 감정에 집착합니다.',
        insight: '억압된 Fe가 왜곡된 형태로 나오는 것입니다. 의식적 공감 연습이 이것을 막습니다.'
      }
    ],
    rx_action: [
      {
        step: '복용 1단계 · 인식 (1~2주)',
        title: '"나는 언제 Fe가 필요한가" 알아차리기',
        actions: [
          '하루 끝에 오늘 가장 중요했던 대화 하나에서 "상대는 어떤 감정이었을까?" 생각해보기',
          '"논리적으로 맞지만 말하지 않은 것"과 "말했지만 관계가 어색해진 것" 기록하기',
          '오늘 누군가에게 감사나 인정을 표현할 기회가 있었는지 돌아보기',
        ]
      },
      {
        step: '복용 2단계 · 실험 (3~4주)',
        title: '"공감 언어" 근육 키우기',
        actions: [
          '피드백 전에 "이해해, 네 말은..." 한 문장 먼저 말하는 연습',
          '주 1회: 논리 없이 감사 표현만 하기 ("고마워, 이유 없이")',
          '갈등 상황에서 "네가 맞아" 대신 "그런 느낌이었구나" 연습',
        ]
      },
      {
        step: '복용 3단계 · 통합 (2개월+)',
        title: 'Ti + Fe 시너지: 영향력 있는 정밀함',
        actions: [
          '내 분석을 "이야기"로 전달하는 연습 — 데이터 + 사람 사례',
          '팀/관계에서 정기적으로 "어떻게 느껴?"를 먼저 묻는 루틴',
          '나의 감정을 일기로 쓰는 습관 — Fe를 내면에서 먼저 키우기',
        ]
      }
    ],
    community: '핫마트 클럽 LOGIC 그룹에서 같은 유형의 공감 연습, Fe 통합, 관계 마찰 극복 사례를 함께 나누세요.',
    hotmart: 'https://go.hotmart.com/U104717592I',
  },
  {
    id: 'LEADER',
    emoji: '👑',
    title: '실행자 · 결과의 힘',
    mbti: 'ESTJ · ENTJ',
    main: 'Te (외향적 사고)',
    inferior: 'Fi (내향적 감정)',
    praise: [
      '"넌 실행력이 달라. 말만 하는 사람들이랑 달리 해내잖아."',
      '"리더십이 있어. 사람들이 자연스럽게 따르잖아."',
      '"결과로 증명하는 스타일이야. 믿을 수 있어."',
    ],
    sting: [
      '"왜 그렇게 고집이 세? 다 네 맘대로 하려고 해."',
      '"좀 유연하게 생각해봐."',
      '"결과만 중요하니? 과정에서 사람들이 힘들잖아."',
    ],
    poten_core: '아직 안 깨어난 포텐: 내면의 나침반 (Fi 통합)',
    poten_desc: '당신의 실행력과 결과는 독보적입니다. 여기에 Fi(내향적 감정)의 내면 가치와 진정성이 더해지면 — 결과를 내면서도 사람들이 따르고 싶은 리더가 됩니다.',
    rx_intro: 'Te(외향적 사고)가 강한 당신은 효율, 결과, 구조가 최우선입니다. 문제는 Fi(내향적 감정) — 내면의 가치, 자신의 감정, 타인의 개인적 의미 — 이 영역이 그림자예요.',
    patterns: [
      {
        name: '패턴 1 · 성취의 공허함',
        desc: '목표를 달성했는데 기쁘지 않습니다. "이걸 위해 이렇게 달렸는데?" 라는 공허함이 옵니다.',
        insight: 'Te는 목표를 향해 달립니다. 하지만 Fi 없이는 "왜 이것을 원하는가"라는 내면의 의미가 없습니다.'
      },
      {
        name: '패턴 2 · 관계의 도구화',
        desc: '의식하지 못하는 사이에 사람을 역할로 봅니다. 인간관계보다 성과 관계가 됩니다. 가까운 사람들이 "나를 수단으로 보는 것 같아"라고 느낍니다.',
        insight: 'Fi를 통합하면 사람의 내면을 보는 눈이 열립니다. 관계가 달라집니다.'
      },
      {
        name: '패턴 3 · 자기 감정 무시',
        desc: '"감정은 약함이야"라는 믿음이 있습니다. 지쳐도 멈추지 않다가 어느 순간 폭발하거나 번아웃이 옵니다.',
        insight: '감정은 약함이 아닙니다. 자기 내면의 상태를 알려주는 신호입니다. Fi가 이것을 읽는 능력을 줍니다.'
      },
      {
        name: '패턴 4 · 과부하 Fi 폭발',
        desc: '극도의 스트레스에서 갑자기 극도로 예민해지거나 자기비판에 빠집니다. "나는 왜 이런 사람이지?"라는 내면의 공격이 옵니다.',
        insight: '억압된 Fi가 왜곡된 형태로 나오는 것입니다. 의식적 Fi 개발로 번아웃 전에 신호를 읽으세요.'
      }
    ],
    rx_action: [
      {
        step: '복용 1단계 · 인식 (1~2주)',
        title: '"나는 언제 Fi가 필요한가" 알아차리기',
        actions: [
          '하루 끝에 "오늘 나는 어떤 감정이었나?" 단어 하나로 표현해보기',
          '"이 목표가 나에게 진짜 의미 있는가?" 질문을 하나의 프로젝트에 적용해보기',
          '가장 가까운 사람 한 명에게 "요즘 어때?"를 결과 없이 묻기',
        ]
      },
      {
        step: '복용 2단계 · 실험 (3~4주)',
        title: '"나만의 의미" 찾기',
        actions: [
          '"돈, 성과, 지위 없이 해도 하고 싶은 것"이 있는가 써보기',
          '주 1회: 결과 없는 대화 — 그냥 같이 있기',
          '번아웃 전 신호 목록 만들기 — 내 몸과 감정이 보내는 경고',
        ]
      },
      {
        step: '복용 3단계 · 통합 (2개월+)',
        title: 'Te + Fi 시너지: 의미 있는 실행력',
        actions: [
          '"나의 가치관 선언문" — 결과 너머의 이유 문서화',
          '분기별 내면 점검 — 번아웃 없이 지속 가능한가?',
          '리더십 재정의 — 결과를 내면서 사람들의 내면도 보는 방식',
        ]
      }
    ],
    community: '핫마트 클럽 LEADER 그룹에서 같은 유형의 의미 찾기, Fi 통합, 번아웃 예방 사례를 함께 나누세요.',
    hotmart: 'https://go.hotmart.com/U104717647A',
  }
];

// ── 헬퍼 함수 ────────────────────────────────────────────────

function gold(text, size = 24, bold = true) {
  return new TextRun({ text, color: C.GOLD, size, bold, font: 'Apple SD Gothic Neo' });
}
function white(text, size = 24, bold = false) {
  return new TextRun({ text, color: C.WHITE, size, bold, font: 'Apple SD Gothic Neo' });
}
function silver(text, size = 22, bold = false) {
  return new TextRun({ text, color: C.SILVER, size, bold, font: 'Apple SD Gothic Neo' });
}
function dark(text, size = 22, bold = false) {
  return new TextRun({ text, color: '333333', size, bold, font: 'Apple SD Gothic Neo' });
}

function spacer(n = 1) {
  return Array.from({ length: n }, () =>
    new Paragraph({ children: [new TextRun({ text: '', size: 20 })] })
  );
}

function sectionHeader(label, title) {
  return [
    ...spacer(1),
    new Paragraph({
      children: [gold(label, 20, true)],
      spacing: { before: 300, after: 60 }
    }),
    new Paragraph({
      children: [new TextRun({ text: title, color: C.DARK, size: 30, bold: true, font: 'Apple SD Gothic Neo' })],
      spacing: { before: 0, after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.GOLD } }
    }),
  ];
}

function quoteBox(text, bgColor = 'F0EBE0') {
  const border = { style: BorderStyle.SINGLE, size: 2, color: C.GOLD };
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows: [new TableRow({
      children: [new TableCell({
        borders: { top: border, bottom: border, left: border, right: border },
        shading: { fill: bgColor, type: ShadingType.CLEAR },
        margins: { top: 160, bottom: 160, left: 240, right: 240 },
        children: [new Paragraph({
          children: [new TextRun({ text, color: '333333', size: 22, italics: true, font: 'Apple SD Gothic Neo' })],
          alignment: AlignmentType.LEFT,
        })]
      })]
    })]
  });
}

function twoColTable(leftTitle, leftItems, rightTitle, rightItems, leftColor = 'FFF8EE', rightColor = 'F0F4F8') {
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' };
  const borders = { top: border, bottom: border, left: border, right: border };
  const w = 4400;

  const makeCell = (title, items, bg) => new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 160, bottom: 160, left: 200, right: 200 },
    children: [
      new Paragraph({ children: [new TextRun({ text: title, color: C.GOLD, size: 22, bold: true, font: 'Apple SD Gothic Neo' })], spacing: { after: 100 } }),
      ...items.map(item => new Paragraph({
        children: [new TextRun({ text: `• ${item}`, color: '333333', size: 20, font: 'Apple SD Gothic Neo' })],
        spacing: { after: 60 }
      }))
    ]
  });

  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [w, 226, w],
    rows: [new TableRow({
      children: [
        makeCell(leftTitle, leftItems, leftColor),
        new TableCell({
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          width: { size: 226, type: WidthType.DXA },
          children: [new Paragraph({ children: [] })]
        }),
        makeCell(rightTitle, rightItems, rightColor),
      ]
    })]
  });
}

function stepBox(step, title, actions) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' };
  const borders = { top: border, bottom: border, left: border, right: border };
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows: [new TableRow({
      children: [new TableCell({
        borders,
        shading: { fill: 'F7F7F7', type: ShadingType.CLEAR },
        margins: { top: 160, bottom: 160, left: 240, right: 240 },
        children: [
          new Paragraph({ children: [new TextRun({ text: step, color: C.GOLD, size: 20, bold: true, font: 'Apple SD Gothic Neo' })], spacing: { after: 60 } }),
          new Paragraph({ children: [new TextRun({ text: title, color: C.DARK, size: 24, bold: true, font: 'Apple SD Gothic Neo' })], spacing: { after: 120 } }),
          ...actions.map(a => new Paragraph({
            children: [new TextRun({ text: `✓  ${a}`, color: '333333', size: 21, font: 'Apple SD Gothic Neo' })],
            spacing: { after: 80 },
            indent: { left: 200 }
          }))
        ]
      })]
    })]
  });
}

function patternBox(name, desc, insight) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'E0D0B0' };
  const borders = { top: border, bottom: border, left: border, right: border };
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows: [new TableRow({
      children: [new TableCell({
        borders,
        shading: { fill: 'FDFAF4', type: ShadingType.CLEAR },
        margins: { top: 160, bottom: 160, left: 240, right: 240 },
        children: [
          new Paragraph({ children: [new TextRun({ text: name, color: C.GOLD, size: 22, bold: true, font: 'Apple SD Gothic Neo' })], spacing: { after: 80 } }),
          new Paragraph({ children: [new TextRun({ text: desc, color: '333333', size: 21, font: 'Apple SD Gothic Neo' })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: `💡  ${insight}`, color: '555555', size: 20, italics: true, font: 'Apple SD Gothic Neo' })], spacing: { after: 0 } }),
        ]
      })]
    })]
  });
}

// ── 리포트 생성 함수 ─────────────────────────────────────────

function buildReport(t) {
  const children = [

    // ── 커버 ──────────────────────────────────────
    new Paragraph({
      children: [new TextRun({ text: 'SHADOWGRAM', color: C.GOLD, size: 28, bold: true, font: 'Apple SD Gothic Neo', characterSpacing: 200 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 80 }
    }),
    new Paragraph({
      children: [new TextRun({ text: '포텐 개발 가이드', color: C.DARK, size: 22, font: 'Apple SD Gothic Neo' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 }
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Shadowgram Self · shadowgram.org', color: C.SILVER, size: 18, font: 'Apple SD Gothic Neo' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 400 }
    }),

    // 유형 타이틀 박스
    (() => {
      const border = { style: BorderStyle.SINGLE, size: 3, color: C.GOLD };
      return new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [9026],
        rows: [new TableRow({
          children: [new TableCell({
            borders: { top: border, bottom: border, left: border, right: border },
            shading: { fill: C.DARK, type: ShadingType.CLEAR },
            margins: { top: 240, bottom: 240, left: 400, right: 400 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({ children: [new TextRun({ text: `${t.emoji}  ${t.id}`, color: C.GOLD, size: 48, bold: true, font: 'Apple SD Gothic Neo' })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
              new Paragraph({ children: [new TextRun({ text: t.title, color: C.WHITE, size: 26, font: 'Apple SD Gothic Neo' })], alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
              new Paragraph({ children: [new TextRun({ text: `${t.main}  ·  열등기능 ${t.inferior}`, color: C.SILVER, size: 20, font: 'Apple SD Gothic Neo' })], alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
              new Paragraph({ children: [new TextRun({ text: `MBTI® 대응: ${t.mbti}`, color: C.SILVER, size: 18, font: 'Apple SD Gothic Neo' })], alignment: AlignmentType.CENTER }),
            ]
          })]
        })]
      });
    })(),

    ...spacer(1),
    new Paragraph({
      children: [new TextRun({ text: '* MBTI® is a registered trademark of The Myers & Briggs Foundation. Shadowgram은 독자적 프레임워크로, The Myers & Briggs Foundation과 무관합니다.', color: C.SILVER, size: 16, font: 'Apple SD Gothic Neo' })],
      spacing: { before: 60, after: 400 }
    }),

    // ── 진단 ──────────────────────────────────────
    ...sectionHeader('STEP 1 · 진단', '당신이 들어온 말들'),
    new Paragraph({
      children: [new TextRun({ text: '이 말, 들어본 적 있나요?', color: C.DARK, size: 24, bold: true, font: 'Apple SD Gothic Neo' })],
      spacing: { before: 0, after: 120 }
    }),

    twoColTable(
      '✦ 칭찬 — 들은 말',
      t.praise,
      '✦ 찔림 — 이 말도 들었죠?',
      t.sting,
      'FFF8EE',
      'F0F4F8'
    ),

    ...spacer(1),
    quoteBox(`이 두 가지 말이 모두 당신에 대한 이야기입니다.\n칭찬받은 그 능력과, 비판받은 그 패턴 — 둘 다 같은 뿌리에서 옵니다.\n그것이 아직 안 깨어난 당신의 포텐입니다.`),

    ...spacer(1),
    (() => {
      const border = { style: BorderStyle.SINGLE, size: 2, color: C.GOLD };
      return new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [9026],
        rows: [new TableRow({
          children: [new TableCell({
            borders: { top: border, bottom: border, left: border, right: border },
            shading: { fill: 'FFF8EE', type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 240, right: 240 },
            children: [
              new Paragraph({ children: [new TextRun({ text: t.poten_core, color: C.GOLD, size: 24, bold: true, font: 'Apple SD Gothic Neo' })], spacing: { after: 100 } }),
              new Paragraph({ children: [new TextRun({ text: t.poten_desc, color: '333333', size: 21, font: 'Apple SD Gothic Neo' })], spacing: { after: 0 } }),
            ]
          })]
        })]
      });
    })(),

    // ── 처방전 ────────────────────────────────────
    new Paragraph({ children: [new PageBreak()] }),
    ...sectionHeader('STEP 2 · 처방전', '왜 이 패턴이 반복되는가'),
    new Paragraph({
      children: [new TextRun({ text: t.rx_intro, color: '333333', size: 21, font: 'Apple SD Gothic Neo' })],
      spacing: { before: 0, after: 240 }
    }),

    ...t.patterns.flatMap((p, i) => [
      patternBox(p.name, p.desc, p.insight),
      ...spacer(1),
    ]),

    // ── 복용법 ────────────────────────────────────
    new Paragraph({ children: [new PageBreak()] }),
    ...sectionHeader('STEP 3 · 복용법', '실제로 어떻게 개발하는가'),
    new Paragraph({
      children: [new TextRun({ text: '3단계 통합 프로그램', color: C.DARK, size: 24, bold: true, font: 'Apple SD Gothic Neo' })],
      spacing: { before: 0, after: 60 }
    }),
    new Paragraph({
      children: [new TextRun({ text: '아는 것으로 끝나지 않습니다. 반복하고, 실험하고, 통합할 때 포텐이 깨어납니다.', color: C.SILVER, size: 21, font: 'Apple SD Gothic Neo' })],
      spacing: { before: 0, after: 240 }
    }),

    ...t.rx_action.flatMap((s) => [
      stepBox(s.step, s.title, s.actions),
      ...spacer(1),
    ]),

    // 커뮤니티 섹션
    ...spacer(1),
    (() => {
      const border = { style: BorderStyle.SINGLE, size: 2, color: '4A7B9D' };
      return new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [9026],
        rows: [new TableRow({
          children: [new TableCell({
            borders: { top: border, bottom: border, left: border, right: border },
            shading: { fill: 'EEF4FA', type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 240, right: 240 },
            children: [
              new Paragraph({ children: [new TextRun({ text: '🌱  복용 커뮤니티 (핫마트 클럽)', color: '4A7B9D', size: 22, bold: true, font: 'Apple SD Gothic Neo' })], spacing: { after: 80 } }),
              new Paragraph({ children: [new TextRun({ text: t.community, color: '333333', size: 21, font: 'Apple SD Gothic Neo' })], spacing: { after: 100 } }),
              new Paragraph({ children: [new TextRun({ text: `리포트 완전판 →  ${t.hotmart}`, color: '4A7B9D', size: 20, font: 'Apple SD Gothic Neo' })], spacing: { after: 0 } }),
            ]
          })]
        })]
      });
    })(),

    // ── 클로저 ────────────────────────────────────
    ...spacer(2),
    new Paragraph({
      children: [new TextRun({ text: 'shadowgram.org · © 2025 Shadowgram · 구매자 본인만 사용 가능 · 재배포 금지', color: C.SILVER, size: 18, font: 'Apple SD Gothic Neo' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 0 }
    }),
  ];

  return new Document({
    styles: {
      default: {
        document: { run: { font: 'Apple SD Gothic Neo', size: 22, color: '333333' } }
      }
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [
              new TextRun({ text: 'SHADOWGRAM', color: C.GOLD, size: 16, bold: true, font: 'Apple SD Gothic Neo' }),
              new TextRun({ text: `  ·  ${t.id} 포텐 개발 가이드`, color: C.SILVER, size: 16, font: 'Apple SD Gothic Neo' }),
            ],
            border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: C.GOLD } }
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: 'shadowgram.org', color: C.SILVER, size: 16, font: 'Apple SD Gothic Neo' }),
              new TextRun({ text: '  ·  ', color: C.SILVER, size: 16 }),
              new TextRun({ children: [PageNumber.CURRENT], color: C.SILVER, size: 16, font: 'Apple SD Gothic Neo' }),
            ],
            alignment: AlignmentType.CENTER
          })]
        })
      },
      children,
    }]
  });
}

// ── 출력 ────────────────────────────────────────────────────
const outDir = './KR/포텐개발법';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const t of TYPES) {
  const doc = buildReport(t);
  const filename = path.join(outDir, `${t.id}_KR_포텐개발법.docx`);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filename, buffer);
  console.log(`✅ ${filename}`);
}

console.log('\n🎉 8유형 포텐 개발법 리포트 완성!');

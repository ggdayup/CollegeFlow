export interface MajorRankingItem {
  source: string; // 'US_NEWS' | 'QS' | 'THE'
  rankInteger: number;
  year: number;
  verificationId: string;
}

export interface MajorLink {
  id: string; // Unique inside university
  nameEn: string;
  nameZh: string;
  submajors?: string[];
  nationalMajorId?: string; // Links back to national majors from majorsData.ts for salary metrics
  degreeLevel?: 'BACHELOR' | 'MASTER' | 'DOCTORATE';
  notesEn?: string;
  notesZh?: string;
  rankings?: MajorRankingItem[];
}

export interface SchoolCategory {
  id: string;
  nameEn: string;
  nameZh: string;
  descriptionEn?: string;
  descriptionZh?: string;
  majors: MajorLink[];
}

export interface UniversitySchool {
  id: string;
  code: string; // e.g. LSA, CoE, Ross, Wharton etc.
  nameEn: string;
  nameZh: string;
  subtitleEn: string;
  subtitleZh: string;
  tagEn?: string;
  tagZh?: string;
  descriptionEn: string;
  descriptionZh: string;
  categories?: SchoolCategory[]; // For schools with nested categories (like LSA)
  majors?: MajorLink[]; // For schools with a flat list of majors
}

export interface University {
  id: string; // 'umich', 'rice'
  nameEn: string;
  nameZh: string;
  shortNameEn: string;
  shortNameZh: string;
  locationEn: string;
  locationZh: string;
  badgeEn: string;
  badgeZh: string;
  prestigeNumber: string; // e.g. '#21', '#18'
  prestigeLabelEn: string;
  prestigeLabelZh: string;
  descriptionEn: string;
  descriptionZh: string;
  keyFactEn: string;
  keyFactZh: string;
  taglineEn: string;
  taglineZh: string;
  bgColor: string; // Tailwind background gradient values
  primaryColor: string; // Tailwind solid color code for visual accents
  schools: UniversitySchool[];
  countryEn?: string;
  countryZh?: string;
  // Real rankings with years (US News 2025/2026 and QS 2025/2026)
  usNewsRank: number;
  usNewsYear: number;
  qsRank: number;
  qsYear: number;
  isGlobalRank?: boolean; // If true, indicates US News is Global instead of National
  majorRankings?: {
    standardMajorId: string;
    rankInteger: number;
    year: number;
    source: string;
    verificationId: string;
  }[];
}

export const universities: University[] = [
  {
    id: 'harvard',
    nameEn: 'Harvard University',
    nameZh: '哈佛大学',
    shortNameEn: 'Harvard',
    shortNameZh: '哈佛大学',
    locationEn: 'Cambridge, MA',
    locationZh: '马萨诸塞州 剑桥',
    badgeEn: 'Ivy League Elite',
    badgeZh: '常春藤盟校领头羊',
    prestigeNumber: '#3',
    prestigeLabelEn: 'US News National Rank',
    prestigeLabelZh: 'US News 全美排名',
    taglineEn: 'The oldest and most prestigious institution in American higher education.',
    taglineZh: '美国历史最悠久的殿堂级学府，学术声誉冠绝全球。',
    keyFactEn: 'Undergraduates enter Harvard College and choose from 49 concentrations with highly flexible liberal arts parameters.',
    keyFactZh: '本科生统一进入哈佛学院，大二春季自由声明 49 个学术方向，实行深度通识博雅教育。',
    descriptionEn: 'Harvard University is a leading research powerhouse located in Cambridge. It features top-class scientific, humanities, and social science programs with stellar resources.',
    descriptionZh: '哈佛大学作为世界学术至高点之一，汇聚了全球最领先的科研团队与丰沛资源。其本科毕业生在政商界、学术界均拥有极高的话语权与校友关系网络。',
    bgColor: 'from-[#800000] to-[#4A0000]',
    primaryColor: '#A51C30',
    usNewsRank: 3,
    usNewsYear: 2025,
    qsRank: 4,
    qsYear: 2025,
    schools: [
      {
        id: 'harvard-college',
        code: 'HC',
        nameEn: 'Harvard College of Arts & Sciences',
        nameZh: '哈佛文理学院',
        subtitleEn: 'The undergraduate core offering concentrations in humanities, social, and natural sciences.',
        subtitleZh: '哈佛本科核心学术部，涵盖生命科学、自然科学以及所有人文社科方向。',
        tagEn: 'Academic Core',
        tagZh: '学术至尊核',
        descriptionEn: 'Harvard College is the dedicated undergraduate portal, ensuring a close-knit learning community inside a massive research university.',
        descriptionZh: '哈佛学院是哈佛大学招收本科生的唯一门户，强调基于深厚人文精神、定量社会科学以及基础科学的学术根底培养。',
        majors: [
          { id: 'harv-math', nameEn: 'Mathematics', nameZh: '数学', nationalMajorId: '140' },
          { id: 'harv-econ', nameEn: 'Economics', nameZh: '经济学', nationalMajorId: '79' },
          { id: 'harv-phys', nameEn: 'Physics', nameZh: '物理学', nationalMajorId: '152' },
          { id: 'harv-stats', nameEn: 'Statistics', nameZh: '统计学与数据科学', nationalMajorId: '141' },
          { id: 'harv-afamer', nameEn: 'African and African American Studies', nameZh: '非裔与非裔美国人研究', nationalMajorId: '58' },
          { id: 'harv-anthro', nameEn: 'Anthropology', nameZh: '人类学', nationalMajorId: '77' },
          { id: 'harv-artfilm', nameEn: 'Art, Film, and Visual Studies', nameZh: '艺术、电影与视觉研究', nationalMajorId: '53' },
          { id: 'harv-astro', nameEn: 'Astrophysics', nameZh: '天体物理学', nationalMajorId: '143' },
          { id: 'harv-chemphys', nameEn: 'Chemistry and Physics', nameZh: '化学与物理学复合', nationalMajorId: '151' },
          { id: 'harv-chem', nameEn: 'Chemistry', nameZh: '化学', nationalMajorId: '145' },
          { id: 'harv-classics', nameEn: 'Classics', nameZh: '古典学', nationalMajorId: '58' },
          { id: 'harv-complit', nameEn: 'Comparative Literature', nameZh: '比较文学', nationalMajorId: '67' },
          { id: 'harv-eas', nameEn: 'East Asian Studies', nameZh: '东亚研究', nationalMajorId: '58' },
          { id: 'harv-eng', nameEn: 'English', nameZh: '英语语言与文学', nationalMajorId: '61' },
          { id: 'harv-folklore', nameEn: 'Folklore and Mythology', nameZh: '民俗与神话学', nationalMajorId: '58' },
          { id: 'harv-german', nameEn: 'Germanic Languages and Literatures', nameZh: '德语语言与文学', nationalMajorId: '62' },
          { id: 'harv-govt', nameEn: 'Government', nameZh: '政府学 (政治学)', nationalMajorId: '85' },
          { id: 'harv-history', nameEn: 'History', nameZh: '历史学', nationalMajorId: '63' },
          { id: 'harv-histlit', nameEn: 'History and Literature', nameZh: '历史与文学', nationalMajorId: '64' },
          { id: 'harv-histsci', nameEn: 'History of Science', nameZh: '科学史', nationalMajorId: '64' },
          { id: 'harv-ling', nameEn: 'Linguistics', nameZh: '语言学', nationalMajorId: '67' },
          { id: 'harv-music', nameEn: 'Music', nameZh: '音乐学', nationalMajorId: '55' },
          { id: 'harv-nes', nameEn: 'Near Eastern Languages and Civilizations', nameZh: '近东语言与文明', nationalMajorId: '58' },
          { id: 'harv-neuro', nameEn: 'Neuroscience', nameZh: '神经科学', nationalMajorId: '132' },
          { id: 'harv-phil', nameEn: 'Philosophy', nameZh: '哲学', nationalMajorId: '69' },
          { id: 'harv-phys', nameEn: 'Physics', nameZh: '物理学', nationalMajorId: '152' },
          { id: 'harv-psych', nameEn: 'Psychology', nameZh: '心理学', nationalMajorId: '75' },
          { id: 'harv-romance', nameEn: 'Romance Languages and Literatures', nameZh: '罗曼语语言与文学', nationalMajorId: '62' },
          { id: 'harv-ruseuras', nameEn: 'Russian and Eurasian Studies', nameZh: '俄罗斯与欧亚研究', nationalMajorId: '58' },
          { id: 'harv-socstudies', nameEn: 'Social Studies', nameZh: '社会研究', nationalMajorId: '82' },
          { id: 'harv-soc', nameEn: 'Sociology', nameZh: '社会学', nationalMajorId: '87' },
          { id: 'harv-southasian', nameEn: 'South Asian Studies', nameZh: '南亚研究', nationalMajorId: '58' },
          { id: 'harv-theater', nameEn: 'Theater, Dance, and Media', nameZh: '戏剧、舞蹈与媒体', nationalMajorId: '52' },
          { id: 'harv-wgs', nameEn: 'Studies of Women, Gender, and Sexuality', nameZh: '妇女、性别与性取向研究', nationalMajorId: '82' },
          { id: 'harv-ib', nameEn: 'Integrative Biology', nameZh: '整合生物学', nationalMajorId: '124' },
          { id: 'harv-mcb', nameEn: 'Molecular and Cellular Biology', nameZh: '分子与细胞生物学', nationalMajorId: '131' },
          { id: 'harv-cpb', nameEn: 'Chemical and Physical Biology', nameZh: '化学与物理生物学', nationalMajorId: '123' },
          { id: 'harv-hdrb', nameEn: 'Human Developmental and Regenerative Biology', nameZh: '人类发育与再生生物学', nationalMajorId: '130' },
          { id: 'harv-heb', nameEn: 'Human Evolutionary Biology', nameZh: '人类进化生物学', nationalMajorId: '130' },
          { id: 'harv-eps', nameEn: 'Earth and Planetary Sciences', nameZh: '地球与行星科学', nationalMajorId: '146' }
        ]
      },
      {
        id: 'harvard-seas',
        code: 'SEAS',
        nameEn: 'John A. Paulson School of Engineering and Applied Sciences',
        nameZh: '保尔森工程与应用科学学院',
        subtitleEn: 'Rapidly emerging, highly funded center for computer science and engineering majors.',
        subtitleZh: '近年来扩张迅速、资金巨万的哈佛计算机及工程硬核科学重地。',
        tagEn: 'Tech Frontiers',
        tagZh: '智能与应用前沿',
        descriptionEn: 'SEAS provides interdisciplinary, hands-on engineering programs. Undergraduates enjoy full access to modern campus facilities and industry collaborations.',
        descriptionZh: '保尔森工学院打破了传统工程生院的隔阂，提倡计算与物理应用、生物医药工程的跨界融合，配备了全球首屈一指的数字化实验室。',
        majors: [
          { id: 'harv-cs', nameEn: 'Computer Science', nameZh: '计算机科学', nationalMajorId: '138' },
          { id: 'harv-am', nameEn: 'Applied Mathematics', nameZh: '应用数学', nationalMajorId: '135' },
          { id: 'harv-bme', nameEn: 'Biomedical Engineering', nameZh: '生物医学工程', nationalMajorId: '101' },
          { id: 'harv-ee', nameEn: 'Electrical Engineering', nameZh: '电子工程', nationalMajorId: '104' },
          { id: 'harv-me', nameEn: 'Mechanical Engineering', nameZh: '机械工程', nationalMajorId: '114' },
          { id: 'harv-es', nameEn: 'Engineering Sciences', nameZh: '工程科学', nationalMajorId: '109' },
          { id: 'harv-envsci', nameEn: 'Environmental Science and Public Policy', nameZh: '环境科学与公共政策', nationalMajorId: '127' }
        ]
      }
    ]
  },
  {
    id: 'mit',
    nameEn: 'Massachusetts Institute of Technology',
    nameZh: '麻省理工学院',
    shortNameEn: 'MIT',
    shortNameZh: '麻省理工',
    locationEn: 'Cambridge, MA',
    locationZh: '马萨诸塞州 剑桥',
    badgeEn: 'Global STEM Leader',
    badgeZh: '世界理工皇冠',
    prestigeNumber: '#2',
    prestigeLabelEn: 'US News National Rank',
    prestigeLabelZh: 'US News 全美排名',
    taglineEn: 'The epic epicenter of quantitative sciences, technology, and pure innovation.',
    taglineZh: '全球硬核理工、计算机算法与尖端科技研发的绝对霸主。',
    keyFactEn: 'Undergrads follow a legendary General Institute Requirements (GIRs) in science and humanities, promoting hard skills.',
    keyFactZh: '本科生需经受极严苛的通识自然科学要求（GIRs），注重扎实且可转化为前线成果的数理逻辑。',
    descriptionEn: 'MIT is a private research university renowned for its highly quantitative focus. Each department uses Course numbers for efficient cataloging.',
    descriptionZh: '麻省理工学院常年位居QS世界大学排名第1。以超高强度的极客精神和颠覆性科学研究享誉世界，其校友主宰了大量世界前沿芯片、AI和尖端航天工业。',
    bgColor: 'from-[#8A1538] to-[#1F2937]',
    primaryColor: '#A31D1D',
    usNewsRank: 2,
    usNewsYear: 2025,
    qsRank: 1,
    qsYear: 2025,
    schools: [
      {
        id: 'mit-eng',
        code: 'Course 6/2/16',
        nameEn: 'MIT School of Engineering',
        nameZh: '麻省理工工程学院',
        subtitleEn: 'The supreme engineering school globally, producing elite hardware and software innovators.',
        subtitleZh: '全球无人能出其右的旗舰工程学部，诞生了微机电路、密码学及新型复合材料的源泉。',
        tagEn: 'Ultimate Quant',
        tagZh: '量化工程天花板',
        descriptionEn: 'Home of Computer Science (Course 6), Mechanical (Course 2), and aerospace (Course 16) sciences. Extremely intense and highly rewarding.',
        descriptionZh: '涵盖大名鼎鼎的课程6（计算机与电子工程系）。这里的代码编写、芯片封装、先进机器人学培养标准冠绝全球。',
        majors: [
          { id: 'mit-cs', nameEn: 'Computer Science (Course 6-3)', nameZh: '计算机科学', nationalMajorId: '138' },
          { id: 'mit-ee', nameEn: 'Electrical Engineering (Course 6-1)', nameZh: '电机工程', nationalMajorId: '104' },
          { id: 'mit-aero', nameEn: 'Aerospace Engineering (Course 16)', nameZh: '航空航天工程', nationalMajorId: '98' }
        ]
      },
      {
        id: 'mit-sc',
        code: 'Course 18/8/5',
        nameEn: 'MIT School of Science',
        nameZh: '麻省理工理学院',
        subtitleEn: 'Stellar academic center for theoretical and experimental natural sciences.',
        subtitleZh: '凝聚了全美最强理论物理、高等代数与基础生命科学的核心科学部。',
         tagEn: 'Theoretical Peak',
        tagZh: '理论物理与硬核代数',
        descriptionEn: 'The School of Science hosts historical labs where multiple particle discoveries and basic physical mechanisms are cataloged.',
        descriptionZh: '汇聚多位诺贝尔奖得主，其本科高维拓扑、纯数、纳米物理训练是全球顶尖学者与科学领衔人才的培育基地。',
        majors: [
          { id: 'mit-math', nameEn: 'Mathematics (Course 18)', nameZh: '纯数学/应用数学', nationalMajorId: '140' },
          { id: 'mit-physics', nameEn: 'Physics (Course 8)', nameZh: '理论物理与实验物理', nationalMajorId: '152' }
        ]
      }
    ]
  },
  {
    id: 'stanford',
    nameEn: 'Stanford University',
    nameZh: '斯坦福大学',
    shortNameEn: 'Stanford',
    shortNameZh: '斯坦福',
    locationEn: 'Stanford, CA',
    locationZh: '加州 斯坦福',
    badgeEn: 'Silicon Valley Engine',
    badgeZh: '硅谷创业精神策源地',
    prestigeNumber: '#4',
    prestigeLabelEn: 'US News National Rank',
    prestigeLabelZh: 'US News 全美排名',
    taglineEn: 'The unmatched golden incubator of tech billionaires, elite startup teams, and venture giants.',
    taglineZh: '全美科技风投、硬科技创业、顶级独角兽与卓越博雅培养的核心圣地。',
    keyFactEn: 'Frees undergraduates to declare any major late in sophomore year, highly optimized for silicon valley placements.',
    keyFactZh: '大二下学期前不设专业限制，选课机制大开大合，与北加州风投资本及计算机前沿工业丝滑连接。',
    descriptionEn: 'Stanford University combines breathtaking physical beauty with a fast-charging executive culture right next to Palo Alto.',
    descriptionZh: '坐落于硅谷核心、占地辽阔，斯坦福大学完美地将传统的常春藤级神圣学术追求同现代快速迭代的科技投融资、AI新工业革命衔接在一块。',
    bgColor: 'from-[#8C1515] to-[#7F1D1D]',
    primaryColor: '#8C1515',
    usNewsRank: 4,
    usNewsYear: 2025,
    qsRank: 6,
    qsYear: 2025,
    schools: [
      {
        id: 'stanford-eng',
        code: 'SoE',
        nameEn: 'Stanford School of Engineering',
        nameZh: '斯坦福工程学院',
        subtitleEn: 'The direct talent pipeling feeding Cupertino, Mountain View, and top startup hubs.',
        subtitleZh: '支撑硅谷技术版图的终极底座，直接面对尖端人工智能与前沿机器人实验室。',
        tagEn: 'Tech Monarch',
        tagZh: '新一代技术圣殿',
        descriptionEn: 'Pioneered computing research. Host to legendary CS pathways and cross-disciplinary symbol processing labs.',
        descriptionZh: '这里的计算机（CS）方向学生在就读期间即直接参与大量人工智能新模型的开发、自动驾驶演进、机器人智能控制的商业孵化。',
        majors: [
          { id: 'stan-cs', nameEn: 'Computer Science', nameZh: '计算机科学', nationalMajorId: '138' },
          { id: 'stan-ee', nameEn: 'Electrical Engineering', nameZh: '电子工程', nationalMajorId: '104' },
          { id: 'stan-ms', nameEn: 'Management Science & Engineering (MS&E)', nameZh: '管理科学与工程', nationalMajorId: '105' }
        ]
      },
      {
        id: 'stanford-hss',
        code: 'H&S',
        nameEn: 'School of Humanities and Sciences',
        nameZh: '人文与科学学院',
        subtitleEn: 'The expansive intellectual heartland covering statistics, economics, and creative fields.',
        subtitleZh: '斯坦福的核心文理学术大本营，汇集了全美首屈一指的数理统计与地缘公共政策系所。',
        tagEn: 'Liberal Arts Center',
        tagZh: '跨学科决策基础',
        descriptionEn: 'Hosts top-flight statistics and applied mathematics majors that feed both modern data sciences and major wall street quant houses.',
        descriptionZh: '提供极其优质的宏观经济学、量化金融分析、数理统计机制，为学生的大规模数据架构和政策分析奠定牢不可破的基础。',
        majors: [
          { id: 'stan-econ', nameEn: 'Economics', nameZh: '经济学', nationalMajorId: '79' },
          { id: 'stan-stats', nameEn: 'Mathematical & Computational Science', nameZh: '数学与计算科学', nationalMajorId: '141' }
        ]
      }
    ]
  },
  {
    id: 'berkeley',
    nameEn: 'University of California, Berkeley',
    nameZh: '加州大学伯克利分校',
    shortNameEn: 'UC Berkeley',
    shortNameZh: '加州大学伯克利',
    locationEn: 'Berkeley, CA',
    locationZh: '加州 伯克利',
    badgeEn: 'Public Ivy Flagship',
    badgeZh: '公立大学常春藤旗舰',
    prestigeNumber: '#15',
    prestigeLabelEn: 'US News National Rank',
    prestigeLabelZh: 'US News 全美排名',
    taglineEn: 'The public university jewel that rivals any private institution on earth, birth-place of Unix & open-source.',
    taglineZh: '全球最顶尖的旗舰公立高等学府，开源软件与互联网计算革命的关键主宰者。',
    keyFactEn: 'Highly selective, divided into granular colleges with intense software engineering rigor.',
    keyFactZh: '伯克利的本科在系统编程、算法设计、底层网络工程等方面的难度在全美享有威望，实行严格的专业申报门槛。',
    descriptionEn: 'UC Berkeley is historically famous for leading intellectual movements, semiconductor breakthroughs, and digital framework origins.',
    descriptionZh: '伯克利在学术史、技术革命以及硅谷的产业爆发中起到了决定性作用。这里不仅诞生了UNIX、TCP/IP网络内核及大量的元素周期表，更拥有令人敬畏的教授阵容。',
    bgColor: 'from-[#003262] to-[#3B7EA1]',
    primaryColor: '#FDB515',
    usNewsRank: 15,
    usNewsYear: 2025,
    qsRank: 12,
    qsYear: 2025,
    schools: [
      {
        id: 'ucb-eng',
        code: 'CoE',
        nameEn: 'U.C. Berkeley College of Engineering',
        nameZh: '伯克利工学院',
        subtitleEn: 'Extremely competitive and famous programs, particularly Electrical Engineering and Comp Sci (EECS).',
        subtitleZh: '录取率极低、课程挑战度极高、享誉全球的硬核工程研究重型堡垒。',
        tagEn: 'EECS Pioneer',
        tagZh: '计算机软硬件双制冠冕',
        descriptionEn: 'Consistently ranks top 2 in world engineer indexes. EECS grads are sought after globally for their strong programming, hardware layout, and quantitative logic.',
        descriptionZh: '涵盖全美顶流的EECS（电气工程与计算机科学）和工业设计方向，其训练强度极大，毕业生成为各大芯片厂与互联网巨头争抢的对象。',
        majors: [
          { id: 'ucb-eecs', nameEn: 'Electrical Engineering & Computer Sciences (EECS)', nameZh: '电子工程与计算机科学 (EECS直申)', nationalMajorId: '138' },
          { id: 'ucb-chem', nameEn: 'Chemical Engineering', nameZh: '化学工程', nationalMajorId: '102' },
          { id: 'ucb-mech', nameEn: 'Mechanical Engineering', nameZh: '机械工程', nationalMajorId: '114' }
        ]
      },
      {
        id: 'ucb-ls',
        code: 'L&S',
        nameEn: 'College of Letters and Science',
        nameZh: '文理学院',
        subtitleEn: 'The largest academic college, offering world-class math, physics, and cognitive sciences.',
        subtitleZh: '伯克利最大的生院，提供顶级的基础纯数、物理以及经济理路研培。',
        tagEn: 'Foundational Excellence',
        tagZh: '诺贝尔学者汇聚',
        descriptionEn: 'Provides liberal education. Undergraduates in L&S declare computer science (via BA tracks), economics, and statistics through custom qualification GPAs.',
        descriptionZh: '涵盖基础物理、核磁共振开发史、计量微观经济学系。鼓励学生自由选课，掌握最坚实的基础理路底气。',
        majors: [
          { id: 'ucb-math', nameEn: 'Mathematics', nameZh: '数学', nationalMajorId: '140' },
          { id: 'ucb-econ', nameEn: 'Economics', nameZh: '计量经济学', nationalMajorId: '79' },
          { id: 'ucb-physics', nameEn: 'Physics', nameZh: '物理学', nationalMajorId: '152' }
        ]
      }
    ]
  },
  {
    id: 'princeton',
    nameEn: 'Princeton University',
    nameZh: '普林斯顿大学',
    shortNameEn: 'Princeton',
    shortNameZh: '普林斯顿',
    locationEn: 'Princeton, NJ',
    locationZh: '新泽西州 普林斯顿',
    badgeEn: 'Ivy League Crown',
    badgeZh: '常春藤学术之冠',
    prestigeNumber: '#1',
    prestigeLabelEn: 'US News National Rank',
    prestigeLabelZh: 'US News 全美排名',
    taglineEn: 'The supreme ivory tower of theoretical sciences, mathematics, and exquisite undergraduate mentoring.',
    taglineZh: '全美本科声誉第一、小班私人带教、强调学术研究与毕生答辩的纯净圣殿。',
    keyFactEn: 'Requires all seniors to complete a massive mandatory Senior Thesis, fostering independent scholarship.',
    keyFactZh: '所有本科毕业生必须撰写并答辩一份高规格的独立毕业论文（Senior Thesis），培养深刻的研究与独立思辨习惯。',
    descriptionEn: 'Princeton University has held the #1 spot in US News National Universities for over a decade. It focuses deeply on undergraduate training over large vocational programs.',
    descriptionZh: '连续十余年雄踞US News全美大学排名第一，地处新泽西的优美小镇。普林斯顿极其注重本科生的纯粹学术滋养，拒绝开设大型职业学院，维持高贵的博雅教育本质。',
    bgColor: 'from-[#EE7F2D] to-[#121212]',
    primaryColor: '#FF6600',
    usNewsRank: 1,
    usNewsYear: 2025,
    qsRank: 22,
    qsYear: 2025,
    schools: [
      {
        id: 'princeton-ab',
        code: 'AB',
        nameEn: 'Princeton College AB Program',
        nameZh: '普林斯顿文学士核心学部',
        subtitleEn: 'The classic liberal arts framework, heavily research-driven for humanities and natural sciences.',
        subtitleZh: '经典的文学士博雅学术大类，全面要求教授小班讨论课，直通深度研究。',
        tagEn: 'Exquisite Mentoring',
        tagZh: '纯净博雅纯数',
        descriptionEn: 'Provides high teacher-student ratio. Undergraduates participate in Junior Projects and customized seminars starting freshman year.',
        descriptionZh: '涵盖了大名鼎鼎的纯数学、物理、地缘公共事务等标志科系。普林斯顿数学系曾诞生多位菲尔兹奖得主，其本科讨论班水平极高。',
        majors: [
          { id: 'prin-math', nameEn: 'Mathematics', nameZh: '高等数学 (Math)', nationalMajorId: '140' },
          { id: 'prin-econ', nameEn: 'Economics', nameZh: '学术经济学 (Econ)', nationalMajorId: '79' },
          { id: 'prin-pub', nameEn: 'Public & International Affairs', nameZh: '公共与国际事务 (SPIA)', nationalMajorId: '83' }
        ]
      },
      {
        id: 'princeton-eng',
        code: 'SEAS',
        nameEn: 'School of Engineering and Applied Science',
        nameZh: '工程与应用科学学院',
        subtitleEn: 'Rigorous engineering programs with deep emphasis on basic mathematical and physical limits.',
        subtitleZh: '聚焦算法逻辑、计算架构与运筹量化的硬核工程科学重地。',
        tagEn: 'Algorithmic Research',
        tagZh: '底层算法硬能',
        descriptionEn: 'Emphasizes theoretical principles over narrow manual techniques, designing software and computing systems that last generations.',
        descriptionZh: '重点推荐其计算机（CS）方向、电气工程、运筹学与金融工程（ORFE），后者是华尔街顶级高频交易和多因子量化风投的核心生源地。',
        majors: [
          { id: 'prin-cs', nameEn: 'Computer Science (BSE)', nameZh: '计算机科学 (BSE工学)', nationalMajorId: '138' },
          { id: 'prin-orfe', nameEn: 'Operations Research & Financial Engineering', nameZh: '运筹学与金融工程 (ORFE)', nationalMajorId: '141' }
        ]
      }
    ]
  },
  {
    id: 'yale',
    nameEn: 'Yale University',
    nameZh: '耶鲁大学',
    shortNameEn: 'Yale',
    shortNameZh: '耶鲁',
    locationEn: 'New Haven, CT',
    locationZh: '康涅狄格州 纽黑文',
    badgeEn: 'Prestigious Private',
    badgeZh: '博雅人文至尊',
    prestigeNumber: '#5',
    prestigeLabelEn: 'US News National Rank',
    prestigeLabelZh: 'US News 全美排名',
    taglineEn: 'The cultural, political, and humanities high-ground with exceptional residential college systems.',
    taglineZh: '全美政界、人文社会科学、法律及神圣思辨的殿堂，独特的寄宿学院制保障紧密社群。',
    keyFactEn: 'Yale undergraduates live inside 14 residential colleges, generating lifelong networking and close mentoring.',
    keyFactZh: '全体本科生被随机分派入 14 所终身寄宿学院（Residential Colleges），构成其毕生社交网络与大师贴身学术带教的基础。',
    descriptionEn: 'Yale University is famous for cultivating world presidential leaders, Supreme Court justices, and premier legal minds.',
    descriptionZh: '地处纽黑文，耶鲁大学在文学、历史、哲学、地缘战略等宏观人文社科大类上拥有无可挑战的桂冠地位。近年来，其工程技术与前沿数据科学亦获得大规模资本投入。',
    bgColor: 'from-[#0A3C94] to-[#041D4C]',
    primaryColor: '#00356B',
    usNewsRank: 5,
    usNewsYear: 2025,
    qsRank: 23,
    qsYear: 2025,
    schools: [
      {
        id: 'yale-college',
        code: 'YCP',
        nameEn: 'Yale College (Humanities & Social Sciences)',
        nameZh: '耶鲁学院 (人文学科与社会科学部)',
        subtitleEn: 'The core undergraduate entity, providing world-beating writing, history, and law prep tools.',
        subtitleZh: '人文学科与政治哲学的至高山峦，耶鲁博雅人文的核心。',
        tagEn: 'Political & Cultural High',
        tagZh: '总统政界先锋',
        descriptionEn: 'Teaches elite written communications, analytical ethics, and macro socioeconomic dynamics. The starting block for global leaders.',
        descriptionZh: '这里的历史系、英语写作、地缘政治哲学研究曾塑造了多代国际地标政治人物与领衔评论学者，强调对社会运行大趋势的洞若观火。',
        majors: [
          { id: 'yale-hist', nameEn: 'History', nameZh: '历史学', nationalMajorId: '63' },
          { id: 'yale-polisci', nameEn: 'Political Science', nameZh: '政治科学', nationalMajorId: '85' },
          { id: 'yale-econ', nameEn: 'Economics', nameZh: '经济学', nationalMajorId: '79' }
        ]
      },
      {
        id: 'yale-eng',
        code: 'SEAS',
        nameEn: 'Yale School of Engineering & Applied Science',
        nameZh: '耶鲁工程与应用科学学院',
        subtitleEn: 'Intimate, highly collaborative engineering hub inside a liberal arts superpower.',
        subtitleZh: '高教研资金、教授贴身指导的精英理工计算学部。',
        tagEn: 'Elite Tech Integration',
        tagZh: '小而精科技创新',
        descriptionEn: 'Provides direct entry to highly specialized coding, network system analysis, and advanced materials engineering labs without large crowds.',
        descriptionZh: '不片面追求产业流水线，强调将前沿计算机技术（计算机科学、智能软硬件）应用在跨学科人文、金融量化等宏观决策场景中。',
        majors: [
          { id: 'yale-cs', nameEn: 'Computer Science', nameZh: '计算机科学', nationalMajorId: '138' },
          { id: 'yale-bme', nameEn: 'Biomedical Engineering', nameZh: '生物医学工程', nationalMajorId: '101' }
        ]
      }
    ]
  },
  {
    id: 'upenn',
    nameEn: 'University of Pennsylvania',
    nameZh: '宾夕法尼亚大学',
    shortNameEn: 'UPenn',
    shortNameZh: '宾大',
    locationEn: 'Philadelphia, PA',
    locationZh: '宾夕法尼亚州 费城',
    badgeEn: 'Ivy League Wall Street',
    badgeZh: '常春藤盟校 (商界与跨学科领头羊)',
    prestigeNumber: '#10',
    prestigeLabelEn: 'US News National Rank',
    prestigeLabelZh: 'US News 全美排名',
    taglineEn: 'The professional powerhouse combining elite liberal arts with world-beating business (Wharton) & tech.',
    taglineZh: '全美商业霸主（沃顿商学院）与顶硬特工科、现代医学预科的完美交织体。',
    keyFactEn: 'Offers highly competitive coordinated dual-degree (M&T, Huntsman) blending Wharton with engineering or college.',
    keyFactZh: '开设有全美录取门槛最高的跨生院联合双学位项目（如 M&T 项目，同时拿沃顿商学与工程院工学双学士）。',
    descriptionEn: 'UPenn was founded by Benjamin Franklin with a focus on practical, powerful education that drives enterprise and advanced science.',
    descriptionZh: '坐落在费城核心，宾夕法尼亚大学不仅保留了常春藤的高贵背景，更是华尔街风投机构、纽约投行、跨国宏观咨询集团的绝对生源蓄水池。其本科培养理念兼顾学术前沿与应用落地。',
    bgColor: 'from-[#011F5B] to-[#990000]',
    primaryColor: '#011F5B',
    usNewsRank: 10,
    usNewsYear: 2025,
    qsRank: 11,
    qsYear: 2025,
    schools: [
      {
        id: 'upenn-wharton',
        code: 'Wharton',
        nameEn: 'The Wharton School',
        nameZh: '沃顿商学院',
        subtitleEn: 'The undisputed king of undergraduate business education globally.',
        subtitleZh: '全球本科商科圣地，商业模型与金融资本运筹的最高指挥部。',
         tagEn: 'Wall Street King',
        tagZh: '商界黄埔军校',
        descriptionEn: 'Offers a single Bachelor of Science in Economics with 18 optional concentrations ranging from finance and insurance to behavioral analytics.',
        descriptionZh: '本科生名义上授予计量经济学士（BSE），内部划分出金融、商业分析、组织管理、地产金融等超细分专业通道，拥有庞大的资本校友圈。',
        majors: [
          { id: 'whar-finance', nameEn: 'Finance (Concentration)', nameZh: '金融学', nationalMajorId: '4' },
          { id: 'whar-ba', nameEn: 'Business Analytics', nameZh: '商业分析', nationalMajorId: '3' },
          { id: 'whar-mgmt', nameEn: 'Management & Entrepreneurship', nameZh: '创业与企业治理', nationalMajorId: '4' }
        ]
      },
      {
        id: 'upenn-eng',
        code: 'PennEng',
        nameEn: 'Penn Engineering',
        nameZh: '工程与应用科学学院',
        subtitleEn: 'Elite school for high-performance computing, bio-design, and modern robotics.',
        subtitleZh: '支撑计算机底层工程、网路系统以及跨学科医疗计算的前沿生院。',
        tagEn: 'Digital Mastery',
        tagZh: '数字化量化大本营',
        descriptionEn: 'Birthplace of the first digital general-purpose computer (ENIAC). Blends perfectly with healthcare and financial tech resources.',
        descriptionZh: '计算机技术先锋。这里的算法和数智技术完全与沃顿的资本流、宾大医学院的临床研究实时打通，极其实用。',
        majors: [
          { id: 'penn-cs', nameEn: 'Computer Science', nameZh: '计算机科学', nationalMajorId: '138' },
          { id: 'penn-net', nameEn: 'Networked & Social Systems Engineering (NETS)', nameZh: '网络与社会系统工程 (NETS)', nationalMajorId: '104' }
        ]
      }
    ]
  },
  {
    id: 'caltech',
    nameEn: 'California Institute of Technology',
    nameZh: '加州理工学院',
    shortNameEn: 'Caltech',
    shortNameZh: '加州理工',
    locationEn: 'Pasadena, CA',
    locationZh: '加州 帕萨迪纳',
    badgeEn: 'Elite Quantitative',
    badgeZh: '极客学者大本营',
    prestigeNumber: '#7',
    prestigeLabelEn: 'US News National Rank',
    prestigeLabelZh: 'US News 全美排名',
    taglineEn: 'The ultra-select scientific haven with a legendary ratio of Nobel Laureates per capita.',
    taglineZh: '极高学术纯度、人均诺奖得主率极其惊人的尖端数理学术重镇。',
    keyFactEn: 'Maintains an extremely small student body (only ~900 undergrads total) with direct side-by-side Nobel lab entries.',
    keyFactZh: '全校本科生仅约 900 人左右，彻底消灭大课制，本科期间即可直接同诺贝尔学者在隔壁实验室共同开展课题。',
    descriptionEn: 'Caltech is famous for being incredibly rigorous in all fields of mathematics, aerospace propulsion, and modern astrobiology.',
    descriptionZh: '位于帕萨迪纳，管理着著名的喷气推进实验室（JPL）。加州理工代表了人类自然理论科学与物理、硬核代数量化运算的最前沿追求，其课程极具挑战性。',
    bgColor: 'from-[#FF6600] to-[#E25300]',
    primaryColor: '#FF6600',
    usNewsRank: 7,
    usNewsYear: 2025,
    qsRank: 10,
    qsYear: 2025,
    schools: [
      {
        id: 'caltech-pma',
        code: 'PMA',
        nameEn: 'Division of Physics, Mathematics and Astronomy',
        nameZh: '物理、数学与天文学部',
        subtitleEn: 'The quantum frontier which shaped mainstream planetary models and cosmic dynamics.',
        subtitleZh: '物理大一统、粒子微粒、极端深空建模的基础科研重器。',
        tagEn: 'Cosmic Frontier',
        tagZh: '探索宇宙与基本粒子',
        descriptionEn: 'Provides unparalleled education in quantum strings, pure calculus, astrophysics, and basic particle structures.',
        descriptionZh: '在这里，纯数理论与前沿天文物理是神圣的核心，学生能在大一阶段直接触碰各种引力波探测、微小粒子跃迁的底层机理。',
        majors: [
          { id: 'cal-phys', nameEn: 'Physics', nameZh: '物理学', nationalMajorId: '152' },
          { id: 'cal-math', nameEn: 'Mathematics', nameZh: '纯数与应用数学', nationalMajorId: '140' }
        ]
      },
      {
        id: 'caltech-eas',
        code: 'EAS',
        nameEn: 'Division of Engineering and Applied Science',
        nameZh: '工程与应用科学部',
        subtitleEn: 'Theoretical modeling applied to high-end microcomputing, aviation, and robot control.',
        subtitleZh: '数理逻辑向高端并行计算、无人系统及芯片极限材料转化的科研枢纽。',
        tagEn: 'Algorithmic Mastery',
        tagZh: '量化工程与前沿控制',
        descriptionEn: 'Prepares hyper-creative engineers to crack grand challenges in digital security, solar tech, and planetary aviation control.',
        descriptionZh: '这里的计算机方向（CS）高度偏重于深层离散数学和机器学习算法底层结构，并非普通的软件工程，意在奠定未来50年的技术底座。',
        majors: [
          { id: 'cal-cs', nameEn: 'Computer Science', nameZh: '计算与信息科学', nationalMajorId: '138' },
          { id: 'cal-aero', nameEn: 'Aerospace & Propulsion', nameZh: '航空航天与推进学', nationalMajorId: '98' }
        ]
      }
    ]
  },
  {
    id: 'columbia',
    nameEn: 'Columbia University',
    nameZh: '哥伦毕业大学',
    shortNameEn: 'Columbia',
    shortNameZh: '哥大',
    locationEn: 'New York, NY',
    locationZh: '纽约州 纽约',
    badgeEn: 'Ivy League NY Hub',
    badgeZh: '常春藤曼哈顿明珠',
    prestigeNumber: '#13',
    prestigeLabelEn: 'US News National Rank',
    prestigeLabelZh: 'US News 全美排名',
    taglineEn: 'The elite Manhattan institution blending world-renowned Core Curriculum with wall street proxy power.',
    taglineZh: '极具特色的核心课程体系、坐拥曼哈顿宇宙城核心的跨国资本、艺术和新闻中心。',
    keyFactEn: 'Legendary Core Curriculum requires all undergraduates to dive deeply into classical literature and civilization.',
    keyFactZh: '所有本科生必须通过其神圣、标志性的“核心课程”（Core Curriculum），进行全方位的西方文献与美学思辨。',
    descriptionEn: 'Columbia University feeds elite firms in downtown New York while maintaining high standards in literature, history, and financial math.',
    descriptionZh: '哥伦比亚大学主校区位于纽约曼哈顿，在人文历史、新闻传播、金融数学等领域学术资源丰厚。其绝佳的地理优势让本科生能随时进入联合国、顶流私募基金及大行实习。',
    bgColor: 'from-[#9BCBEB] to-[#1D4F73]',
    primaryColor: '#9BCBEB',
    usNewsRank: 13,
    usNewsYear: 2025,
    qsRank: 34,
    qsYear: 2025,
    schools: [
      {
        id: 'columbia-college',
        code: 'CC',
        nameEn: 'Columbia College of Arts',
        nameZh: '哥伦比亚学院 (文理核心院)',
        subtitleEn: 'The cornerstone unit requiring the historic, small-cohort Lit Hum & Contemporary Civilizations seminars.',
        subtitleZh: '哥大博雅教育的龙骨，核心研讨文学巨著与当代社会发展史。',
        tagEn: 'Lit Hum & Classics',
        tagZh: '文学巨著人文圣殿',
        descriptionEn: 'Forces analytical thinking. Here, math, econ, and social sciences are explored alongside massive historical library systems.',
        descriptionZh: '主司计量经济学、纯数学、统计学与人文学科探讨。在这里，世界前沿的经济博弈论与传统的博雅文史修养完美并轨。',
        majors: [
          { id: 'col-econ', nameEn: 'Economics', nameZh: '计量经济学', nationalMajorId: '79' },
          { id: 'col-math', nameEn: 'Mathematics', nameZh: '高等数学', nationalMajorId: '140' },
          { id: 'col-polisci', nameEn: 'Political Science', nameZh: '政治学', nationalMajorId: '85' }
        ]
      },
      {
        id: 'columbia-seas',
        code: 'SEAS',
        nameEn: 'Fu Foundation School of Engineering and Applied Science',
        nameZh: '傅氏基金工程与应用科学学院',
        subtitleEn: 'Highly collaborative engineering, centering around algorithmic investments, data tech, and biological computing.',
        subtitleZh: '专注于金融计量工程、数据挖掘与高维智能计算的硬核计算工程学院。',
        tagEn: 'NYC Tech Engine',
        tagZh: '曼哈顿数智先锋',
        descriptionEn: 'Provides exceptional options to study computing and operations research within immediate reach of global investment corporations.',
        descriptionZh: '重点推荐计算机（CS）方向与运筹学：金融工程（OR:FE）。学生在学习复杂图论算法和衍生品估值的同时，可以直接在旁边华尔街进行实践。',
        majors: [
          { id: 'col-cs', nameEn: 'Computer Science', nameZh: '计算机科学', nationalMajorId: '138' },
          { id: 'col-orfe', nameEn: 'Operations Research: Financial Engineering', nameZh: '运筹学：金融工程', nationalMajorId: '141' }
        ]
      }
    ]
  },
  {
    id: 'chicago',
    nameEn: 'University of Chicago',
    nameZh: '芝加哥大学',
    shortNameEn: 'UChicago',
    shortNameZh: '芝大',
    locationEn: 'Chicago, IL',
    locationZh: '伊利诺伊州 芝加哥',
    badgeEn: 'Quantitative Giant',
    badgeZh: '经济学派与量化天花板',
    prestigeNumber: '#11',
    prestigeLabelEn: 'US News National Rank',
    prestigeLabelZh: 'US News 全美排名',
    taglineEn: 'The uncompromising theoretical sanctuary that births academic disciplines and quantitative economics.',
    taglineZh: '学术态度极度严实、理论纯粹度极高，大名鼎鼎的“芝加哥学派”诞生地。',
    keyFactEn: 'Uses the unique, fast-paced Quarter System with mandatory classical intellectual core curricula.',
    keyFactZh: '实行快节奏的三学期制（Quarter System），辅以全美极负盛名的经典人文与科学底层考学制度。',
    descriptionEn: 'UChicago is world-renowned for its hyper-intellectual environment. Multiple global research schools in economics, math, and physics emerged here.',
    descriptionZh: '地处芝加哥海德公园，芝加哥大学崇尚极其艰深的纯理论学术钻研。在宏微观经济学、金融高斯模型、理论物理等阵地，这里的培养强度在学界被称为学者的黄埔军校。',
    bgColor: 'from-[#800000] to-[#2D3748]',
    primaryColor: '#800000',
    usNewsRank: 11,
    usNewsYear: 2025,
    qsRank: 21,
    qsYear: 2025,
    schools: [
      {
        id: 'uchicago-college',
        code: 'The College',
        nameEn: 'The College of the University of Chicago',
        nameZh: '芝加哥大学本科生院',
        subtitleEn: 'The dedicated undergraduate college hosting all social sciences, physical fields, and elite math pathways.',
        subtitleZh: '集纯数学、高级统计、宏微观计量经济学于一身的超级文理学术内核。',
        tagEn: 'Hyper-Academic',
        tagZh: '量化经济巨擘',
        descriptionEn: 'Houses the world-champion Econ program, preparing students with strong analytical tools to define major market trends.',
        descriptionZh: '提供在学术界和高密量化大厂享有无限盛誉的经济学项目。这里的基本考核和思辨挑战度极高。',
        majors: [
          { id: 'uchic-econ', nameEn: 'Economics (with Quantitative Track)', nameZh: '计量经济学 (Econ)', nationalMajorId: '79' },
          { id: 'uchic-math', nameEn: 'Mathematics', nameZh: '纯数与分析数学', nationalMajorId: '140' },
          { id: 'uchic-physics', nameEn: 'Physics', nameZh: '理论物理学', nationalMajorId: '152' }
        ]
      }
    ]
  },
  {
    id: 'umich',
    nameEn: 'University of Michigan, Ann Arbor',
    nameZh: '密歇根大学安娜堡分校',
    shortNameEn: 'UMich',
    shortNameZh: '密歇根大学',
    locationEn: 'Ann Arbor, MI',
    locationZh: '密歇根州 安娜堡',
    badgeEn: 'Flagship Public Ivy',
    badgeZh: '公立常春藤领航者',
    prestigeNumber: '#21',
    prestigeLabelEn: 'US News National Rank',
    prestigeLabelZh: 'US News 全美排名',
    taglineEn: 'Massive flagship departments with unmatched alumni scale and industry power.',
    taglineZh: '本科科系规模宏大、校友势力及世界五百强连接网络通达全球。',
    keyFactEn: 'Undergraduates apply directly to specialized schools. Over 14 colleges inside UMich offer customized direct-entries.',
    keyFactZh: '本科阶段并不设大类统招，而是直接报考 14 所独立生院，学生能极其精准地获得具体生院的一线资源。',
    descriptionEn: 'The University of Michigan is a top-ranked academic powerhouse. It is famous for combining elite Engineering, Business (Ross), and Information Sciences.',
    descriptionZh: '作为全球著名的公立常春藤旗舰，密歇根大学安娜堡分校学风彪悍，其化学物理、软件编程、汽车动力及金融管理都处于世界前沿段位，具有极强的地方和跨国资本雇主声威。',
    bgColor: 'from-[#00274C] to-[#041E34]',
    primaryColor: '#FFCB05',
    usNewsRank: 21,
    usNewsYear: 2025,
    qsRank: 34,
    qsYear: 2025,
    schools: [
      {
        id: 'lsa',
        code: 'LSA',
        nameEn: 'College of Literature, Science, and the Arts',
        nameZh: '文理学院',
        subtitleEn: 'UMich\'s largest undergraduate college covering humanities, social sciences, and natural sciences.',
        subtitleZh: 'UMich 最大的本科生院，涵盖人文、社科、自然科学及大师级交叉学科。',
        tagEn: 'Primary College',
        tagZh: '旗舰本科生院',
        descriptionEn: 'Offers a liberal arts-based curriculum across over 75 majors with top-tier research projects.',
        descriptionZh: '作为密大体系的绝对核心，文理学院提供极高质量的高密度课程，在认知脑科学、微观经济核算、物理实验等方向拥有诺奖级支持。',
        majors: [
          { id: 'lsa-math', nameEn: 'Mathematics', nameZh: '数学', nationalMajorId: '140' },
          { id: 'lsa-econ', nameEn: 'Economics', nameZh: '资本与微观经济学', nationalMajorId: '79' },
          { id: 'lsa-data-science', nameEn: 'Data Science (BS)', nameZh: '数据科学', nationalMajorId: '141' },
          { id: 'lsa-stats', nameEn: 'Statistics', nameZh: '统计学', nationalMajorId: '141' }
        ]
      },
      {
        id: 'coe',
        code: 'CoE',
        nameEn: 'College of Engineering',
        nameZh: '工学院',
        subtitleEn: 'Consistently ranks among the top engineering colleges in the United States.',
        subtitleZh: '全美排名前五的王牌理工工程院，拥有极为恐怖的前沿实验室和超级算力池。',
        tagEn: 'Engineering Giant',
        tagZh: '重点工科学院',
        descriptionEn: 'Equipped with multiple heavy labs. Fosters advanced machine computations, deep aerospace structures, and robotic control networks.',
        descriptionZh: '在这里，计算机（CS）方向、电气工程、材料学都直接对接北美五大湖区工业以及加利福尼亚的超级科技巨头，实操训练在业界赫赫有名。',
        majors: [
          { id: 'coe-cs', nameEn: 'Computer Science (BSE)', nameZh: '计算机科学 (工学版)', nationalMajorId: '138' },
          { id: 'coe-ce', nameEn: 'Computer Engineering', nameZh: '计算机工程', nationalMajorId: '137' },
          { id: 'coe-ee', nameEn: 'Electrical Engineering', nameZh: '电子电气工程', nationalMajorId: '104' }
        ]
      },
      {
        id: 'ross',
        code: 'Ross',
        nameEn: 'Stephen M. Ross School of Business',
        nameZh: '罗斯商学院',
        subtitleEn: 'Konsistently ranked among the top-tier business institutions, awarding a unified BBA.',
        subtitleZh: '商界皇冠，本科阶段授予极具含金量的工商管理学士 (BBA) 学位。',
        tagEn: 'Wall Street Premium',
        tagZh: '核心商学极星',
        descriptionEn: 'Uses modern lab portfolios. Undergraduates do not choose narrow concentrations but learn macro business strategy with high corporate placement.',
        descriptionZh: '罗斯商学院强调整体企业领导力与量化决策训练，是华尔街各大投行、私募及麦肯锡等宏观咨询机构的超级直达通道。',
        majors: [
          { id: 'ross-bba', nameEn: 'Bachelor of Business Administration (BBA)', nameZh: '工商管理学士 (BBA)', nationalMajorId: '4' }
        ]
      }
    ]
  },
  {
    id: 'rice',
    nameEn: 'Rice University',
    nameZh: '莱斯大学',
    shortNameEn: 'Rice',
    shortNameZh: '莱斯',
    locationEn: 'Houston, TX',
    locationZh: '德克萨斯州 休斯敦',
    badgeEn: 'Southern Ivy Elite',
    badgeZh: '南方青藤小巨人',
    prestigeNumber: '#18',
    prestigeLabelEn: 'US News National Rank',
    prestigeLabelZh: 'US News 全美排名',
    taglineEn: 'Tiny-scale exquisite Ivy equivalent in Texas with famous architecture and engineering setups.',
    taglineZh: '德州休斯敦的博雅神殿，小班精英化教育、享有极高师生比和一流建筑工科。',
    keyFactEn: 'Operates on a beautiful student-centered residential college model with generous research grants.',
    keyFactZh: '彻底采用紧密的寄宿学院大社区交互制，本科人均享有全美最高配额的独立科研津贴及教授一对一推荐。',
    descriptionEn: 'Rice University is famous for its outstanding architecture school and its heavy biomedical engineering labs next to Houston Medical Center.',
    descriptionZh: '莱斯大学位于德州第一大都市，由于高师生比和对本科生的全方位学术关怀，深得全美学者爱戴。其空间物理学、高精纳米技术和建筑B.Arch专业皆居全球突出身位。',
    bgColor: 'from-[#00205B] to-[#1E3A8A]',
    primaryColor: '#00205B',
    usNewsRank: 18,
    usNewsYear: 2025,
    qsRank: 141,
    qsYear: 2025,
    schools: [
      {
        id: 'rice-brown',
        code: 'Brown',
        nameEn: 'George R. Brown School of Engineering',
        nameZh: '布朗工程学院',
        subtitleEn: 'Stellar engineering divisions offering custom biomedical and computing infrastructure.',
        subtitleZh: '依托旁边世界最大医学中心的医疗计算工程皇冠，配备超豪华实验工坊。',
        tagEn: 'Heavy Tech Lab',
        tagZh: '南方硬科技核心',
        descriptionEn: 'Offers fast tracks in Computer Science, Bioengineering, and materials processing, deeply allied with world-class medical centers.',
        descriptionZh: '在信息工程（CS）、纳米材料及生物医学工程方面实力坚固，教授带领本科生亲自动手搭建各种临床仿真或先进机械系统。',
        majors: [
          { id: 'rice-cs', nameEn: 'Computer Science (BS)', nameZh: '计算机科学', nationalMajorId: '138' },
          { id: 'rice-bme', nameEn: 'Bioengineering', nameZh: '生物力学与生物工程', nationalMajorId: '101' },
          { id: 'rice-ece', nameEn: 'Electrical and Computer Engineering', nameZh: '电子与计算机工程', nationalMajorId: '104' }
        ]
      },
      {
        id: 'rice-business',
        code: 'Virani',
        nameEn: 'Virani Undergraduate School of Business',
        nameZh: '维拉尼本科商学院',
        subtitleEn: 'A newly founded, rapidly expanding business education footprint at Rice.',
        subtitleZh: '近年莱斯砸下重金开办的高标准商学院分支，资本对接速度飞快。',
         tagEn: 'Fast Growing',
        tagZh: '南方金融资本新星',
        descriptionEn: 'Virani provides sharp insights on capital layout, macro risk valuation, and investment strategy with first-tier finance resources.',
        descriptionZh: '凭借莱斯的声誉声光，该商院本科迅速吸引了大量顶级投行、战略咨询和德州能源财团来校直接包揽管培生名额。',
        majors: [
          { id: 'rice-business-ba', nameEn: 'Business (BA)', nameZh: '莱斯商科', nationalMajorId: '4' }
        ]
      }
    ]
  },
  {
    id: 'tsinghua',
    nameEn: 'Tsinghua University',
    nameZh: '清华大学',
    shortNameEn: 'Tsinghua',
    shortNameZh: '清华大学',
    locationEn: 'Beijing, CN',
    locationZh: '中国 北京',
    badgeEn: 'Asia Top STEM Elite',
    badgeZh: '中国工科与学术至尊',
    prestigeNumber: '#16',
    prestigeLabelEn: 'US News Global Rank',
    prestigeLabelZh: 'US News 全球排名',
    taglineEn: 'The preeminent engine of theoretical, engineering, and digital wizardry in Asia.',
    taglineZh: '中国及亚洲硬核科学计算、顶硬工科研究与卓越学术策源霸主。',
    keyFactEn: 'Hosts elite undergraduate institutes like Yacht (Yaoclass) for computer science and Xuetang classes for sciences.',
    keyFactZh: '开设有声震华夏与全球人工智能学界的清华“姚班”、“智班”等顶配高才研培室，学术天花板极高。',
    descriptionEn: 'Tsinghua University occupies a glorious historic royal park in Beijing. It consistently ranks #1 in Global Engineering indexes.',
    descriptionZh: '地处北京，不仅拥有中国最顶级的高考和竞赛生源，更主导了中国大量前沿芯片架构、电网系统、高端量子物理器件的研发进程，QS及US NEWS排名近年快速跻身全球最顶尖队列。',
    bgColor: 'from-[#6E2B87] to-[#1F2937]',
    primaryColor: '#6E2B87',
    usNewsRank: 16,
    usNewsYear: 2025,
    qsRank: 20,
    qsYear: 2025,
    isGlobalRank: true,
    schools: [
      {
        id: 'tsinghua-it',
        code: 'SIST',
        nameEn: 'School of Information Science and Technology',
        nameZh: '信息科学技术学院',
        subtitleEn: 'Hosts top-tier Computer Science, Automation, and Electronics departments.',
        subtitleZh: '包含姚班在内、集全华夏顶尖软硬件系统架构师的大本营。',
        tagEn: 'Global Computing Zenith',
        tagZh: '信息计算世界高峰',
        descriptionEn: 'Pioneering artificial intelligence models, massive parallel data pipelines, and advanced microchips with global citations.',
        descriptionZh: '在计算机算法（CS）、自动化理论、人工智能网络建模方向声望极隆，本科校友活跃于全球主流学术前哨与顶配高新企业。',
        majors: [
          { id: 'tsing-cs', nameEn: 'Computer Science and Technology', nameZh: '计算机科学与技术', nationalMajorId: '138' },
          { id: 'tsing-ee', nameEn: 'Electronic Information Engineering', nameZh: '电子信息工程', nationalMajorId: '104' }
        ]
      },
      {
        id: 'tsinghua-sem',
        code: 'SEM',
        nameEn: 'School of Economics and Management',
        nameZh: '经济管理学院',
        subtitleEn: "Asia's premier business education center, combining modern analytical finance and management theory.",
        subtitleZh: '亚太顶尖商学与宏观管理研究重镇，高度强调数理计量金融。',
        tagEn: 'Asia Elite Business',
        tagZh: '亚太商界精英策源地',
        descriptionEn: 'Provides state-of-the-art economics, finance, and accounting tracks. Heavily targeted by global investment banks and sovereign wealth funds.',
        descriptionZh: '主司数理金融学、经济学、会计学。该院不仅具备极高声望，其毕业生常年直升国际大行及顶级管理咨询机构。',
        majors: [
          { id: 'tsing-finance', nameEn: 'Finance', nameZh: '金融学', nationalMajorId: '5' },
          { id: 'tsing-econ', nameEn: 'Economics', nameZh: '经济学', nationalMajorId: '79' },
          { id: 'tsing-accounting', nameEn: 'Accounting', nameZh: '会计学', nationalMajorId: '1' }
        ]
      },
      {
        id: 'tsinghua-science',
        code: 'Sciences',
        nameEn: 'School of Sciences',
        nameZh: '理学院',
        subtitleEn: 'Pure and applied natural sciences with deep national grants and top laboratories.',
        subtitleZh: '包含物理与数学在内、奠定中国硬核科学基石的重型理论学院。',
        tagEn: 'Pristine Science',
        tagZh: '基础科研学术磐石',
        descriptionEn: 'Focuses heavily on core research paradigms in physics, chemistry, and mathematics with world-class researcher side-by-side instruction.',
        descriptionZh: '物理系与数学系拥有极深的研究底蕴。提供严密的微积分析与微观物理器件研究氛围，是国家基础科研的骨干力量。',
        majors: [
          { id: 'tsing-math', nameEn: 'Mathematics and Applied Mathematics', nameZh: '数学与应用数学', nationalMajorId: '140' },
          { id: 'tsing-phys', nameEn: 'Physics', nameZh: '物理学', nationalMajorId: '152' }
        ]
      }
    ]
  },
  {
    id: 'peking',
    nameEn: 'Peking University',
    nameZh: '北京大学',
    shortNameEn: 'Peking',
    shortNameZh: '北京大学',
    locationEn: 'Beijing, CN',
    locationZh: '中国 北京',
    badgeEn: 'Asia Top Comprehensive',
    badgeZh: '中国人文博雅与理科桂冠',
    prestigeNumber: '#39',
    prestigeLabelEn: 'US News Global Rank',
    prestigeLabelZh: 'US News 全球排名',
    taglineEn: 'The supreme center of humanities, pure sciences, and modern clinical research in China.',
    taglineZh: '中国博雅精神、尖端纯理论数学与现代微观高能物理体系的高贵明珠。',
    keyFactEn: 'Hosts Yuanpei College with full academic freedom to mix humanities or sciences flexibly.',
    keyFactZh: '拥有标杆式的“元培学院”，允许本科生跨学部无限制选修、自拟复合型交叉专业学科。',
    descriptionEn: 'Peking University is historically known for leading cultural shifts, theoretical physics, and supreme pure mathematics in Asia.',
    descriptionZh: '坐落于风景秀丽的燕园，北京大学在中国政治经济学、基础纯数学、高级文学创作及现代分子医学方向享有无可震撼的金身地位。数学“黄金一代”校友名扬海外。',
    bgColor: 'from-[#8C0000] to-[#0A0A0A]',
    primaryColor: '#8C0000',
    usNewsRank: 39,
    usNewsYear: 2025,
    qsRank: 14,
    qsYear: 2025,
    isGlobalRank: true,
    schools: [
      {
        id: 'peking-math',
        code: 'SMS',
        nameEn: 'School of Mathematical Sciences',
        nameZh: '北京大学数学科学学院',
        subtitleEn: 'The supreme mathematics hub in China, nurturing legendary mathematicians.',
        subtitleZh: '号称“第一学府第一系”，囊括全华夏乃至世界顶尖硬核纯数拓扑骨干力量。',
        tagEn: 'Mathematical Peak',
        tagZh: '数学学界霸主',
        descriptionEn: 'Highly rigorous curriculum in topological algebra, probability model design, and high-performance computing theories.',
        descriptionZh: '其本科生在微积分底子、解析几何 and 现代概率控制论上的训练强度极深，多届本科校友获全球菲尔兹及科学大奖。',
        majors: [
          { id: 'pk-math', nameEn: 'Mathematics and Applied Mathematics', nameZh: '数学与应用数学', nationalMajorId: '140' },
          { id: 'pk-stats', nameEn: 'Probability and Statistics', nameZh: '概率统计学', nationalMajorId: '141' }
        ]
      },
      {
        id: 'peking-guanghua',
        code: 'GSM',
        nameEn: 'Guanghua School of Management',
        nameZh: '光华管理学院',
        subtitleEn: 'The leading business school in China, boasting elite finance and management placements.',
        subtitleZh: '大名鼎鼎的“光华管理”，全中国顶尖的高考状元与领袖英才聚集地。',
        tagEn: 'Guanghua Leaders',
        tagZh: '中国商业领袖摇篮',
        descriptionEn: 'Offers state-of-the-art corporate financial management, macroeconomic evaluation, and accounting metrics. Excellent alumni network.',
        descriptionZh: '光华管理学院为本科生提供首屈一指的资本管理、微观组织决策、宏观金融工程课程体系，直接向国际投行与风投基金输送英才。',
        majors: [
          { id: 'pk-finance', nameEn: 'Finance', nameZh: '金融学', nationalMajorId: '5' },
          { id: 'pk-econ', nameEn: 'Economics', nameZh: '经济学', nationalMajorId: '79' }
        ]
      },
      {
        id: 'peking-eecs',
        code: 'EECS',
        nameEn: 'School of Electronics Engineering and Computer Science',
        nameZh: '信息科学技术学院',
        subtitleEn: 'A high-impact electronics and computing intelligence hub.',
        subtitleZh: '集算法基础、智能机理以及超级微电路架构于一身的信息计算学院。',
        tagEn: 'Leading Intelligent Tech',
        tagZh: '计算机核心智囊',
        descriptionEn: 'Drives pioneering computer architectures, natural language parsing, and chip microelectronics research.',
        descriptionZh: '北大信科在计算机算法（CS）、人工智能（智能科学）、核心微处理器电路设计方面实力雄厚，为现代软件工业提供了强大的底层算法驱动力。',
        majors: [
          { id: 'pk-cs', nameEn: 'Computer Science and Technology', nameZh: '计算机科学与技术', nationalMajorId: '138' },
          { id: 'pk-is', nameEn: 'Intelligent Science and Technology', nameZh: '智能科学与技术', nationalMajorId: '138' }
        ]
      }
    ]
  },
  {
    id: 'oxford',
    nameEn: 'University of Oxford',
    nameZh: '牛津大学',
    shortNameEn: 'Oxford',
    shortNameZh: '牛津大学',
    locationEn: 'Oxford, UK',
    locationZh: '英国 牛津',
    badgeEn: 'Global Academic Legend',
    badgeZh: '全球千年英伦学术殿堂',
    prestigeNumber: '#5',
    prestigeLabelEn: 'US News Global Rank',
    prestigeLabelZh: 'US News 全球排名',
    taglineEn: 'The legendary collegiate sanctuary with world-renowned tutorial systems and historical legacy.',
    taglineZh: '极具神圣底蕴的九百载巨擘，独一无二的教授双周导师制（Tutorial）天花板。',
    keyFactEn: 'Undergraduates study in individual Colleges under highly rigorous dual-weekly essays with world expert tutors.',
    keyFactZh: '学生需归并在独立学院中就读，接受每周教授亲自质询的“双人对话导师制”（Tutorial），阅读量艰深。',
    descriptionEn: 'The University of Oxford combines ancient stone architectures with cutting-edge global research centers in epidemiology, math, and humanities.',
    descriptionZh: '九百年历史见证了无数大国首相、诺奖得者与大思想家的成材之路。其本科教程（ tutorial system ）是全世界教育史上的巅峰代表作，QS及US News排名均列全球最前沿梯队。',
    bgColor: 'from-[#002147] to-[#1E293B]',
    primaryColor: '#002147',
    usNewsRank: 5,
    usNewsYear: 2025,
    qsRank: 3,
    qsYear: 2025,
    isGlobalRank: true,
    schools: [
      {
        id: 'oxford-mpls',
        code: 'MPLS',
        nameEn: 'Mathematical, Physical and Life Sciences Division',
        nameZh: '数理与生命科学学部',
        subtitleEn: 'Rigorous engineering and natural sciences based on pure mathematical logic and legacy libraries.',
        subtitleZh: '依托深厚物理传统和牛津计算中心、底气牢固的数理工程学部。',
        tagEn: 'Historical Logic',
        tagZh: '数理工程极致',
        descriptionEn: 'Offers pristine theoretical training in advanced computer science, statistics, physical chemistry, and cosmic relativity studies.',
        descriptionZh: '这里的计算机方向（CS）、理论物理高度绑定深奥的离散代数与理论分析，旨在打通未来的科学哲学边界。',
        majors: [
          { id: 'ox-cs', nameEn: 'Computer Science', nameZh: '计算机科学与数学', nationalMajorId: '138' },
          { id: 'ox-math', nameEn: 'Mathematics', nameZh: '经典纯粹数学', nationalMajorId: '140' }
        ]
      },
      {
        id: 'oxford-socsciences',
        code: 'SocSci',
        nameEn: 'Social Sciences Division',
        nameZh: '社会科学学部',
        subtitleEn: 'Home of the world-famous PPE paradigm and elite macroeconomic administration.',
        subtitleZh: '培育了数十位国家元首与全球治理先驱的社会科学黄金学部。',
        tagEn: 'PPE Monarch',
        tagZh: '全球政界领袖摇篮',
        descriptionEn: 'Combines highly analytical philosophical rigor, statecraft political analysis, and macroeconomic mechanics to prepare future pioneers.',
        descriptionZh: '以大名鼎鼎的 PPE（哲学、政治学与经济学）专业闻名于世，探讨人类社会制度演进的核心规律。',
        majors: [
          { id: 'ox-ppe', nameEn: 'Philosophy, Politics and Economics (PPE)', nameZh: '哲学、政治学与经济学 (PPE)', nationalMajorId: '79' },
          { id: 'ox-econ-mgmt', nameEn: 'Economics and Management', nameZh: '经济与管理学', nationalMajorId: '4' }
        ]
      },
      {
        id: 'oxford-humanities',
        code: 'Humanities',
        nameEn: 'Humanities Division',
        nameZh: '人文科学学部',
        subtitleEn: 'The ultimate pinnacle of historical inquiry, classical civilizations, and languages.',
        subtitleZh: '底蕴神圣且悠长的人文底座，探讨全球历史变迁与文学思索。',
        tagEn: 'Pristine Classics',
        tagZh: '人文学术桂冠',
        descriptionEn: 'Fosters precision writing, critical source analysis, and rigorous classical debates via weekly intense tutorial essay submission.',
        descriptionZh: '历史系等文科学部享誉世界，注重最严苛的史料考证、修辞论证与深度历史变迁演绎，毕业生在政界学术界底盘极深。',
        majors: [
          { id: 'ox-hist', nameEn: 'History', nameZh: '历史学', nationalMajorId: '63' }
        ]
      }
    ]
  },
  {
    id: 'nus',
    nameEn: 'National University of Singapore',
    nameZh: '新加坡国立大学',
    shortNameEn: 'NUS',
    shortNameZh: '新国大',
    locationEn: 'Kent Ridge, Singapore',
    locationZh: '新加坡 肯特岗',
    badgeEn: 'Global Research Giant',
    badgeZh: '亚洲顶尖国际化旗舰',
    prestigeNumber: '#22',
    prestigeLabelEn: 'US News Global Rank',
    prestigeLabelZh: 'US News 全球排名',
    taglineEn: 'The highly dynamic international university ranking consistently as Asia\'s vanguard.',
    taglineZh: '近年来在QS世界排名高跨至第8位的亚洲龙头学府，英语授课、资金充沛、全面接轨欧美。',
    keyFactEn: 'Ensures great career pipelines with global industry hubs across the Pacific rim.',
    keyFactZh: '拥有世界顶格的产产学研配套基金，为本科毕业生在跨国巨头、主权财富基金及风投圈中编织丝滑出路。',
    descriptionEn: 'NUS offers high-end international education. It operates as a strategic crossroads for major computing technologies and macroeconomic finance.',
    descriptionZh: '新加坡国立大学不仅在计算机、数理数据分析等理工科稳居世界顶峰，在微观管理和金融估值方面更是亚洲雇主的最爱。高度推荐给希望同时掌握中西方全球市场的创新先驱。',
    bgColor: 'from-[#EF7C00] to-[#003D7C]',
    primaryColor: '#EF7C00',
    usNewsRank: 22,
    usNewsYear: 2025,
    qsRank: 8,
    qsYear: 2025,
    isGlobalRank: true,
    schools: [
      {
        id: 'nus-soc',
        code: 'SoC',
        nameEn: 'School of Computing',
        nameZh: '计算机学院',
        subtitleEn: "Asia's foremost center for software development, database design, and algorithmic innovation.",
        subtitleZh: '亚洲无可匹敌的算法摇篮，数字化未来和信息系统的终极引擎。',
        tagEn: 'Asia Computing Hub',
        tagZh: '亚太数智排头兵',
        descriptionEn: 'Offers intensive tracks in high-performance computing, artificial intelligence pipelines, and complex data infrastructure.',
        descriptionZh: '国大计算机系（SoC）学风极其强悍，注重坚实的算法基础、大规模云系统构建与网络安全，毕业生横扫东南亚及全球数智核心。',
        majors: [
          { id: 'nus-cs', nameEn: 'Computer Science', nameZh: '计算机科学', nationalMajorId: '138' },
          { id: 'nus-is', nameEn: 'Information Systems', nameZh: '信息系统学', nationalMajorId: '136' }
        ]
      },
      {
        id: 'nus-cde',
        code: 'CDE',
        nameEn: 'College of Design and Engineering',
        nameZh: '设计与工程学院',
        subtitleEn: 'The combined ultra-modern complex for computational systems and engineering designs.',
        subtitleZh: '新加坡科技强国核心，汇集顶尖物联网、机器人及工程体系。',
        tagEn: 'Pacific Rim Hub',
        tagZh: '多维智能工程前线',
        descriptionEn: 'Focuses heavily on direct career linkage. Highly valued for computer engineering and operational hardware development.',
        descriptionZh: '涵盖自动化控制、分布式网络与电气系统设计。紧贴新加坡科技跨国基地，实施带薪研习直达通道。',
        majors: [
          { id: 'nus-ee', nameEn: 'Electrical Engineering', nameZh: '电气工程', nationalMajorId: '104' },
          { id: 'nus-me', nameEn: 'Mechanical Engineering', nameZh: '机械工程', nationalMajorId: '114' }
        ]
      },
      {
        id: 'nus-biz',
        code: 'NUSBIZ',
        nameEn: 'NUS Business School',
        nameZh: '新加坡国立大学商学院',
        subtitleEn: 'The strategic commercial and financial gateway to Southeast Asian markets.',
        subtitleZh: '连接东西方资本体系的金融枢纽，高度偏向量化商业分析。',
        tagEn: 'ASEAN Business Jewel',
        tagZh: '东盟金融资本星港',
        descriptionEn: 'Delivers top-class business management, financial asset valuations, and market analytics programs directly linked to Singapore Financial District.',
        descriptionZh: '得益于新加坡全球三大金融中心的优势，商学院本科将资本工程、商业决策与多语种商务协作相结合，校友网络遍布全球巨行。',
        majors: [
          { id: 'nus-bizadmin', nameEn: 'Business Administration', nameZh: '工商管理', nationalMajorId: '4' },
          { id: 'nus-bizanalytics', nameEn: 'Business Analytics', nameZh: '商业分析', nationalMajorId: '3' }
        ]
      }
    ]
  }
];

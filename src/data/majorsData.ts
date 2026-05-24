import { BroadField, DetailedField, Major, HighlightMajor } from '../types';

export const broadFields: BroadField[] = [
  {
    id: 'stem',
    nameEn: 'STEM',
    nameZh: '科学、技术、工程与数学 (STEM)',
    recentMedianEarningsEn: '$63,000',
    recentMedianEarningsVal: 63000,
    primeMedianEarningsEn: '$98,000',
    primeMedianEarningsVal: 98000,
    gradPremiumPercent: 32,
    gradDegreePercent: 25,
    gradDegreeAlternativePercent: 44
  },
  {
    id: 'business_comms',
    nameEn: 'Business & Communications',
    nameZh: '商业与传播学',
    recentMedianEarningsEn: '$55,000',
    recentMedianEarningsVal: 55000,
    primeMedianEarningsEn: '$86,000',
    primeMedianEarningsVal: 86000,
    gradPremiumPercent: 31,
    gradDegreePercent: 25
  },
  {
    id: 'healthcare',
    nameEn: 'Healthcare',
    nameZh: '医疗保健',
    recentMedianEarningsEn: '$60,000',
    recentMedianEarningsVal: 60000,
    primeMedianEarningsEn: '$82,000',
    primeMedianEarningsVal: 82000,
    gradPremiumPercent: 34,
    gradDegreePercent: 38
  },
  {
    id: 'social_sciences',
    nameEn: 'Social Sciences',
    nameZh: '社会科学与心理学',
    recentMedianEarningsEn: '$49,000',
    recentMedianEarningsVal: 49000,
    primeMedianEarningsEn: '$75,000',
    primeMedianEarningsVal: 75000,
    gradPremiumPercent: 34,
    gradDegreePercent: 44,
    gradDegreeAlternativePercent: 45
  },
  {
    id: 'multidisciplinary',
    nameEn: 'Multidisciplinary Studies',
    nameZh: '多学科研究',
    recentMedianEarningsEn: '$49,000',
    recentMedianEarningsVal: 49000,
    primeMedianEarningsEn: '$74,000',
    primeMedianEarningsVal: 74000,
    gradPremiumPercent: 40,
    gradDegreePercent: 45
  },
  {
    id: 'career_focused',
    nameEn: 'Career-Focused',
    nameZh: '职业导向类 (应用技术与消费服务)',
    recentMedianEarningsEn: '$46,000',
    recentMedianEarningsVal: 46000,
    primeMedianEarningsEn: '$72,000',
    primeMedianEarningsVal: 72000,
    gradPremiumPercent: 28,
    gradDegreePercent: 33
  },
  {
    id: 'humanities_arts',
    nameEn: 'Humanities & the Arts',
    nameZh: '人文学科与艺术',
    recentMedianEarningsEn: '$45,000',
    recentMedianEarningsVal: 45000,
    primeMedianEarningsEn: '$69,000',
    primeMedianEarningsVal: 69000,
    gradPremiumPercent: 32,
    gradDegreePercent: 50
  },
  {
    id: 'education_public_service',
    nameEn: 'Education & Public Service',
    nameZh: '教育与公共服务',
    recentMedianEarningsEn: '$46,000',
    recentMedianEarningsVal: 46000,
    primeMedianEarningsEn: '$58,000',
    primeMedianEarningsVal: 58000,
    gradPremiumPercent: 22,
    gradDegreePercent: 37,
    gradDegreeAlternativePercent: 50
  }
];

export const detailedFields: DetailedField[] = [
  {
    id: 'agriculture_resources',
    nameEn: 'Agriculture & Natural Resources',
    nameZh: '农业与自然资源',
    broadFieldId: 'stem',
    primeMedianEarningsVal: 81000,
    unemploymentRecentPercent: 4.0,
    unemploymentPrimePercent: 1.9,
    degreeProductionChangePercent: 65
  },
  {
    id: 'architecture_engineering',
    nameEn: 'Architecture & Engineering',
    nameZh: '建筑与工程学',
    broadFieldId: 'stem',
    primeMedianEarningsVal: 109000,
    unemploymentRecentPercent: 5.5,
    unemploymentPrimePercent: 3.1,
    degreeProductionChangePercent: 52
  },
  {
    id: 'arts',
    nameEn: 'Arts',
    nameZh: '艺术学',
    broadFieldId: 'humanities_arts',
    primeMedianEarningsVal: 65000,
    unemploymentRecentPercent: 8.9,
    unemploymentPrimePercent: 4.7,
    degreeProductionChangePercent: 1
  },
  {
    id: 'biology_life',
    nameEn: 'Biology & Life Sciences',
    nameZh: '生物与生命科学',
    broadFieldId: 'stem',
    primeMedianEarningsVal: 82000,
    unemploymentRecentPercent: 4.8,
    unemploymentPrimePercent: 2.8,
    degreeProductionChangePercent: 61
  },
  {
    id: 'business',
    nameEn: 'Business',
    nameZh: '商科/商业',
    broadFieldId: 'business_comms',
    primeMedianEarningsVal: 87000,
    unemploymentRecentPercent: 4.9,
    unemploymentPrimePercent: 2.6,
    degreeProductionChangePercent: 5
  },
  {
    id: 'communications_journalism',
    nameEn: 'Communications & Journalism',
    nameZh: '传媒与新闻学',
    broadFieldId: 'business_comms',
    primeMedianEarningsVal: 81000,
    unemploymentRecentPercent: 6.3,
    unemploymentPrimePercent: 3.6,
    degreeProductionChangePercent: 1
  },
  {
    id: 'computers_stats_math',
    nameEn: 'Computers, Statistics, & Math',
    nameZh: '计算机、统计学与数学',
    broadFieldId: 'stem',
    primeMedianEarningsVal: 105000,
    unemploymentRecentPercent: 6.8,
    unemploymentPrimePercent: 3.1,
    degreeProductionChangePercent: 159
  },
  {
    id: 'education',
    nameEn: 'Education',
    nameZh: '教育学',
    broadFieldId: 'education_public_service',
    primeMedianEarningsVal: 58000,
    unemploymentRecentPercent: 2.8,
    unemploymentPrimePercent: 2.0,
    degreeProductionChangePercent: -14
  },
  {
    id: 'health',
    nameEn: 'Health',
    nameZh: '健康与医疗基础设施',
    broadFieldId: 'healthcare',
    primeMedianEarningsVal: 85000,
    unemploymentRecentPercent: 3.8,
    unemploymentPrimePercent: 1.8,
    degreeProductionChangePercent: 109
  },
  {
    id: 'humanities_liberal_arts',
    nameEn: 'Humanities & Liberal Arts',
    nameZh: '人文与自由艺术',
    broadFieldId: 'humanities_arts',
    primeMedianEarningsVal: 73000,
    unemploymentRecentPercent: 6.7,
    unemploymentPrimePercent: 3.7,
    degreeProductionChangePercent: -33
  },
  {
    id: 'industrial_arts_rec',
    nameEn: 'Industrial Arts, Consumer Svcs, Recreation',
    nameZh: '工业技术、消费服务与休闲运动',
    broadFieldId: 'career_focused',
    primeMedianEarningsVal: 72000,
    unemploymentRecentPercent: 5.9,
    unemploymentPrimePercent: 3.8,
    degreeProductionChangePercent: 29
  },
  {
    id: 'multi_disciplinary',
    nameEn: 'Multi/Interdisciplinary Studies',
    nameZh: '多学科/跨学科研究',
    broadFieldId: 'multidisciplinary',
    primeMedianEarningsVal: 74000,
    unemploymentRecentPercent: 5.1,
    unemploymentPrimePercent: 2.9,
    degreeProductionChangePercent: 40
  },
  {
    id: 'physical_sciences',
    nameEn: 'Physical Sciences',
    nameZh: '物理/自然科学',
    broadFieldId: 'stem',
    primeMedianEarningsVal: 105000,
    unemploymentRecentPercent: 6.7,
    unemploymentPrimePercent: 3.4,
    degreeProductionChangePercent: 20
  },
  {
    id: 'psychology',
    nameEn: 'Psychology',
    nameZh: '心理学',
    broadFieldId: 'social_sciences',
    primeMedianEarningsVal: 73000,
    unemploymentRecentPercent: 4.6,
    unemploymentPrimePercent: 2.4,
    degreeProductionChangePercent: 41
  },
  {
    id: 'social_sciences',
    nameEn: 'Social Sciences',
    nameZh: '社会科学',
    broadFieldId: 'social_sciences',
    primeMedianEarningsVal: 77000,
    unemploymentRecentPercent: 6.7,
    unemploymentPrimePercent: 3.1,
    degreeProductionChangePercent: -6
  },
  {
    id: 'social_work_public_service',
    nameEn: 'Social Work & Public Service',
    nameZh: '社会工作与公共服务',
    broadFieldId: 'education_public_service',
    primeMedianEarningsVal: 66000,
    unemploymentRecentPercent: 4.3,
    unemploymentPrimePercent: 3.1,
    degreeProductionChangePercent: 14
  }
];

export const highlightMajors: HighlightMajor[] = [
  {
    nameEn: 'Petroleum Engineering',
    nameZh: '石油工程',
    earningsVal: 146000,
    type: 'highest'
  },
  {
    nameEn: 'Pharmacy and Pharmaceutical Sciences',
    nameZh: '药学与药剂学及管理',
    earningsVal: 145000,
    type: 'highest'
  },
  {
    nameEn: 'Metallurgical Engineering',
    nameZh: '冶金工程',
    earningsVal: 125000,
    type: 'highest'
  },
  {
    nameEn: 'Early Childhood Education',
    nameZh: '学前教育',
    earningsVal: 51000,
    type: 'lowest'
  },
  {
    nameEn: 'Counseling Psychology',
    nameZh: '咨询心理学',
    earningsVal: 55000,
    type: 'lowest'
  },
  {
    nameEn: 'Teacher Education: Multiple Levels',
    nameZh: '多层次教师教育',
    earningsVal: 55000,
    type: 'lowest'
  }
];

export const majors: Major[] = [
  // 1. Business & Communications -> Business
  { id: '1', nameEn: 'Accounting', nameZh: '会计学', broadFieldId: 'business_comms', detailedFieldId: 'business' },
  { id: '2', nameEn: 'Actuarial science', nameZh: '精算学', broadFieldId: 'business_comms', detailedFieldId: 'business' },
  { id: '3', nameEn: 'Business economics', nameZh: '商业经济学', broadFieldId: 'business_comms', detailedFieldId: 'business' },
  { id: '4', nameEn: 'Business management and administration', nameZh: '工商管理与行政', broadFieldId: 'business_comms', detailedFieldId: 'business' },
  { id: '5', nameEn: 'Finance', nameZh: '金融学', broadFieldId: 'business_comms', detailedFieldId: 'business' },
  { id: '6', nameEn: 'General business', nameZh: '通用商业学', broadFieldId: 'business_comms', detailedFieldId: 'business' },
  { id: '7', nameEn: 'Hospitality management', nameZh: '酒店管理', broadFieldId: 'business_comms', detailedFieldId: 'business' },
  { id: '8', nameEn: 'Human resources and personnel management', nameZh: '人力资源与人事管理', broadFieldId: 'business_comms', detailedFieldId: 'business' },
  { id: '9', nameEn: 'International business', nameZh: '国际商务', broadFieldId: 'business_comms', detailedFieldId: 'business' },
  { id: '10', nameEn: 'Management information systems and statistics', nameZh: '管理信息系统与统计学', broadFieldId: 'business_comms', detailedFieldId: 'business' },
  { id: '11', nameEn: 'Marketing and marketing research', nameZh: '市场营销与营销研究', broadFieldId: 'business_comms', detailedFieldId: 'business' },
  { id: '12', nameEn: 'Miscellaneous business and medical administration', nameZh: '综合商业与医疗行政管理', broadFieldId: 'business_comms', detailedFieldId: 'business' },
  { id: '13', nameEn: 'Operations logistics and e-commerce', nameZh: '运营物流与电子商务', broadFieldId: 'business_comms', detailedFieldId: 'business' },

  // 1. Business & Communications -> Communications and Journalism
  { id: '14', nameEn: 'Advertising and public relations', nameZh: '广告与公共关系学', broadFieldId: 'business_comms', detailedFieldId: 'communications_journalism' },
  { id: '15', nameEn: 'Communications and mass media', nameZh: '传播与大众媒体', broadFieldId: 'business_comms', detailedFieldId: 'communications_journalism' },
  { id: '16', nameEn: 'Journalism', nameZh: '新闻学', broadFieldId: 'business_comms', detailedFieldId: 'communications_journalism' },

  // 2. Career-Focused -> Industrial Arts, Consumer Services, and Recreation
  { id: '17', nameEn: 'Criminal justice and fire protection', nameZh: '刑事司法与消防安全', broadFieldId: 'career_focused', detailedFieldId: 'industrial_arts_rec' },
  { id: '18', nameEn: 'Family and consumer sciences', nameZh: '家庭与消费者科学', broadFieldId: 'career_focused', detailedFieldId: 'industrial_arts_rec' },
  { id: '19', nameEn: 'Military technologies', nameZh: '军事技术', broadFieldId: 'career_focused', detailedFieldId: 'industrial_arts_rec' },
  { id: '20', nameEn: 'Physical fitness, parks, recreation, and leisure', nameZh: '体育健身、公园与休闲娱乐', broadFieldId: 'career_focused', detailedFieldId: 'industrial_arts_rec' },
  { id: '21', nameEn: 'Industrial arts, consumer services, and recreation: other', nameZh: '工业技术、消费服务与休闲: 其他', broadFieldId: 'career_focused', detailedFieldId: 'industrial_arts_rec' },
  { id: '22', nameEn: 'Transportation sciences and technologies', nameZh: '交通运输科学与技术', broadFieldId: 'career_focused', detailedFieldId: 'industrial_arts_rec' },

  // 3. Education & Public Service -> Education
  { id: '23', nameEn: 'Art and music education', nameZh: '艺术与音乐教育', broadFieldId: 'education_public_service', detailedFieldId: 'education' },
  { id: '24', nameEn: 'Early childhood education', nameZh: '学前教育 / 早期幼儿教育', broadFieldId: 'education_public_service', detailedFieldId: 'education', specialTag: 'lowest', earningsValue: 51000 },
  { id: '25', nameEn: 'Elementary education', nameZh: '小学教育', broadFieldId: 'education_public_service', detailedFieldId: 'education' },
  { id: '26', nameEn: 'General education', nameZh: '普通教育学', broadFieldId: 'education_public_service', detailedFieldId: 'education' },
  { id: '27', nameEn: 'Language and drama education', nameZh: '语言与戏剧教育', broadFieldId: 'education_public_service', detailedFieldId: 'education' },
  { id: '28', nameEn: 'Mathematics teacher education', nameZh: '数学师范教育', broadFieldId: 'education_public_service', detailedFieldId: 'education' },
  { id: '29', nameEn: 'Miscellaneous education', nameZh: '综合教育学/其他教育', broadFieldId: 'education_public_service', detailedFieldId: 'education' },
  { id: '30', nameEn: 'Physical and health education teaching', nameZh: '体育与健康师范教育', broadFieldId: 'education_public_service', detailedFieldId: 'education' },
  { id: '31', nameEn: 'Science and computer teacher education', nameZh: '科学与计算机师范教育', broadFieldId: 'education_public_service', detailedFieldId: 'education' },
  { id: '32', nameEn: 'Secondary teacher education', nameZh: '中学师范教育', broadFieldId: 'education_public_service', detailedFieldId: 'education' },
  { id: '33', nameEn: 'Social science or history teacher education', nameZh: '人文社科或历史师范教育', broadFieldId: 'education_public_service', detailedFieldId: 'education' },
  { id: '34', nameEn: 'Special needs education', nameZh: '特殊教育', broadFieldId: 'education_public_service', detailedFieldId: 'education' },
  { id: '35', nameEn: 'Teacher education: multiple levels', nameZh: '多层次教师教育', broadFieldId: 'education_public_service', detailedFieldId: 'education', specialTag: 'lowest', earningsValue: 55000 },

  // 3. Education & Public Service -> Social Work and Public Service
  { id: '36', nameEn: 'Human services and community organization', nameZh: '社会服务与社区组织', broadFieldId: 'education_public_service', detailedFieldId: 'social_work_public_service' },
  { id: '37', nameEn: 'Public administration', nameZh: '公共行政管理', broadFieldId: 'education_public_service', detailedFieldId: 'social_work_public_service' },
  { id: '38', nameEn: 'Public policy', nameZh: '公共政策学', broadFieldId: 'education_public_service', detailedFieldId: 'social_work_public_service' },
  { id: '39', nameEn: 'Social work', nameZh: '社会工作', broadFieldId: 'education_public_service', detailedFieldId: 'social_work_public_service' },
  { id: '40', nameEn: 'Theology and religious vocations', nameZh: '神学与宗教职业', broadFieldId: 'education_public_service', detailedFieldId: 'social_work_public_service' },

  // 4. Healthcare -> Health
  { id: '41', nameEn: 'Communication disorders sciences and services', nameZh: '沟通障碍学与矫治服务', broadFieldId: 'healthcare', detailedFieldId: 'health' },
  { id: '42', nameEn: 'Community and public health', nameZh: '社区与公共卫生', broadFieldId: 'healthcare', detailedFieldId: 'health' },
  { id: '43', nameEn: 'General medical and health services', nameZh: '普通医疗与健康服务', broadFieldId: 'healthcare', detailedFieldId: 'health' },
  { id: '44', nameEn: 'Health and medical administrative services', nameZh: '医疗健康行政管理服务', broadFieldId: 'healthcare', detailedFieldId: 'health' },
  { id: '45', nameEn: 'Health and medical preparatory programs', nameZh: '医科预科项目', broadFieldId: 'healthcare', detailedFieldId: 'health' },
  { id: '46', nameEn: 'Nursing', nameZh: '护理学', broadFieldId: 'healthcare', detailedFieldId: 'health' },
  { id: '47', nameEn: 'Nutrition sciences', nameZh: '营养科学', broadFieldId: 'healthcare', detailedFieldId: 'health' },
  { id: '48', nameEn: 'Pharmacy and pharmaceutical sciences and administration', nameZh: '药学、药剂学及药政管理', broadFieldId: 'healthcare', detailedFieldId: 'health', specialTag: 'highest', earningsValue: 145000 },
  { id: '49', nameEn: 'Treatment therapy professions', nameZh: '康复治疗专业', broadFieldId: 'healthcare', detailedFieldId: 'health' },
  { id: '50', nameEn: 'Miscellaneous health medical professions', nameZh: '综合保健与医疗相关职业', broadFieldId: 'healthcare', detailedFieldId: 'health' },

  // 5. Humanities and the Arts -> Arts
  { id: '51', nameEn: 'Commercial art and graphic design', nameZh: '商业艺术与平面设计', broadFieldId: 'humanities_arts', detailedFieldId: 'arts' },
  { id: '52', nameEn: 'Drama and theater arts', nameZh: '戏剧与剧场艺术', broadFieldId: 'humanities_arts', detailedFieldId: 'arts' },
  { id: '53', nameEn: 'Film, video, and photographic arts', nameZh: '电影、视频与摄影艺术', broadFieldId: 'humanities_arts', detailedFieldId: 'arts' },
  { id: '54', nameEn: 'Fine arts', nameZh: '美术学', broadFieldId: 'humanities_arts', detailedFieldId: 'arts' },
  { id: '55', nameEn: 'Music', nameZh: '音乐学', broadFieldId: 'humanities_arts', detailedFieldId: 'arts' },
  { id: '56', nameEn: 'Studio arts', nameZh: '工作室艺术', broadFieldId: 'humanities_arts', detailedFieldId: 'arts' },
  { id: '57', nameEn: 'Visual and performing arts', nameZh: '视觉与表演艺术', broadFieldId: 'humanities_arts', detailedFieldId: 'arts' },

  // 5. Humanities and the Arts -> Humanities and Liberal Arts
  { id: '58', nameEn: 'Area ethnic and civilization studies', nameZh: '区域、族群与文明研究', broadFieldId: 'humanities_arts', detailedFieldId: 'humanities_liberal_arts' },
  { id: '59', nameEn: 'Art history and criticism', nameZh: '艺术史与艺术评论', broadFieldId: 'humanities_arts', detailedFieldId: 'humanities_liberal_arts' },
  { id: '60', nameEn: 'Composition and speech', nameZh: '写作与演讲学', broadFieldId: 'humanities_arts', detailedFieldId: 'humanities_liberal_arts' },
  { id: '61', nameEn: 'English language and literature', nameZh: '英语语言与文学', broadFieldId: 'humanities_arts', detailedFieldId: 'humanities_liberal_arts' },
  { id: '62', nameEn: 'French, German, Latin, and other common foreign language studies', nameZh: '法语、德语、拉丁语等常见外语研究', broadFieldId: 'humanities_arts', detailedFieldId: 'humanities_liberal_arts' },
  { id: '63', nameEn: 'History', nameZh: '历史学', broadFieldId: 'humanities_arts', detailedFieldId: 'humanities_liberal_arts' },
  { id: '64', nameEn: 'Humanities', nameZh: '人文学科综合', broadFieldId: 'humanities_arts', detailedFieldId: 'humanities_liberal_arts' },
  { id: '65', nameEn: 'Intercultural and international studies', nameZh: '跨文化与国际研究', broadFieldId: 'humanities_arts', detailedFieldId: 'humanities_liberal_arts' },
  { id: '66', nameEn: 'Liberal arts', nameZh: '通识文科', broadFieldId: 'humanities_arts', detailedFieldId: 'humanities_liberal_arts' },
  { id: '67', nameEn: 'Linguistics and comparative language and literature', nameZh: '语言学与比较语言文学', broadFieldId: 'humanities_arts', detailedFieldId: 'humanities_liberal_arts' },
  { id: '68', nameEn: 'Other foreign languages', nameZh: '其他外语', broadFieldId: 'humanities_arts', detailedFieldId: 'humanities_liberal_arts' },
  { id: '69', nameEn: 'Philosophy and religious studies', nameZh: '哲学与宗教研究', broadFieldId: 'humanities_arts', detailedFieldId: 'humanities_liberal_arts' },

  // 6. Multidisciplinary Studies -> Multi/Interdisciplinary Studies
  { id: '70', nameEn: 'Multi/interdisciplinary studies', nameZh: '多学科 / 交叉学科研究', broadFieldId: 'multidisciplinary', detailedFieldId: 'multi_disciplinary' },
  { id: '71', nameEn: 'Multidisciplinary or general science', nameZh: '多学科或通用科学', broadFieldId: 'multidisciplinary', detailedFieldId: 'multi_disciplinary' },

  // 7. Social Sciences -> Psychology
  { id: '72', nameEn: 'Cognitive science and biopsychology', nameZh: '认知科学与生物心理学', broadFieldId: 'social_sciences', detailedFieldId: 'psychology' },
  { id: '73', nameEn: 'Counseling psychology', nameZh: '咨询心理学', broadFieldId: 'social_sciences', detailedFieldId: 'psychology', specialTag: 'lowest', earningsValue: 55000 },
  { id: '74', nameEn: 'Industrial and organizational psychology', nameZh: '工业与组织心理学', broadFieldId: 'social_sciences', detailedFieldId: 'psychology' },
  { id: '75', nameEn: 'Psychology', nameZh: '心理学通用', broadFieldId: 'social_sciences', detailedFieldId: 'psychology' },
  { id: '76', nameEn: 'Social psychology', nameZh: '社会心理学', broadFieldId: 'social_sciences', detailedFieldId: 'psychology' },

  // 7. Social Sciences -> Social Sciences
  { id: '77', nameEn: 'Anthropology and archaeology', nameZh: '人类学与考古学', broadFieldId: 'social_sciences', detailedFieldId: 'social_sciences' },
  { id: '78', nameEn: 'Criminology', nameZh: '犯罪学', broadFieldId: 'social_sciences', detailedFieldId: 'social_sciences' },
  { id: '79', nameEn: 'Economics', nameZh: '经济学', broadFieldId: 'social_sciences', detailedFieldId: 'social_sciences' },
  { id: '80', nameEn: 'General social sciences', nameZh: '通用社会科学', broadFieldId: 'social_sciences', detailedFieldId: 'social_sciences' },
  { id: '81', nameEn: 'Geography', nameZh: '地理学', broadFieldId: 'social_sciences', detailedFieldId: 'social_sciences' },
  { id: '82', nameEn: 'Interdisciplinary social sciences', nameZh: '跨学科社会科学', broadFieldId: 'social_sciences', detailedFieldId: 'social_sciences' },
  { id: '83', nameEn: 'International relations', nameZh: '国际关系学', broadFieldId: 'social_sciences', detailedFieldId: 'social_sciences' },
  { id: '84', nameEn: 'Miscellaneous social sciences', nameZh: '综合社会科学', broadFieldId: 'social_sciences', detailedFieldId: 'social_sciences' },
  { id: '85', nameEn: 'Political science and government', nameZh: '政治学与政府研究', broadFieldId: 'social_sciences', detailedFieldId: 'social_sciences' },
  { id: '86', nameEn: 'Pre-law and legal studies', nameZh: '法学预科与法律研究', broadFieldId: 'social_sciences', detailedFieldId: 'social_sciences' },
  { id: '87', nameEn: 'Sociology', nameZh: '社会学', broadFieldId: 'social_sciences', detailedFieldId: 'social_sciences' },

  // 8. STEM -> Agriculture and Natural Resources
  { id: '88', nameEn: 'Agricultural economics', nameZh: '农业经济学', broadFieldId: 'stem', detailedFieldId: 'agriculture_resources' },
  { id: '89', nameEn: 'Agriculture production and management', nameZh: '农业生产与管理', broadFieldId: 'stem', detailedFieldId: 'agriculture_resources' },
  { id: '90', nameEn: 'Animal sciences', nameZh: '动物科学', broadFieldId: 'stem', detailedFieldId: 'agriculture_resources' },
  { id: '91', nameEn: 'Food science', nameZh: '食品科学', broadFieldId: 'stem', detailedFieldId: 'agriculture_resources' },
  { id: '92', nameEn: 'Forestry', nameZh: '林业学', broadFieldId: 'stem', detailedFieldId: 'agriculture_resources' },
  { id: '93', nameEn: 'General agriculture', nameZh: '普通农业', broadFieldId: 'stem', detailedFieldId: 'agriculture_resources' },
  { id: '94', nameEn: 'Miscellaneous agriculture', nameZh: '其他农业相关', broadFieldId: 'stem', detailedFieldId: 'agriculture_resources' },
  { id: '95', nameEn: 'Natural resources management', nameZh: '自然资源管理', broadFieldId: 'stem', detailedFieldId: 'agriculture_resources' },
  { id: '96', nameEn: 'Plant science and agronomy', nameZh: '植物科学与农学', broadFieldId: 'stem', detailedFieldId: 'agriculture_resources' },
  { id: '97', nameEn: 'Soil science', nameZh: '土壤科学', broadFieldId: 'stem', detailedFieldId: 'agriculture_resources' },

  // 8. STEM -> Architecture and Engineering
  { id: '98', nameEn: 'Aerospace engineering', nameZh: '航空航天工程', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '99', nameEn: 'Architectural engineering', nameZh: '建筑工程', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '100', nameEn: 'Architecture', nameZh: '建筑学', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '101', nameEn: 'Biomedical engineering', nameZh: '生物医学工程', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '102', nameEn: 'Chemical engineering', nameZh: '化学工程', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '103', nameEn: 'Civil engineering', nameZh: '土木工程', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '104', nameEn: 'Electrical engineering', nameZh: '电气工程 / 电子工程', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '105', nameEn: 'Engineering and industrial management', nameZh: '工程与工业管理', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '106', nameEn: 'Engineering mechanics, physics, and science', nameZh: '工程力学、物理与科学', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '107', nameEn: 'Engineering technologies', nameZh: '工程技术', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '108', nameEn: 'Environmental engineering', nameZh: '环境工程', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '109', nameEn: 'General engineering', nameZh: '通用工程学', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '110', nameEn: 'Geological and geophysical engineering', nameZh: '地质与地球物理工程', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '111', nameEn: 'Industrial and manufacturing engineering', nameZh: '工业与制造工程', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '112', nameEn: 'Industrial production technologies', nameZh: '工业生产技术', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '113', nameEn: 'Materials engineering and materials science', nameZh: '材料工程与材料科学', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '114', nameEn: 'Mechanical engineering', nameZh: '机械工程', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '115', nameEn: 'Mechanical engineering related technologies', nameZh: '机械工程相关技术', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '116', nameEn: 'Metallurgical engineering', nameZh: '冶金工程', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering', specialTag: 'highest', earningsValue: 125000 },
  { id: '117', nameEn: 'Mining and mineral engineering', nameZh: '矿业与矿物工程', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '118', nameEn: 'Miscellaneous engineering', nameZh: '综合工程/其他工程', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '119', nameEn: 'Miscellaneous engineering technologies', nameZh: '其他工程技术', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '120', nameEn: 'Naval architecture and marine engineering', nameZh: '船舶建筑与海洋工程', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '121', nameEn: 'Nuclear engineering', nameZh: '核工程', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering' },
  { id: '122', nameEn: 'Petroleum engineering', nameZh: '石油工程', broadFieldId: 'stem', detailedFieldId: 'architecture_engineering', specialTag: 'highest', earningsValue: 146000 },

  // 8. STEM -> Biology and Life Sciences
  { id: '123', nameEn: 'Biochemical sciences', nameZh: '生物化学科学', broadFieldId: 'stem', detailedFieldId: 'biology_life' },
  { id: '124', nameEn: 'Biology', nameZh: '生物学', broadFieldId: 'stem', detailedFieldId: 'biology_life' },
  { id: '125', nameEn: 'Botany', nameZh: '植物学', broadFieldId: 'stem', detailedFieldId: 'biology_life' },
  { id: '126', nameEn: 'Ecology', nameZh: '生态学', broadFieldId: 'stem', detailedFieldId: 'biology_life' },
  { id: '127', nameEn: 'Environmental science', nameZh: '环境科学', broadFieldId: 'stem', detailedFieldId: 'biology_life' },
  { id: '128', nameEn: 'Genetics', nameZh: '遗传学', broadFieldId: 'stem', detailedFieldId: 'biology_life' },
  { id: '129', nameEn: 'Microbiology', nameZh: '微生物学', broadFieldId: 'stem', detailedFieldId: 'biology_life' },
  { id: '130', nameEn: 'Miscellaneous biology', nameZh: '综合生物学/其他生物相关', broadFieldId: 'stem', detailedFieldId: 'biology_life' },
  { id: '131', nameEn: 'Molecular biology', nameZh: '分子生物学', broadFieldId: 'stem', detailedFieldId: 'biology_life' },
  { id: '132', nameEn: 'Neuroscience', nameZh: '神经科学', broadFieldId: 'stem', detailedFieldId: 'biology_life' },
  { id: '133', nameEn: 'Physiology', nameZh: '生理学', broadFieldId: 'stem', detailedFieldId: 'biology_life' },
  { id: '134', nameEn: 'Zoology', nameZh: '动物学', broadFieldId: 'stem', detailedFieldId: 'biology_life' },

  // 8. STEM -> Computers, Statistics, and Mathematics
  { id: '135', nameEn: 'Applied mathematics', nameZh: '应用数学', broadFieldId: 'stem', detailedFieldId: 'computers_stats_math' },
  { id: '136', nameEn: 'Computer and information systems', nameZh: '计算机安全与信息系统', broadFieldId: 'stem', detailedFieldId: 'computers_stats_math' },
  { id: '137', nameEn: 'Computer engineering', nameZh: '计算机工程', broadFieldId: 'stem', detailedFieldId: 'computers_stats_math' },
  { id: '138', nameEn: 'Computer science', nameZh: '计算机科学 (CS)', broadFieldId: 'stem', detailedFieldId: 'computers_stats_math' },
  { id: '139', nameEn: 'Information sciences', nameZh: '信息学/信息科学', broadFieldId: 'stem', detailedFieldId: 'computers_stats_math' },
  { id: '140', nameEn: 'Mathematics', nameZh: '数学', broadFieldId: 'stem', detailedFieldId: 'computers_stats_math' },
  { id: '141', nameEn: 'Statistics and decision science', nameZh: '统计学与决策科学', broadFieldId: 'stem', detailedFieldId: 'computers_stats_math' },
  { id: '142', nameEn: 'Computers, statistics, and mathematics: other', nameZh: '计算机、统计与数学: 其他', broadFieldId: 'stem', detailedFieldId: 'computers_stats_math' },

  // 8. STEM -> Physical Sciences
  { id: '143', nameEn: 'Astronomy and astrophysics', nameZh: '天文学与天体物理学', broadFieldId: 'stem', detailedFieldId: 'physical_sciences' },
  { id: '144', nameEn: 'Atmospheric sciences and meteorology', nameZh: '大气科学与气象学', broadFieldId: 'stem', detailedFieldId: 'physical_sciences' },
  { id: '145', nameEn: 'Chemistry', nameZh: '化学', broadFieldId: 'stem', detailedFieldId: 'physical_sciences' },
  { id: '146', nameEn: 'Geology and Earth science', nameZh: '地质学与地球科学', broadFieldId: 'stem', detailedFieldId: 'physical_sciences' },
  { id: '147', nameEn: 'Geosciences', nameZh: '地球系统科学', broadFieldId: 'stem', detailedFieldId: 'physical_sciences' },
  { id: '148', nameEn: 'Materials science', nameZh: '材料科学', broadFieldId: 'stem', detailedFieldId: 'physical_sciences' },
  { id: '149', nameEn: 'Nuclear, industrial radiology, and biological technologies', nameZh: '核技术、工业放射物理与生物技术', broadFieldId: 'stem', detailedFieldId: 'physical_sciences' },
  { id: '150', nameEn: 'Oceanography', nameZh: '海洋学', broadFieldId: 'stem', detailedFieldId: 'physical_sciences' },
  { id: '151', nameEn: 'Other physical sciences', nameZh: '其他物理科学', broadFieldId: 'stem', detailedFieldId: 'physical_sciences' },
  { id: '152', nameEn: 'Physics', nameZh: '物理学', broadFieldId: 'stem', detailedFieldId: 'physical_sciences' }
];

export function getBroadFieldById(id: string): BroadField | undefined {
  return broadFields.find(f => f.id === id);
}

export function getDetailedFieldById(id: string): DetailedField | undefined {
  return detailedFields.find(f => f.id === id);
}

export function getMajorsForBroadField(broadFieldId: string): Major[] {
  return majors.filter(m => m.broadFieldId === broadFieldId);
}

export function getMajorsForDetailedField(detailedFieldId: string): Major[] {
  return majors.filter(m => m.detailedFieldId === detailedFieldId);
}

export function searchMajors(query: string, broadFieldId?: string, detailedFieldId?: string): Major[] {
  const q = query.toLowerCase().trim();
  return majors.filter(m => {
    if (broadFieldId && m.broadFieldId !== broadFieldId) return false;
    if (detailedFieldId && m.detailedFieldId !== detailedFieldId) return false;
    if (!q) return true;
    return (
      m.nameEn.toLowerCase().includes(q) ||
      m.nameZh.toLowerCase().includes(q)
    );
  });
}

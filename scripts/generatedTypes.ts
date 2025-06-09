export interface P_BigCategory {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  color: string;
  MiddleCategory: P_MiddleCategory[];
}

export interface P_MiddleCategory {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  name: string;
  Lesson: P_Lesson[];
}

export interface P_Lesson {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  name: string;
  middleCategoryId: number;
  LessonImage: P_LessonImage[];
}

export interface P_Ticket {
  id: number;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  payedAt: Date;
  usedAt: Date;
  type: string;
  lessonLogId: number;
  userId: number;
  LessonLog: P_LessonLog;
  User: P_User;
}

export interface P_Payment {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  lessonLogId: number;
  LessonLog: P_LessonLog;
  User: P_User;
}

export interface P_LessonLogAuthorizedUser {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  userId: number;
  LessonLog: P_LessonLog;
  comment: string;
  User: P_User;
}

export interface P_LessonLog {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  isPassed: boolean;
  authorizerId: number;
  isPaid: boolean;
  userId: number;
  isSuspended: boolean;
  Comment: P_Comment[];
  User: P_User;
  LessonLogAuthorizedUser: P_LessonLogAuthorizedUser[];
  Ticket: P_Ticket[];
}

export interface P_VideoFromUser {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  lessonLogId: number;
  LessonLog: P_LessonLog;
  User: P_User;
}

export interface P_LessonImage {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  name: string;
  type: string;
  url: string;
  lessonId: number;
}

export interface P_Comment {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  message: string;
  read: boolean;
  userId: number;
  url: string;
  LessonLog: P_LessonLog;
  User: P_User;
}

export interface P_SystemChatRoom {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  userId: number;
  SystemChat: P_SystemChat[];
}

export interface P_SystemChat {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  message: string;
  url: string;
  read: boolean;
  systemChatRoomId: number;
  SystemChatRoom: P_SystemChatRoom;
  User: P_User;
}

export interface P_School {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  name: string;
  Game: P_Game[];
  SubjectNameMaster: P_SubjectNameMaster[];
  User: P_User[];
}

export interface P_LearningRoleMasterOnGame {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  name: string;
  maxCount: number;
  Game: P_Game;
  gameId: number;
}

export interface P_SubjectNameMaster {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  name: string;
  schoolId: number;
  School: P_School;
}

export interface P_Teacher {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  name: string;
  schoolId: number;
  email: string;
  password: string;
  role: string;
  tempResetCode: string;
  tempResetCodeExpired: Date;
  type: string;
  Game: P_Game[];
  TeacherClass: P_TeacherClass[];
}

export interface P_Student {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  name: string;
  gender: string;
  attendanceNumber: number;
  schoolId: number;
  Answer: P_Answer[];
  School: P_School;
  Squad: P_Squad[];
  UnfitFellow: P_UnfitFellow[];
  GameStudent: P_GameStudent[];
}

export interface P_UnfitFellow {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  Student: P_Student[];
}

export interface P_Classroom {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  grade: string;
  class: string;
  schoolId: number;
  Student: P_Student[];
}

export interface P_TeacherClass {
  id: number;
  sortOrder: number;
  teacherId: number;
  Classroom: P_Classroom;
  Teacher: P_Teacher;
}

export interface P_GameStudent {
  id: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  gameId: number;
  Game: P_Game;
  Student: P_Student;
}

export interface P_Game {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  name: string;
  secretKey: string;
  absentStudentIds: number[];
  teacherId: number;
  status: string;
  activeGroupId: number;
  activeQuestionPromptId: number;
  nthTime: number;
  randomTargetStudentIds: number[];
  task: string;
  Answer: P_Answer[];
  SubjectNameMaster: P_SubjectNameMaster;
  Teacher: P_Teacher;
  Group: P_Group[];
  GameStudent: P_GameStudent[];
  GroupCreateConfig: P_GroupCreateConfig;
}

export interface P_GroupCreateConfig {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  groupCreationMode: string;
  count: number;
  criteria: string;
  genderConfig: string;
  Game: P_Game;
  gameId: number;
}

export interface P_Group {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  name: string;
  Game: P_Game;
  Squad: P_Squad[];
  gameId: number;
}

export interface P_Squad {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  name: string;
  Group: P_Group;
  Student: P_Student[];
  StudentRole: P_StudentRole[];
}

export interface P_StudentRole {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  Squad: P_Squad;
  Student: P_Student;
  LearningRoleMasterOnGame: P_LearningRoleMasterOnGame;
  studentId: number;
  squadId: number;
}

export interface P_QuestionPrompt {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  gameId: number;
  Answer: P_Answer[];
  Game: P_Game;
}

export interface P_Answer {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  sortOrder: number;
  curiocity1: number;
  curiocity2: number;
  curiocity3: number;
  curiocity4: number;
  curiocity5: number;
  efficacy1: number;
  efficacy2: number;
  efficacy3: number;
  efficacy4: number;
  efficacy5: number;
  impression: string;
  gameId: number;
  questionPromptId: number;
  asSummary: boolean;
  lessonImpression: string;
  lessonSatisfaction: number;
  Game: P_Game;
  QuestionPrompt: P_QuestionPrompt;
  Student: P_Student;
}

export interface P_KaizenClient {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  organization: string;
  iconUrl: string;
  bannerUrl: string;
  website: string;
  note: string;
  public: boolean;
  introductionRequestedAt: Date;
  KaizenWork: P_KaizenWork[];
}

export interface P_KaizenReview {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  username: string;
  review: string;
  platform: string;
  KaizenClient: P_KaizenClient;
  kaizenClientId: number;
}

export interface P_KaizenWork {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  uuid: string;
  date: Date;
  title: string;
  subtitle: string;
  status: string;
  description: string;
  points: string;
  clientName: string;
  organization: string;
  dealPoint: number;
  toolPoint: number;
  impression: string;
  reply: string;
  jobCategory: string;
  systemCategory: string;
  collaborationTool: string;
  KaizenWorkImage: P_KaizenWorkImage[];
  KaizenClient: P_KaizenClient;
  kaizenClientId: number;
  allowShowClient: boolean;
  isPublic: boolean;
  correctionRequest: string;
}

export interface P_KaizenWorkImage {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  url: string;
  KaizenWork: P_KaizenWork;
  kaizenWorkId: number;
}

export interface P_KaizenCMS {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  contactPageMsg: string;
  principlePageMsg: string;
}

export interface P_Tokens {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  token: string;
}

export interface P_SaraFamily {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  children: SaraChild[];
}

export interface P_SaraParent {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  password: string;
  familyId: string;
}

export interface P_SaraChild {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  avatar: string;
  family: SaraFamily;
  familyId: string;
}

export interface P_SaraEvaluationItem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  title: string;
  order: number;
  active: boolean;
  family: SaraFamily;
  familyId: string;
  evaluationRequests: SaraEvaluationRequest[];
}

export interface P_SaraEvaluationScore {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  score: number;
  description: string;
  iconUrl: string;
  achievementImgUrl: string;
  animationLevel: string;
  evaluationItem: SaraEvaluationItem;
  evaluationItemId: string;
}

export interface P_SaraEvaluationRequest {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  date: Date;
  status: string;
  comment: string;
  openedByChild: boolean;
  child: SaraChild;
  childId: string;
  evaluationItemId: string;
  evaluationScoreId: string;
  approvedById: string;
}

export interface P_AqSaleCart {
  id: number;
  baseOrderId: string;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  date: Date;
  User: P_User;
  userId: number;
  AqCustomer: P_AqCustomer;
  aqCustomerId: number;
}

export interface P_AqSaleRecord {
  baseSaleRecordId: string;
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  date: Date;
  price: number;
  taxedPrice: number;
  remarks: string;
  User: P_User;
  userId: number;
  AqCustomer: P_AqCustomer;
  aqCustomerId: number;
  aqProductId: number;
  aqPriceOptionId: number;
  AqSaleCart: P_AqSaleCart;
  aqSaleCartId: number;
  aqCustomerSubscriptionId: number;
  subscriptionYearMonth: Date;
}

export interface P_AqProduct {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  productCode: string;
  name: string;
  AqProductCategoryMaster: P_AqProductCategoryMaster;
  aqProductCategoryMasterId: number;
  fromBase: boolean;
  cost: number;
  taxRate: number;
  stock: number;
  inInventoryManagement: boolean;
  AqPriceOption: P_AqPriceOption[];
  AqCustomerPriceOption: P_AqCustomerPriceOption[];
  AqCustomerSubscription: P_AqCustomerSubscription[];
  aqDefaultShiireAqCustomerId: number;
  AqInventoryByMonth: P_AqInventoryByMonth[];
}

export interface P_AqPriceOption {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  AqProduct: P_AqProduct;
  aqProductId: number;
  AqCustomerPriceOption: P_AqCustomerPriceOption[];
}

export interface P_AqCustomer {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  email: string;
  customerNumber: string;
  fromBase: boolean;
  companyName: string;
  jobTitle: string;
  name: string;
  defaultPaymentMethod: string;
  furikomisakiCD: string;
  tel: string;
  tel2: string;
  fax: string;
  invoiceNumber: string;
  status: string;
  domestic: boolean;
  postal: string;
  state: string;
  city: string;
  street: string;
  building: string;
  remarks: string;
  firstVisitDate: Date;
  lastVisitDate: Date;
  maintananceYear: number;
  maintananceMonth: number;
  AqSaleCart: P_AqSaleCart[];
  AqCustomerPriceOption: P_AqCustomerPriceOption[];
  AqCustomerDealerMidTable: P_AqCustomerDealerMidTable[];
  AqCustomerServiceTypeMidTable: P_AqCustomerServiceTypeMidTable[];
  User: P_User;
  userId: number;
  AqInventoryRegister: P_AqInventoryRegister[];
  AqProduct: P_AqProduct[];
}

export interface P_AqCustomerSubscription {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  active: boolean;
  maintananceYear: number;
  AqCustomer: P_AqCustomer;
  aqCustomerId: number;
  aqDeviceMasterId: number;
  aqProductId: number;
  AqSaleRecord: P_AqSaleRecord[];
}

export interface P_AqCustomerPriceOption {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  AqCustomer: P_AqCustomer;
  aqCustomerId: number;
  aqProductId: number;
  aqPriceOptionId: number;
}

export interface P_AqCustomerRecord {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  date: Date;
  status: string;
  type: string;
  content: string;
  remarks: string;
  AqCustomerRecordAttachment: P_AqCustomerRecordAttachment[];
  aqCustomerId: number;
  userId: number;
}

export interface P_AqCustomerRecordAttachment {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  title: string;
  url: string;
  AqCustomerRecord: P_AqCustomerRecord;
  aqCustomerRecordId: number;
}

export interface P_AqSupportGroupMaster {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  color: string;
  AqCustomerSupportGroupMidTable: P_AqCustomerSupportGroupMidTable[];
}

export interface P_AqProductCategoryMaster {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  color: string;
  AqProduct: P_AqProduct[];
}

export interface P_AqServiecTypeMaster {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  color: string;
  AqCustomerServiceTypeMidTable: P_AqCustomerServiceTypeMidTable[];
}

export interface P_AqDealerMaster {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  color: string;
  AqCustomerDealerMidTable: P_AqCustomerDealerMidTable[];
}

export interface P_aqDeviceMaster {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  color: string;
  AqCustomerDeviceMidTable: P_AqCustomerDeviceMidTable[];
}

export interface P_AqCustomerDealerMidTable {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  AqCustomer: P_AqCustomer;
  aqCustomerId: number;
  aqDealerMasterId: number;
}

export interface P_AqCustomerServiceTypeMidTable {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  AqCustomer: P_AqCustomer;
  aqCustomerId: number;
  aqServiecTypeMasterId: number;
}

export interface P_AqCustomerDeviceMidTable {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  AqCustomer: P_AqCustomer;
  aqCustomerId: number;
  aqDeviceMasterId: number;
}

export interface P_AqCustomerSupportGroupMidTable {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  from: Date;
  AqSupportGroupMaster: P_AqSupportGroupMaster;
  aqSupportGroupMasterId: number;
  AqCustomer: P_AqCustomer;
  aqCustomerId: number;
}

export interface P_AqInventoryRegister {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  aqProductId: number;
  date: Date;
  remarks: string;
  AqProduct: P_AqProduct;
  AqCustomer: P_AqCustomer;
}

export interface P_AqInventoryByMonth {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  count: number;
  yearMonth: Date;
  aqProductId: number;
}

export interface P_Department {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  code: string;
  name: string;
  User: P_User[];
}

export interface P_User {
  id: number;
  code: string;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  active: boolean;
  hiredAt: Date;
  yukyuCategory: string;
  name: string;
  email: string;
  password: string;
  type: string;
  role: string;
  tempResetCode: string;
  tempResetCodeExpired: Date;
  storeId: number;
  schoolId: number;
  rentaStoreId: number;
  type2: string;
  shopId: number;
  membershipName: string;
  damageNameMasterId: number;
  color: string;
  tell: string;
  app: string;
  apps: string[];
  employeeCode: string;
  phone: string;
  School: P_School;
  VideoFromUser: P_VideoFromUser[];
  LessonLog: P_LessonLog[];
  Payment: P_Payment[];
  SystemChatRoom: P_SystemChatRoom;
  Ticket: P_Ticket[];
  SohkenCar: P_SohkenCar[];
  UserRole: P_UserRole[];
  AqCustomerRecord: P_AqCustomerRecord[];
  AqCustomer: P_AqCustomer[];
  tbmBaseId: number;
  TbmDriveSchedule: P_TbmDriveSchedule[];
  OdometerInput: P_OdometerInput[];
  DayRemarksUser: P_DayRemarksUser[];
  PurchaseRequest: P_PurchaseRequest[];
  Approval: P_Approval[];
  KyuyoTableRecord: P_KyuyoTableRecord[];
  departmentId: number;
}

export interface P_ReleaseNotes {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  rootPath: string;
  msg: string;
  confirmedUserIds: number[];
}

export interface P_GoogleAccessToken {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  email: string;
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  id_token: string;
  expiry_date: Date;
  tokenJSON: string;
}

export interface P_RoleMaster {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  description: string;
  color: string;
  apps: string[];
}

export interface P_UserRole {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  User: P_User;
  userId: number;
  roleMasterId: number;
}

export interface P_ChainMethodLock {
  id: number;
  isLocked: boolean;
  expiresAt: Date;
  updatedAt: Date;
}

export interface P_Calendar {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  date: Date;
  holidayType: string;
}

export interface P_Product {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  code: string;
  name: string;
  PurchaseRequest: P_PurchaseRequest[];
  shiireSakiId: number;
}

export interface P_ShiireSaki {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  code: string;
  name: string;
  Product: P_Product[];
}

export interface P_PurchaseRequest {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  purchaseType: string;
  quantity: number;
  result: string;
  approverComment: string;
  trashed: boolean;
  emailSentAt: Date;
  Approval: P_Approval[];
  userId: number;
  productId: number;
}

export interface P_LeaveRequest {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  from: Date;
  leaveType: string;
  reason: string;
  Approval: P_Approval[];
  userId: number;
}

export interface P_Approval {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  index: number;
  status: string;
  notifiedAt: Date;
  comment: string;
  PurchaseRequest: P_PurchaseRequest;
  purchaseRequestId: number;
  LeaveRequest: P_LeaveRequest;
  leaveRequestId: number;
  User: P_User;
  userId: number;
}

export interface P_PrefCity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  pref: string;
  Genba: P_Genba[];
}

export interface P_DayRemarksUser {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  kyuka: boolean;
  kyukaTodoke: boolean;
  DayRemarks: P_DayRemarks;
  dayRemarksId: number;
  userId: number;
}

export interface P_Genba {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  defaultStartTime: string;
  construction: string;
  houseHoldsCount1: number;
  houseHoldsCount2: number;
  houseHoldsCount3: number;
  houseHoldsCount4: number;
  houseHoldsCount5: number;
  houseHoldsCount6: number;
  houseHoldsCount7: number;
  warningString: string;
  zip: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  PrefCity: P_PrefCity;
  prefCityId: number;
  GenbaDayShift: P_GenbaDayShift[];
  GenbaDaySoukenCar: P_GenbaDaySoukenCar[];
  archived: boolean;
}

export interface P_SohkenCar {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  plate: string;
  role: string;
  GenbaDaySoukenCar: P_GenbaDaySoukenCar[];
  userId: number;
}

export interface P_GenbaDay {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  date: Date;
  remarks: string;
  ninku: number;
  finished: boolean;
  active: boolean;
  overStuffCount: number;
  status: string;
  ninkuFullfilled: boolean;
  isLastFullfilledDay: boolean;
  allAssignedNinkuTillThisDay: number;
  allRequiredNinku: number;
  Genba: P_Genba;
  genbaId: number;
  GenbaDaySoukenCar: P_GenbaDaySoukenCar[];
}

export interface P_GenbaTask {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  color: string;
  from: Date;
  to: Date;
  requiredNinku: number;
  subTask: string;
  remarks: string;
  Genba: P_Genba;
  genbaId: number;
}

export interface P_GenbaDayTaskMidTable {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  GenbaDay: P_GenbaDay;
  genbaDayId: number;
  genbaTaskId: number;
}

export interface P_GenbaDaySoukenCar {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  GenbaDay: P_GenbaDay;
  genbaDayId: number;
  sohkenCarId: number;
  genbaId: number;
}

export interface P_GenbaDayShift {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  date: Date;
  from: string;
  to: string;
  important: boolean;
  shokucho: boolean;
  directGo: boolean;
  directReturn: boolean;
  User: P_User;
  userId: number;
  genbaDayId: number;
  genbaId: number;
}

export interface P_GenbaTaskMaster {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
}

export interface P_DayRemarks {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  date: Date;
  bikou: string;
  shinseiGyomu: string;
  ninkuCount: number;
  nippoDocsUrl: string;
  DayRemarksUser: P_DayRemarksUser[];
}

export interface P_DayRemarksFile {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  DayRemarks: P_DayRemarks;
  dayRemarksId: number;
}

export interface P_SohkenGoogleCalendar {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  calendarId: string;
  date: Date;
  endAt: Date;
  summary: string;
}

export interface P_ForcedWorkDay {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  date: Date;
}

export interface P_StockConfig {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  type: string;
  name: string;
  value: number;
}

export interface P_Stock {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  favorite: number;
  heldCount: number;
  averageBuyPrice: number;
  profit: number;
  Code: string;
  Date: Date;
  CompanyName: string;
  CompanyNameEnglish: string;
  Sector17Code: string;
  Sector17CodeName: string;
  Sector33Code: string;
  Sector33CodeName: string;
  ScaleCategory: string;
  MarketCode: string;
  MarketCodeName: string;
  last_Date: Date;
  last_Open: number;
  last_High: number;
  last_Low: number;
  last_Close: number;
  last_UpperLimit: string;
  last_LowerLimit: string;
  last_Volume: number;
  last_TurnoverValue: string;
  last_AdjustmentFactor: number;
  last_AdjustmentOpen: number;
  last_AdjustmentHigh: number;
  last_AdjustmentLow: number;
  last_AdjustmentClose: number;
  last_AdjustmentVolume: number;
  last_updatedAt: Date;
  last_riseRate: number;
  last_josho: boolean;
  last_dekidakaJosho: boolean;
  last_renzokuJosho: boolean;
  last_takaneBreakout: boolean;
  last_idoHeikinKairiJosho: boolean;
  last_spike: boolean;
  last_spikeFall: boolean;
  last_spikeRise: boolean;
  last_recentCrash: boolean;
  last_goldenCross: boolean;
  last_rsiOversold: boolean;
  last_crashAndRebound: boolean;
  last_consecutivePositiveCloses: boolean;
  last_macdBullish: boolean;
  last_macdLine: number;
  last_macdSignal: number;
  last_macdHistogram: number;
  last_ma5: number;
  last_ma20: number;
  last_ma60: number;
  last_rsi: number;
  StockHistory: P_StockHistory[];
}

export interface P_StockHistory {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  Date: Date;
  Code: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  UpperLimit: string;
  LowerLimit: string;
  Volume: number;
  TurnoverValue: string;
  AdjustmentFactor: number;
  AdjustmentOpen: number;
  AdjustmentHigh: number;
  AdjustmentLow: number;
  AdjustmentClose: number;
  AdjustmentVolume: number;
  riseRate: number;
  josho: boolean;
  dekidakaJosho: boolean;
  renzokuJosho: boolean;
  takaneBreakout: boolean;
  idoHeikinKairiJosho: boolean;
  spike: boolean;
  spikeFall: boolean;
  spikeRise: boolean;
  recentCrash: boolean;
  goldenCross: boolean;
  rsiOversold: boolean;
  crashAndRebound: boolean;
  consecutivePositiveCloses: boolean;
  macdBullish: boolean;
  macdLine: number;
  macdSignal: number;
  macdHistogram: number;
  ma5: number;
  ma20: number;
  ma60: number;
  rsi: number;
  Stock: P_Stock;
  stockId: number;
}

export interface P_TbmBase {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  code: string;
  name: string;
  User: P_User[];
  TbmRouteGroup: P_TbmRouteGroup[];
  TbmProduct: P_TbmProduct[];
  TbmBase_MonthConfig: P_TbmBase_MonthConfig[];
}

export interface P_TbmRouteGroupCalendar {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  date: Date;
  remark: string;
  TbmRouteGroup: P_TbmRouteGroup;
  tbmRouteGroupId: number;
}

export interface P_TbmBase_MonthConfig {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  code: string;
  yearMonth: Date;
  keiyuPerLiter: number;
  TbmBase: P_TbmBase;
  tbmBaseId: number;
}

export interface P_TbmVehicle {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  code: string;
  frameNo: string;
  vehicleNumber: string;
  type: string;
  shape: string;
  airSuspension: string;
  oilTireParts: string;
  maintenance: string;
  insurance: string;
  shodoTorokubi: Date;
  sakenManryobi: Date;
  hokenManryobi: Date;
  sankagetsuTenkenbi: Date;
  sokoKyori: number;
  jibaisekiHokenCompany: string;
  jibaisekiManryobi: Date;
  jidoshaHokenCompany: string;
  jidoshaManryobi: Date;
  kamotsuHokenCompany: string;
  kamotsuManryobi: Date;
  sharyoHokenCompany: string;
  sharyoManryobi: Date;
  etcCardNumber: string;
  etcCardExpiration: Date;
  TbmFuelCard: P_TbmFuelCard[];
  TbmBase: P_TbmBase;
  tbmBaseId: number;
  OdometerInput: P_OdometerInput[];
  User: P_User;
  userId: number;
  TbmVehicleMaintenanceRecord: P_TbmVehicleMaintenanceRecord[];
}

export interface P_TbmFuelCard {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
  TbmVehicle: P_TbmVehicle;
  tbmVehicleId: number;
}

export interface P_TbmVehicleMaintenanceRecord {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  date: Date;
  price: number;
  type: string;
  TbmVehicle: P_TbmVehicle;
  tbmVehicleId: number;
}

export interface P_TbmRouteGroup {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  code: string;
  name: string;
  pickupTime: string;
  vehicleType: string;
  seikyuKbn: string;
  TbmBase: P_TbmBase;
  tbmBaseId: number;
  TbmMonthlyConfigForRouteGroup: P_TbmMonthlyConfigForRouteGroup[];
  Mid_TbmRouteGroup_TbmCustomer: P_Mid_TbmRouteGroup_TbmCustomer;
  TbmRouteGroupCalendar: P_TbmRouteGroupCalendar[];
}

export interface P_TbmRouteGroupFee {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  startDate: Date;
  futaiFee: number;
  TbmRouteGroup: P_TbmRouteGroup;
  tbmRouteGroupId: number;
}

export interface P_TbmMonthlyConfigForRouteGroup {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  yearMonth: Date;
  tsukoryoSeikyuGaku: number;
  seikyuKaisu: number;
  numberOfTrips: number;
  TbmRouteGroup: P_TbmRouteGroup;
  tbmRouteGroupId: number;
}

export interface P_TbmProduct {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  code: string;
  name: string;
  Mid_TbmRouteGroup_TbmProduct: P_Mid_TbmRouteGroup_TbmProduct[];
  tbmBaseId: number;
}

export interface P_Mid_TbmRouteGroup_TbmProduct {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  TbmRouteGroup: P_TbmRouteGroup;
  tbmRouteGroupId: number;
  TbmProduct: P_TbmProduct;
  tbmProductId: number;
}

export interface P_Mid_TbmRouteGroup_TbmCustomer {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  TbmRouteGroup: P_TbmRouteGroup;
  tbmRouteGroupId: number;
  TbmCustomer: P_TbmCustomer;
  tbmCustomerId: number;
}

export interface P_TbmBillingAddress {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  name: string;
}

export interface P_TbmInvoiceDetail {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  numberOfTrips: number;
  toll: number;
}

export interface P_TbmCustomer {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  code: string;
  name: string;
  address: string;
  phoneNumber: string;
  faxNumber: string;
  bankInformation: string;
  Mid_TbmRouteGroup_TbmCustomer: P_Mid_TbmRouteGroup_TbmCustomer[];
  tbmBaseId: number;
}

export interface P_TbmRefuelHistory {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  date: Date;
  odometer: number;
  TbmVehicle: P_TbmVehicle;
  tbmVehicleId: number;
  userId: number;
}

export interface P_TbmCarWashHistory {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  date: Date;
  TbmVehicle: P_TbmVehicle;
  tbmVehicleId: number;
  userId: number;
}

export interface P_TbmDriveSchedule {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  date: Date;
  Q_generalHighwayFee: number;
  User: P_User;
  userId: number;
  TbmVehicle: P_TbmVehicle;
  tbmVehicleId: number;
  TbmRouteGroup: P_TbmRouteGroup;
  tbmRouteGroupId: number;
  confirmed: boolean;
  approved: boolean;
  TbmBase: P_TbmBase;
  tbmBaseId: number;
}

export interface P_TbmEtcMeisai {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  groupIndex: number;
  info: any[];
  TbmVehicle: P_TbmVehicle;
  tbmVehicleId: number;
  TbmDriveSchedule: P_TbmDriveSchedule;
  tbmDriveScheduleId: number;
}

export interface P_OdometerInput {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  odometerStart: number;
  date: Date;
  tbmVehicleId: number;
  userId: number;
}

export interface P_UserWorkStatus {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  date: Date;
  remark: string;
  User: P_User;
  userId: number;
}

export interface P_KyuyoTableRecord {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  other1: number;
  other2: number;
  shokuhi: number;
  maebaraikin: number;
  rate: number;
  yearMonth: Date;
  userId: number;
}


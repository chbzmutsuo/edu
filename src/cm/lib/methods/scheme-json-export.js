
export const prismaSchemaString = `

model BigCategory {
 id             Int              @id @default(autoincrement())
 createdAt      DateTime         @default(now())
 updatedAt      DateTime?        @default(now()) @updatedAt()
 active         Boolean          @default(true)
 sortOrder      Float
 name           String           @unique
 color          String?
 MiddleCategory MiddleCategory[]
}

model MiddleCategory {
 id            Int         @id @default(autoincrement())
 createdAt     DateTime    @default(now())
 updatedAt     DateTime?   @default(now()) @updatedAt()
 active        Boolean     @default(true)
 sortOrder     Float       @default(0)
 name          String
 bigCategoryId Int
 Lesson        Lesson[]
 BigCategory   BigCategory @relation(fields: [bigCategoryId], references: [id], onDelete: Cascade)

 // @@unique([bigCategoryId, name], name: "unique_bigCategoryId_name")
}

model Lesson {
 id               Int            @id @default(autoincrement())
 createdAt        DateTime       @default(now())
 updatedAt        DateTime?      @default(now()) @updatedAt()
 active           Boolean        @default(true)
 sortOrder        Float          @default(0)
 name             String
 description      String?
 middleCategoryId Int
 MiddleCategory   MiddleCategory @relation(fields: [middleCategoryId], references: [id], onDelete: Cascade)
 LessonImage      LessonImage[]
 LessonLog        LessonLog[]

 // @@unique([middleCategoryId, name], name: "unique_middleCategoryId_name")
}

model Ticket {
 id        Int       @id @default(autoincrement())
 active    Boolean   @default(true)
 sortOrder Float     @default(0)
 createdAt DateTime? @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 payedAt   DateTime?
 usedAt    DateTime?
 type      String?

 lessonLogId Int?
 userId      Int?
 LessonLog   LessonLog? @relation(fields: [lessonLogId], references: [id], onDelete: Cascade)
 User        User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Payment {
 id          Int       @id @default(autoincrement())
 createdAt   DateTime  @default(now())
 updatedAt   DateTime? @default(now()) @updatedAt()
 active      Boolean   @default(true)
 sortOrder   Float     @default(0)
 lessonLogId Int
 userId      Int
 LessonLog   LessonLog @relation(fields: [lessonLogId], references: [id], onDelete: Cascade)
 User        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model LessonLogAuthorizedUser {
 id          Int       @id @default(autoincrement())
 createdAt   DateTime  @default(now())
 updatedAt   DateTime? @default(now()) @updatedAt()
 active      Boolean   @default(true)
 sortOrder   Float     @default(0)
 userId      Int
 lessonLogId Int
 LessonLog   LessonLog @relation(fields: [lessonLogId], references: [id], onDelete: Cascade)

 comment String?

 User User @relation(fields: [userId], references: [id], onDelete: Cascade)

 @@unique([userId, lessonLogId], name: "unique_userId_lessonLogId")
}

model LessonLog {
 id           Int       @id @default(autoincrement())
 createdAt    DateTime  @default(now())
 updatedAt    DateTime? @default(now()) @updatedAt()
 active       Boolean   @default(true)
 sortOrder    Float     @default(0)
 isPassed     Boolean   @default(false)
 authorizerId Int?
 isPaid       Boolean   @default(false)
 userId       Int
 lessonId     Int
 isSuspended  Boolean   @default(false)
 Comment      Comment[]
 Lesson       Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
 User         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

 LessonLogAuthorizedUser LessonLogAuthorizedUser[]
 Payment                 Payment[]
 Ticket                  Ticket[]
 VideoFromUser           VideoFromUser[]

 @@unique([userId, lessonId], name: "unique_userId_lessonId")
}

model VideoFromUser {
 id          Int       @id @default(autoincrement())
 createdAt   DateTime  @default(now())
 updatedAt   DateTime? @default(now()) @updatedAt()
 active      Boolean   @default(true)
 sortOrder   Float     @default(0)
 lessonLogId Int
 userId      Int
 LessonLog   LessonLog @relation(fields: [lessonLogId], references: [id], onDelete: Cascade)
 User        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model LessonImage {
 id          Int       @id @default(autoincrement())
 createdAt   DateTime  @default(now())
 updatedAt   DateTime? @default(now()) @updatedAt()
 active      Boolean   @default(true)
 sortOrder   Float     @default(0)
 name        String
 description String?
 type        String?
 url         String?
 lessonId    Int
 Lesson      Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)

 @@unique([lessonId, name], name: "unique_lessonId_name")
}

model Comment {
 id          Int       @id @default(autoincrement())
 createdAt   DateTime  @default(now())
 updatedAt   DateTime? @default(now()) @updatedAt()
 active      Boolean   @default(true)
 sortOrder   Float     @default(0)
 message     String?
 read        Boolean   @default(false)
 userId      Int
 lessonLogId Int
 url         String?
 LessonLog   LessonLog @relation(fields: [lessonLogId], references: [id], onDelete: Cascade)
 User        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model SystemChatRoom {
 id         Int          @id @default(autoincrement())
 createdAt  DateTime     @default(now())
 updatedAt  DateTime?    @default(now()) @updatedAt()
 active     Boolean      @default(true)
 sortOrder  Float        @default(0)
 userId     Int          @unique
 SystemChat SystemChat[]
 User       User         @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model SystemChat {
 id               Int            @id @default(autoincrement())
 createdAt        DateTime       @default(now())
 updatedAt        DateTime?      @default(now()) @updatedAt()
 active           Boolean        @default(true)
 sortOrder        Float          @default(0)
 message          String?
 url              String?
 read             Boolean        @default(false)
 systemChatRoomId Int
 userId           Int
 SystemChatRoom   SystemChatRoom @relation(fields: [systemChatRoomId], references: [id], onDelete: Cascade)
 User             User           @relation("user", fields: [userId], references: [id], onDelete: Cascade)
}

 
model School {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()

 active            Boolean             @default(true)
 sortOrder         Float               @default(0)
 name              String
 Classroom         Classroom[]
 Game              Game[]
 Student           Student[]
 SubjectNameMaster SubjectNameMaster[]
 Teacher           Teacher[]
 User              User[]
}

model LearningRoleMasterOnGame {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 active    Boolean   @default(true)
 sortOrder Float     @default(0)
 name      String
 color     String?
 maxCount  Int?

 Game        Game          @relation(fields: [gameId], references: [id], onDelete: Cascade)
 gameId      Int
 StudentRole StudentRole[]
}

model SubjectNameMaster {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 active    Boolean   @default(true)
 sortOrder Float     @default(0)
 name      String
 color     String?
 schoolId  Int
 Game      Game[]
 School    School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)
}

model Teacher {
 id                   Int       @id @default(autoincrement())
 createdAt            DateTime  @default(now())
 updatedAt            DateTime? @default(now()) @updatedAt()
 active               Boolean   @default(true)
 sortOrder            Float     @default(0)
 name                 String
 kana                 String?
 schoolId             Int?
 email                String?   @unique
 password             String?
 role                 String?
 tempResetCode        String?
 tempResetCodeExpired DateTime?
 type                 String?
 Game                 Game[]

 School       School?        @relation(fields: [schoolId], references: [id], onDelete: Cascade)
 TeacherClass TeacherClass[]
}

model Student {
 id               Int       @id @default(autoincrement())
 createdAt        DateTime  @default(now())
 updatedAt        DateTime? @default(now()) @updatedAt()
 active           Boolean   @default(true)
 sortOrder        Float     @default(0)
 name             String
 kana             String?
 gender           String?
 attendanceNumber Int?
 schoolId         Int
 classroomId      Int
 Answer           Answer[]

 Classroom   Classroom     @relation(fields: [classroomId], references: [id], onDelete: Cascade)
 School      School        @relation(fields: [schoolId], references: [id], onDelete: Cascade)
 Squad       Squad[]       @relation("SquadToStudent")
 UnfitFellow UnfitFellow[] @relation("StudentToUnfitFellow")
 GameStudent GameStudent[]
 StudentRole StudentRole[]

 @@unique([schoolId, classroomId, attendanceNumber], name: "unique_schoolId_classroomId_attendanceNumber")
}

model UnfitFellow {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 active    Boolean   @default(true)
 sortOrder Float     @default(0)
 Student   Student[] @relation("StudentToUnfitFellow")
}

model Classroom {
 id           Int            @id @default(autoincrement())
 createdAt    DateTime       @default(now())
 updatedAt    DateTime?      @default(now()) @updatedAt()
 active       Boolean        @default(true)
 sortOrder    Float          @default(0)
 grade        String?
 class        String?
 schoolId     Int
 School       School         @relation(fields: [schoolId], references: [id], onDelete: Cascade)
 Student      Student[]
 TeacherClass TeacherClass[]

 @@unique([schoolId, grade, class], name: "unique_schoolId_grade_class")
}

model TeacherClass {
 id          Int       @id @default(autoincrement())
 sortOrder   Float     @default(0)
 teacherId   Int
 classroomId Int
 Classroom   Classroom @relation(fields: [classroomId], references: [id], onDelete: Cascade)
 Teacher     Teacher   @relation(fields: [teacherId], references: [id], onDelete: Cascade)

 @@unique([teacherId, classroomId], name: "unique_teacherId_classroomId")
}

model GameStudent {
 id        Int       @id @default(autoincrement())
 sortOrder Float     @default(0)
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 gameId    Int
 studentId Int
 Game      Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)
 Student   Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)

 @@unique([gameId, studentId], name: "unique_gameId_studentId")
}

model Game {
 id                       Int                        @id @default(autoincrement())
 createdAt                DateTime                   @default(now())
 updatedAt                DateTime?                  @default(now()) @updatedAt()
 active                   Boolean                    @default(true)
 sortOrder                Float                      @default(0)
 name                     String
 date                     DateTime
 secretKey                String                     @unique
 absentStudentIds         Int[]
 schoolId                 Int
 teacherId                Int
 subjectNameMasterId      Int?
 status                   String?
 activeGroupId            Int?
 activeQuestionPromptId   Int?
 nthTime                  Int?
 randomTargetStudentIds   Int[]
 learningContent          String?
 task                     String?
 Answer                   Answer[]
 School                   School                     @relation(fields: [schoolId], references: [id], onDelete: Cascade)
 SubjectNameMaster        SubjectNameMaster?         @relation(fields: [subjectNameMasterId], references: [id], onDelete: Cascade)
 Teacher                  Teacher                    @relation(fields: [teacherId], references: [id], onDelete: Cascade)
 Group                    Group[]
 QuestionPrompt           QuestionPrompt[]
 GameStudent              GameStudent[]
 LearningRoleMasterOnGame LearningRoleMasterOnGame[]
 GroupCreateConfig        GroupCreateConfig?
}

model GroupCreateConfig {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 active    Boolean   @default(true)
 sortOrder Float     @default(0)

 groupCreationMode String?
 count             Int?
 criteria          String?
 genderConfig      String?

 Game   Game @relation(fields: [gameId], references: [id])
 gameId Int  @unique
}

model Group {
 id             Int             @id @default(autoincrement())
 createdAt      DateTime        @default(now())
 updatedAt      DateTime?       @default(now()) @updatedAt()
 active         Boolean         @default(true)
 sortOrder      Float           @default(0)
 name           String
 isSaved        Boolean
 Game           Game            @relation(fields: [gameId], references: [id], onDelete: Cascade)
 Squad          Squad[]
 QuestionPrompt QuestionPrompt? @relation(fields: [questionPromptId], references: [id], onDelete: Cascade)

 gameId           Int
 questionPromptId Int?
}

model Squad {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 active    Boolean   @default(true)
 sortOrder Float     @default(0)
 name      String
 groupId   Int
 Group     Group     @relation(fields: [groupId], references: [id], onDelete: Cascade)
 Student   Student[] @relation("SquadToStudent")

 StudentRole StudentRole[]
}

model StudentRole {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 active    Boolean   @default(true)
 sortOrder Float     @default(0)

 Squad Squad @relation(fields: [squadId], references: [id])

 Student Student @relation(fields: [studentId], references: [id])

 LearningRoleMasterOnGame   LearningRoleMasterOnGame @relation(fields: [learningRoleMasterOnGameId], references: [id])
 studentId                  Int
 learningRoleMasterOnGameId Int
 squadId                    Int
}

model QuestionPrompt {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 active    Boolean   @default(true)
 sortOrder Float     @default(0)
 gameId    Int
 asSummary Boolean   @default(false)
 Answer    Answer[]
 Group     Group[]
 Game      Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)
}

model Answer {
 id                 Int             @id @default(autoincrement())
 createdAt          DateTime        @default(now())
 updatedAt          DateTime?       @default(now()) @updatedAt()
 active             Boolean         @default(true)
 sortOrder          Float           @default(0)
 curiocity1         Int?
 curiocity2         Int?
 curiocity3         Int?
 curiocity4         Int?
 curiocity5         Int?
 efficacy1          Int?
 efficacy2          Int?
 efficacy3          Int?
 efficacy4          Int?
 efficacy5          Int?
 impression         String?
 gameId             Int
 studentId          Int
 questionPromptId   Int?
 asSummary          Boolean         @default(false)
 lessonImpression   String?
 lessonSatisfaction Int?
 Game               Game            @relation(fields: [gameId], references: [id], onDelete: Cascade)
 QuestionPrompt     QuestionPrompt? @relation(fields: [questionPromptId], references: [id], onDelete: Cascade)
 Student            Student         @relation(fields: [studentId], references: [id], onDelete: Cascade)

 @@unique([gameId, studentId, questionPromptId], name: "unique_gameId_studentId_questionPromptId")
}

 
model KaizenClient {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 name                    String?
 organization            String?
 iconUrl                 String?
 bannerUrl               String?
 website                 String?
 note                    String?
 public                  Boolean?       @default(false)
 introductionRequestedAt DateTime?
 KaizenWork              KaizenWork[]
 KaizenReview            KaizenReview[]

 @@unique([name, organization], name: "unique_name_organization")
}

model KaizenReview {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 username String?
 review   String?
 platform String?

 KaizenClient   KaizenClient? @relation(fields: [kaizenClientId], references: [id], onDelete: Cascade)
 kaizenClientId Int?
}

model KaizenWork {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 uuid String? @unique @default(uuid())

 date              DateTime?
 title             String?
 subtitle          String?
 status            String?
 description       String?
 points            String?
 clientName        String?
 organization      String?
 dealPoint         Float?
 toolPoint         Float?
 impression        String?
 reply             String?
 jobCategory       String? //製造、飲食
 systemCategory    String? //GAS / アプリ
 collaborationTool String? //Freee / Insta

 KaizenWorkImage KaizenWorkImage[]
 showName        Boolean?          @default(false)

 KaizenClient   KaizenClient? @relation(fields: [kaizenClientId], references: [id], onDelete: Cascade)
 kaizenClientId Int?

 allowShowClient Boolean? @default(false)
 isPublic        Boolean? @default(false)

 correctionRequest String?

 @@unique([title, subtitle], name: "unique_title_subtitle")
}

model KaizenWorkImage {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 url String @unique

 KaizenWork   KaizenWork? @relation(fields: [kaizenWorkId], references: [id], onDelete: Cascade)
 kaizenWorkId Int?
}

model KaizenCMS {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 contactPageMsg   String?
 principlePageMsg String?
}

 
// 一回の購入
model AqSaleCart {
 id Int @id @default(autoincrement())

 baseOrderId   String?   @unique
 createdAt     DateTime  @default(now())
 updatedAt     DateTime? @default(now()) @updatedAt()
 sortOrder     Float     @default(0)
 date          DateTime
 paymentMethod String

 User         User?          @relation(fields: [userId], references: [id], onDelete: Cascade)
 userId       Int?
 AqCustomer   AqCustomer     @relation(fields: [aqCustomerId], references: [id], onDelete: Cascade)
 aqCustomerId Int
 AqSaleRecord AqSaleRecord[]
}

// 購入商品の1迷彩
model AqSaleRecord {
 baseSaleRecordId String?   @unique
 id               Int       @id @default(autoincrement())
 createdAt        DateTime  @default(now())
 updatedAt        DateTime? @default(now()) @updatedAt()
 sortOrder        Float     @default(0)

 date       DateTime
 quantity   Int
 price      Float
 taxRate    Float? // 税率
 taxedPrice Float? // 税込価格
 remarks    String?

 User   User? @relation(fields: [userId], references: [id], onDelete: Cascade)
 userId Int?

 AqCustomer   AqCustomer @relation(fields: [aqCustomerId], references: [id], onDelete: Cascade)
 aqCustomerId Int

 AqProduct   AqProduct @relation(fields: [aqProductId], references: [id], onDelete: Cascade)
 aqProductId Int

 AqPriceOption   AqPriceOption? @relation(fields: [aqPriceOptionId], references: [id], onDelete: Cascade)
 aqPriceOptionId Int?

 AqSaleCart   AqSaleCart @relation(fields: [aqSaleCartId], references: [id], onDelete: Cascade)
 aqSaleCartId Int

 AqCustomerSubscription AqCustomerSubscription? @relation(fields: [aqCustomerSubscriptionId], references: [id])

 aqCustomerSubscriptionId Int?

 subscriptionYearMonth DateTime?

 @@unique([aqCustomerId, aqProductId, subscriptionYearMonth, aqCustomerSubscriptionId], name: "unique_aqCustomerId_aqProductId_subscriptionYearMonth_aqCustomerSubscriptionId")
}

// 商品
model AqProduct {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 productCode               String?
 name                      String                   @unique
 AqProductCategoryMaster   AqProductCategoryMaster? @relation(fields: [aqProductCategoryMasterId], references: [id], onDelete: Cascade)
 aqProductCategoryMasterId Int?

 fromBase Boolean? @default(false)

 cost                  Float   @default(0)
 // price                 Float   @default(0)
 // sku                   String?
 // taxType               String?
 taxRate               Float   @default(10)
 stock                 Int     @default(0)
 inInventoryManagement Boolean @default(true)

 AqPriceOption AqPriceOption[]
 AqSaleRecord  AqSaleRecord[]

 AqCustomerPriceOption  AqCustomerPriceOption[]
 AqInventoryRegister    AqInventoryRegister[]
 AqCustomerSubscription AqCustomerSubscription[]

 AqDefaultShiireAqCustomer   AqCustomer? @relation(fields: [aqDefaultShiireAqCustomerId], references: [id])
 aqDefaultShiireAqCustomerId Int?

 AqInventoryByMonth AqInventoryByMonth[]
}

// 商品価格
model AqPriceOption {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)
 name      String
 price     Float?

 AqProduct   AqProduct? @relation(fields: [aqProductId], references: [id], onDelete: Cascade)
 aqProductId Int?

 AqCustomerPriceOption AqCustomerPriceOption[]
 AqSaleRecord          AqSaleRecord[]
}

model AqCustomer {
 id             Int       @id @default(autoincrement())
 createdAt      DateTime  @default(now())
 updatedAt      DateTime? @default(now()) @updatedAt()
 sortOrder      Float     @default(0)
 email          String?   @unique
 customerNumber String?   @unique

 fromBase Boolean? @default(false)

 companyName          String?
 jobTitle             String?
 name                 String? @unique
 defaultPaymentMethod String?
 furikomisakiCD       String?

 tel           String?
 tel2          String?
 fax           String?
 invoiceNumber String?
 status        String? @default("継続")

 domestic Boolean @default(true)
 postal   String?
 state    String?
 city     String?
 street   String?
 building String?
 remarks  String?

 firstVisitDate DateTime?
 lastVisitDate  DateTime?

 maintananceYear  Int?
 maintananceMonth Int?

 AqSaleCart                     AqSaleCart[]
 AqCustomerRecord               AqCustomerRecord[]
 AqCustomerPriceOption          AqCustomerPriceOption[]
 AqCustomerSupportGroupMidTable AqCustomerSupportGroupMidTable[]
 AqCustomerDealerMidTable       AqCustomerDealerMidTable[]
 AqCustomerDeviceMidTable       AqCustomerDeviceMidTable[]
 AqCustomerServiceTypeMidTable  AqCustomerServiceTypeMidTable[]
 AqSaleRecord                   AqSaleRecord[]
 User                           User?                            @relation(fields: [userId], references: [id])
 userId                         Int?
 AqInventoryRegister            AqInventoryRegister[]
 AqCustomerSubscription         AqCustomerSubscription[]

 AqProduct AqProduct[]
}

model AqCustomerSubscription {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 active Boolean @default(true)

 maintananceYear  Int
 maintananceMonth Int

 AqCustomer       AqCustomer     @relation(fields: [aqCustomerId], references: [id], onDelete: Cascade)
 aqCustomerId     Int
 AqDeviceMaster   aqDeviceMaster @relation(fields: [aqDeviceMasterId], references: [id])
 aqDeviceMasterId Int

 AqProduct   AqProduct @relation(fields: [aqProductId], references: [id])
 aqProductId Int

 remarks      String?
 AqSaleRecord AqSaleRecord[]
}

model AqCustomerPriceOption {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 AqCustomer   AqCustomer @relation(fields: [aqCustomerId], references: [id], onDelete: Cascade)
 aqCustomerId Int

 AqProduct AqProduct @relation(fields: [aqProductId], references: [id], onDelete: Cascade)

 aqProductId Int

 AqPriceOption   AqPriceOption @relation(fields: [aqPriceOptionId], references: [id], onDelete: Cascade)
 aqPriceOptionId Int

 @@unique([aqCustomerId, aqProductId], name: "unique_aqCustomerId_aqProductId")
}

model AqCustomerRecord {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 date    DateTime?
 status  String?
 type    String?
 content String?
 remarks String?

 AqCustomerRecordAttachment AqCustomerRecordAttachment[]

 AqCustomer   AqCustomer @relation(fields: [aqCustomerId], references: [id], onDelete: Cascade)
 aqCustomerId Int
 User         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
 userId       Int
}

model AqCustomerRecordAttachment {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 title String?
 url   String?

 AqCustomerRecord   AqCustomerRecord? @relation(fields: [aqCustomerRecordId], references: [id], onDelete: Cascade)
 aqCustomerRecordId Int?
}

model AqSupportGroupMaster {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 name                           String                           @unique
 color                          String?
 AqCustomerSupportGroupMidTable AqCustomerSupportGroupMidTable[]
}

model AqProductCategoryMaster {
 id        Int         @id @default(autoincrement())
 createdAt DateTime    @default(now())
 updatedAt DateTime?   @default(now()) @updatedAt()
 sortOrder Float       @default(0)
 name      String      @unique
 color     String?
 AqProduct AqProduct[]
}

model AqServiecTypeMaster {
 id                            Int                             @id @default(autoincrement())
 createdAt                     DateTime                        @default(now())
 updatedAt                     DateTime?                       @default(now()) @updatedAt()
 sortOrder                     Float                           @default(0)
 name                          String                          @unique
 color                         String?
 AqCustomerServiceTypeMidTable AqCustomerServiceTypeMidTable[]
}

model AqDealerMaster {
 id                       Int                        @id @default(autoincrement())
 createdAt                DateTime                   @default(now())
 updatedAt                DateTime?                  @default(now()) @updatedAt()
 sortOrder                Float                      @default(0)
 name                     String                     @unique
 color                    String?
 AqCustomerDealerMidTable AqCustomerDealerMidTable[]
}

model aqDeviceMaster {
 id                       Int                        @id @default(autoincrement())
 createdAt                DateTime                   @default(now())
 updatedAt                DateTime?                  @default(now()) @updatedAt()
 sortOrder                Float                      @default(0)
 name                     String                     @unique
 color                    String?
 AqCustomerDeviceMidTable AqCustomerDeviceMidTable[]
 AqCustomerSubscription   AqCustomerSubscription[]
}

model AqCustomerDealerMidTable {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 AqCustomer       AqCustomer     @relation(fields: [aqCustomerId], references: [id], onDelete: Cascade)
 aqCustomerId     Int
 AqDealerMaster   AqDealerMaster @relation(fields: [aqDealerMasterId], references: [id], onDelete: Cascade)
 aqDealerMasterId Int

 @@unique([aqCustomerId, aqDealerMasterId], name: "unique_aqCustomerId_aqDealerMasterId")
}

model AqCustomerServiceTypeMidTable {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 AqCustomer   AqCustomer @relation(fields: [aqCustomerId], references: [id], onDelete: Cascade)
 aqCustomerId Int

 AqServiecTypeMaster   AqServiecTypeMaster? @relation(fields: [aqServiecTypeMasterId], references: [id], onDelete: Cascade)
 aqServiecTypeMasterId Int?

 @@unique([aqCustomerId, aqServiecTypeMasterId], name: "unique_aqCustomerId_aqServiecTypeMasterId")
}

model AqCustomerDeviceMidTable {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 AqCustomer   AqCustomer @relation(fields: [aqCustomerId], references: [id], onDelete: Cascade)
 aqCustomerId Int

 AqDeviceMaster   aqDeviceMaster @relation(fields: [aqDeviceMasterId], references: [id], onDelete: Cascade)
 aqDeviceMasterId Int

 @@unique([aqCustomerId, aqDeviceMasterId], name: "unique_aqCustomerId_aqDeviceMasterId")
}

model AqCustomerSupportGroupMidTable {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 from                   DateTime
 to                     DateTime?
 AqSupportGroupMaster   AqSupportGroupMaster? @relation(fields: [aqSupportGroupMasterId], references: [id], onDelete: Cascade)
 aqSupportGroupMasterId Int?
 AqCustomer             AqCustomer            @relation(fields: [aqCustomerId], references: [id], onDelete: Cascade)
 aqCustomerId           Int

 @@unique([aqCustomerId, aqSupportGroupMasterId], name: "unique_aqCustomerId_aqSupportGroupMasterId")
}

model AqInventoryRegister {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 aqProductId  Int
 aqCustomerId Int
 date         DateTime
 quantity     Int
 remarks      String?

 AqProduct  AqProduct  @relation(fields: [aqProductId], references: [id], onDelete: Cascade)
 AqCustomer AqCustomer @relation(fields: [aqCustomerId], references: [id], onDelete: Cascade)
}

model AqInventoryByMonth {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 count Int @default(0)

 yearMonth DateTime

 AqProduct   AqProduct @relation(fields: [aqProductId], references: [id])
 aqProductId Int

 @@unique([aqProductId, yearMonth], name: "unique_aqProductId_yearMonth")
}

 
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Department {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  code  String? @unique
  name  String
  color String?

  User User[]
}

model User {
  id            Int       @id @default(autoincrement())
  code          String?   @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime? @default(now()) @updatedAt()
  sortOrder     Float     @default(0)
  active        Boolean   @default(true)
  hiredAt       DateTime?
  yukyuCategory String?   @default("A")

  name     String
  kana     String?
  email    String? @unique
  password String?

  type String?

  role String @default("user")

  tempResetCode        String?
  tempResetCodeExpired DateTime?
  storeId              Int?
  schoolId             Int?
  rentaStoreId         Int?
  type2                String?
  shopId               Int?
  membershipName       String?
  damageNameMasterId   Int?
  color                String?
  tell                 String?
  app                  String?
  apps                 String[]

  // tbm

  employeeCode String? @unique
  phone        String?

  School School? @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  VideoFromUser           VideoFromUser[]
  Comment                 Comment[]
  LessonLog               LessonLog[]
  LessonLogAuthorizedUser LessonLogAuthorizedUser[]

  Payment        Payment[]
  SystemChat     SystemChat[]    @relation("user")
  SystemChatRoom SystemChatRoom?
  Ticket         Ticket[]

  GenbaDayShift GenbaDayShift[]
  SohkenCar     SohkenCar[]

  bcc String?

  UserRole   UserRole[]
  AqSaleCart AqSaleCart[]

  AqCustomerRecord AqCustomerRecord[]

  AqSaleRecord AqSaleRecord[]

  // TbmOperation                     TbmOperation[]
  // TbmOperationGroup                TbmOperationGroup[]
  AqCustomer        AqCustomer[]
  TbmBase           TbmBase?            @relation(fields: [tbmBaseId], references: [id])
  tbmBaseId         Int?
  TbmDriveSchedule  TbmDriveSchedule[]
  UserWorkStatus    UserWorkStatus[]
  OdometerInput     OdometerInput[]
  TbmRefuelHistory  TbmRefuelHistory[]
  DayRemarksUser    DayRemarksUser[]
  TbmCarWashHistory TbmCarWashHistory[]
  PurchaseRequest   PurchaseRequest[]
  LeaveRequest      LeaveRequest[]
  Approval          Approval[]
  TbmVehicle        TbmVehicle?
  KyuyoTableRecord  KyuyoTableRecord[]
  Department        Department?         @relation(fields: [departmentId], references: [id])
  departmentId      Int?
}

model ReleaseNotes {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  rootPath         String
  title            String?
  msg              String
  imgUrl           String?
  confirmedUserIds Int[]
}

model GoogleAccessToken {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  email         String    @unique
  access_token  String?
  refresh_token String?
  scope         String?
  token_type    String?
  id_token      String?
  expiry_date   DateTime?
  tokenJSON     String?
}

model RoleMaster {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)

  name        String     @unique
  description String?
  color       String?
  apps        String[]
  UserRole    UserRole[]
}

model UserRole {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @updatedAt
  sortOrder Float     @default(0)

  User         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId       Int
  RoleMaster   RoleMaster @relation(fields: [roleMasterId], references: [id], onDelete: Cascade)
  roleMasterId Int

  @@unique([userId, roleMasterId], name: "userId_roleMasterId_unique")
}

model ChainMethodLock {
  id        Int       @id @default(autoincrement())
  isLocked  Boolean   @default(false)
  expiresAt DateTime?
  updatedAt DateTime  @updatedAt
}

model Calendar {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  date DateTime @unique

  holidayType String @default("出勤")
}

model Tokens {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  name      String    @unique
  token     String
  expiresAt DateTime?
}

 
// 商品マスターテーブル
model Product {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)
 code      String?   @unique
 name      String?
 // maker     String?
 // unit      String?

 // リレーション
 PurchaseRequest PurchaseRequest[]
 ShiireSaki      ShiireSaki        @relation(fields: [shiireSakiId], references: [id], onDelete: Cascade)
 shiireSakiId    Int
}

model ShiireSaki {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 code String @unique
 name String

 email String?

 Product Product[]
}

// 発注履歴テーブル
model PurchaseRequest {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 purchaseType    String // 新規/折損/リピート
 quantity        Int
 reason          String
 result          String?
 approverComment String?
 trashed         Boolean @default(false)

 emailSentAt DateTime?

 // リレーション
 Approval  Approval[]
 User      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
 userId    Int
 Product   Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
 productId Int
}

// 休暇申請履歴テーブル
model LeaveRequest {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 from      DateTime
 to        DateTime
 leaveType String // 1日/年休休/午後休/特別休暇/慶弔休暇/産前産後休暇/代休/欠勤/早退/遅刻
 reason    String

 // リレーション
 Approval Approval[]
 User     User       @relation(fields: [userId], references: [id], onDelete: Cascade)
 userId   Int
}

// 承認テーブル
model Approval {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 index      Int
 type       String // 発注/休暇
 status     String // 承認/却下
 notifiedAt DateTime?
 comment    String?

 // 発注申請の承認
 PurchaseRequest   PurchaseRequest? @relation(fields: [purchaseRequestId], references: [id], onDelete: Cascade)
 purchaseRequestId Int?

 // 休暇申請の承認
 LeaveRequest   LeaveRequest? @relation(fields: [leaveRequestId], references: [id], onDelete: Cascade)
 leaveRequestId Int?

 User   User @relation(fields: [userId], references: [id], onDelete: Cascade)
 userId Int

 @@unique([purchaseRequestId, index, userId], name: "purchaseRequestApproval")
 @@unique([leaveRequestId, index, userId], name: "leaveRequestApproval")
}

 
model PrefCity {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)
 pref      String
 city      String
 Genba     Genba[]

 @@unique([pref, city], name: "unique_pref_city")
}

model DayRemarksUser {
 id          Int       @id @default(autoincrement())
 createdAt   DateTime  @default(now())
 updatedAt   DateTime? @default(now()) @updatedAt()
 sortOrder   Float     @default(0)
 kyuka       Boolean?  @default(false)
 kyukaTodoke Boolean?  @default(false)

 DayRemarks   DayRemarks @relation(fields: [dayRemarksId], references: [id])
 dayRemarksId Int

 User   User @relation(fields: [userId], references: [id], onDelete: Cascade)
 userId Int

 @@unique([dayRemarksId, userId], name: "unique_dayRemarksId_userId")
}

// sohken
model Genba {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 name             String?
 defaultStartTime String? //はやで、おそで、15分遅出など
 construction     String? //建築

 houseHoldsCount1 Int?
 houseHoldsCount2 Int?
 houseHoldsCount3 Int?
 houseHoldsCount4 Int?
 houseHoldsCount5 Int?
 houseHoldsCount6 Int?
 houseHoldsCount7 Int?

 warningString String?

 zip          String?
 state        String?
 city         String?
 addressLine1 String?
 addressLine2 String?

 PrefCity   PrefCity? @relation(fields: [prefCityId], references: [id])
 prefCityId Int?

 GenbaDayShift     GenbaDayShift[]
 GenbaDay          GenbaDay[]
 GenbaDaySoukenCar GenbaDaySoukenCar[]

 GenbaTask GenbaTask[]

 archived Boolean? @default(false)
}

model SohkenCar {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 name  String?
 plate String?
 role  String?

 GenbaDaySoukenCar GenbaDaySoukenCar[]
 User              User?               @relation(fields: [userId], references: [id], onDelete: Cascade)
 userId            Int?
}

model GenbaDay {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 date    DateTime
 subTask String?
 remarks String?
 Genba   Genba?   @relation(fields: [genbaId], references: [id], onDelete: Cascade)
 ninku   Float?

 finished Boolean? @default(false)

 active         Boolean? @default(true)
 overStuffCount Int?     @default(0)
 status         String?

 ninkuFullfilled             Boolean? @default(false)
 isLastFullfilledDay         Boolean? @default(false)
 allAssignedNinkuTillThisDay Int?
 allRequiredNinku            Int?

 genbaId       Int?
 GenbaDayShift GenbaDayShift[]

 GenbaDaySoukenCar GenbaDaySoukenCar[]

 GenbaDayTaskMidTable GenbaDayTaskMidTable[]

 @@unique([date, genbaId], name: "unique_date_genbaId")
}

model GenbaTask {
 id            Int       @id @default(autoincrement())
 createdAt     DateTime  @default(now())
 updatedAt     DateTime? @default(now()) @updatedAt()
 sortOrder     Float     @default(0)
 name          String?
 color         String?
 from          DateTime?
 to            DateTime?
 requiredNinku Float?

 subTask String?
 remarks String?

 // status        String?

 Genba                Genba                  @relation(fields: [genbaId], references: [id])
 genbaId              Int
 GenbaDayTaskMidTable GenbaDayTaskMidTable[]

 @@unique([name, genbaId], name: "unique_name_genbaId")
}

model GenbaDayTaskMidTable {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 GenbaDay   GenbaDay @relation(fields: [genbaDayId], references: [id], onDelete: Cascade)
 genbaDayId Int

 GenbaTask   GenbaTask @relation(fields: [genbaTaskId], references: [id], onDelete: Cascade)
 genbaTaskId Int

 @@unique([genbaDayId, genbaTaskId], name: "unique_genbaDayId_genbaTaskId")
}

model GenbaDaySoukenCar {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 GenbaDay   GenbaDay @relation(fields: [genbaDayId], references: [id], onDelete: Cascade)
 genbaDayId Int

 SohkenCar   SohkenCar @relation(fields: [sohkenCarId], references: [id], onDelete: Cascade)
 sohkenCarId Int

 Genba   Genba @relation(fields: [genbaId], references: [id], onDelete: Cascade)
 genbaId Int

 @@unique([genbaDayId, sohkenCarId], name: "unique_genbaDayId_sohkenCarId")
}

model GenbaDayShift {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 date      DateTime?
 from      String? // 08:00
 to        String? // 08:00
 important Boolean?  @default(false)
 shokucho  Boolean?  @default(false)

 directGo     Boolean? @default(false)
 directReturn Boolean? @default(false)

 User   User @relation(fields: [userId], references: [id], onDelete: Cascade)
 userId Int

 GenbaDay   GenbaDay @relation(fields: [genbaDayId], references: [id], onDelete: Cascade)
 genbaDayId Int

 Genba   Genba @relation(fields: [genbaId], references: [id], onDelete: Cascade)
 genbaId Int

 @@unique([userId, genbaDayId], name: "unique_userId_genbaDayId")
}

model GenbaTaskMaster {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 name  String
 color String
}

model DayRemarks {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 date         DateTime @unique
 bikou        String?
 shinseiGyomu String?

 ninkuCount Float?

 DayRemarksUser DayRemarksUser[]
 DayRemarksFile DayRemarksFile[]
}

model DayRemarksFile {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 name String
 url  String

 DayRemarks   DayRemarks? @relation(fields: [dayRemarksId], references: [id])
 dayRemarksId Int?
}

model SohkenGoogleCalendar {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 calendarId String
 eventId    String? @unique

 date    DateTime
 startAt DateTime?
 endAt   DateTime?
 summary String?
}

 
model StockConfig {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Int       @default(0)

 type  String // 設定の種類（例: "threshold", "period", "macd"）
 name  String // 設定名（例: "上昇閾値", "MACD短期", "RSI期間"）
 value Float // 設定値

 @@unique([type, name], name: "stockConfig_type_name_unique")
}

// 設定例:
// type: "threshold", name: "上昇閾値", value: 5.0
// type: "period", name: "上昇期間", value: 5.0
// type: "period", name: "クラッシュ期間", value: 10.0
// type: "period", name: "短期移動平均", value: 5.0
// type: "period", name: "長期移動平均", value: 25.0
// type: "period", name: "RSI期間", value: 14.0
// type: "threshold", name: "RSI売られすぎ閾値", value: 30.0
// type: "macd", name: "MACD短期", value: 12.0
// type: "macd", name: "MACD長期", value: 26.0
// type: "macd", name: "MACDシグナル", value: 9.0

model Stock {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Int       @default(0)

 favorite        Int?   @default(0)
 heldCount       Int?   @default(0)
 averageBuyPrice Float? @default(0)

 profit Float?

 Code               String    @unique // 証券コード
 Date               DateTime? // 日付
 CompanyName        String? // 会社名
 CompanyNameEnglish String? // 会社名（英語）
 Sector17Code       String? // セクター17コード
 Sector17CodeName   String? // セクター17コード名
 Sector33Code       String? // セクター33コード
 Sector33CodeName   String? // セクター33コード名
 ScaleCategory      String? // スケールカテゴリ
 MarketCode         String? // マーケットコード
 MarketCodeName     String? // マーケットコード名

 last_Date             DateTime?
 last_Open             Int?
 last_High             Int?
 last_Low              Int?
 last_Close            Int?
 last_UpperLimit       String?
 last_LowerLimit       String?
 last_Volume           Int?
 last_TurnoverValue    String?
 last_AdjustmentFactor Int?
 last_AdjustmentOpen   Int?
 last_AdjustmentHigh   Int?
 last_AdjustmentLow    Int?
 last_AdjustmentClose  Int?
 last_AdjustmentVolume Int?

 last_updatedAt DateTime? // 最終更新日

 // last_hasBreakoutHigh        Boolean? // 高値ブレイクアウトm
 // last_hasConsecutiveBullish  Boolean? // 連続上昇
 // last_hasMADeviationRise     Boolean? // 移動平均乖離上昇
 // last_hasVolatilitySpike     Boolean? // ボラティリティスパイク
 // last_hasVolatilitySpikeFall Boolean? // ボラティリティスパイク下降
 // last_hasVolatilitySpikeRise Boolean? // ボラティリティスパイク上昇
 // last_hasVolumeBoostRise     Boolean? // 出来高増加
 // last_hasisSimpleRise        Boolean? // 単純上昇

 last_riseRate                  Int? // 上昇率
 last_josho                     Boolean?
 last_dekidakaJosho             Boolean?
 last_renzokuJosho              Boolean?
 last_takaneBreakout            Boolean?
 last_idoHeikinKairiJosho       Boolean?
 last_spike                     Boolean?
 last_spikeFall                 Boolean?
 last_spikeRise                 Boolean?
 last_recentCrash               Boolean?
 last_goldenCross               Boolean? // ゴールデンクロス
 last_rsiOversold               Boolean? // RSI売られすぎ
 last_crashAndRebound           Boolean? // 急落後リバウンド
 last_consecutivePositiveCloses Boolean? // 連続陽線
 last_macdBullish               Boolean? // MACD強気シグナル

 // MACD値の保存
 last_macdLine      Float? // MACDライン
 last_macdSignal    Float? // MACDシグナルライン
 last_macdHistogram Float? // MACDヒストグラム

 // 移動平均線の最新値
 last_ma5  Float? // 5日移動平均
 last_ma20 Float? // 20日移動平均
 last_ma60 Float? // 60日移動平均

 // RSI最新値
 last_rsi     Float? // RSI値
 StockHistory StockHistory[]
}

model StockHistory {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Int       @default(0)

 // Start of Selection
 Date          DateTime? // 日付
 Code          String? // 証券コード
 Open          Int? // 始値
 High          Int? // 高値
 Low           Int? // 安値
 Close         Int? // 終値
 UpperLimit    String? // 上限
 LowerLimit    String? // 下限
 Volume        Int? // 出来高
 TurnoverValue String? // 売買代金

 AdjustmentFactor Int? // 調整係数
 AdjustmentOpen   Int? // 調整始値
 AdjustmentHigh   Int? // 調整高値
 AdjustmentLow    Int? // 調整安値
 AdjustmentClose  Int? // 調整終値
 AdjustmentVolume Int? // 調整出来高

 riseRate Int? // 上昇率

 // テクニカル指標（履歴保存用）
 josho                     Boolean?
 dekidakaJosho             Boolean?
 renzokuJosho              Boolean?
 takaneBreakout            Boolean?
 idoHeikinKairiJosho       Boolean?
 spike                     Boolean?
 spikeFall                 Boolean?
 spikeRise                 Boolean?
 recentCrash               Boolean?
 goldenCross               Boolean? // ゴールデンクロス
 rsiOversold               Boolean? // RSI売られすぎ
 crashAndRebound           Boolean? // 急落後リバウンド
 consecutivePositiveCloses Boolean? // 連続陽線
 macdBullish               Boolean? // MACD強気シグナル

 // MACD値の履歴保存
 macdLine      Float? // MACDライン
 macdSignal    Float? // MACDシグナルライン
 macdHistogram Float? // MACDヒストグラム

 // 移動平均線の値
 ma5  Float? // 5日移動平均
 ma20 Float? // 20日移動平均
 ma60 Float? // 60日移動平均

 // RSI値
 rsi Float? // RSI値

 Stock   Stock @relation(fields: [stockId], references: [id])
 stockId Int

 @@unique([stockId, Date], name: "stockHistory_stockId_Date_unique")
 @@index([Date])
}

 
model TbmBase {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 code String? @unique
 name String  @unique

 User                User[]
 TbmVehicle          TbmVehicle[]
 TbmRouteGroup       TbmRouteGroup[]
 TbmDriveSchedule    TbmDriveSchedule[]
 TbmProduct          TbmProduct[]
 TbmCustomer         TbmCustomer[]
 TbmBase_MonthConfig TbmBase_MonthConfig[]
}

model TbmRouteGroupCalendar {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 date        DateTime
 holidayType String?  @default("")
 remark      String?

 TbmRouteGroup   TbmRouteGroup @relation(fields: [tbmRouteGroupId], references: [id], onDelete: Cascade)
 tbmRouteGroupId Int

 @@unique([tbmRouteGroupId, date], name: "unique_tbmRouteGroupId_date")
}

model TbmBase_MonthConfig {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 code      String?
 yearMonth DateTime

 gasolinePerLiter Float?
 keiyuPerLiter    Float?

 TbmBase   TbmBase @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
 tbmBaseId Int

 @@unique([tbmBaseId, yearMonth], name: "unique_tbmBaseId_yearMonth")
}

model TbmVehicle {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 code String @unique

 frameNo       String? @unique
 vehicleNumber String  @unique
 type          String?
 shape         String?
 airSuspension String?
 oilTireParts  String?
 maintenance   String?
 insurance     String?

 shodoTorokubi DateTime?
 sakenManryobi DateTime?
 hokenManryobi DateTime?

 sankagetsuTenkenbi DateTime?
 sokoKyori          Float?

 // 保険情報
 jibaisekiHokenCompany String? // 自賠責保険会社
 jibaisekiManryobi     DateTime? // 自賠責満期日

 jidoshaHokenCompany String? // 自動車保険会社（対人、対物）
 jidoshaManryobi     DateTime? // 自動車保険満期日

 kamotsuHokenCompany String? // 貨物保険会社
 kamotsuManryobi     DateTime? // 貨物保険満期日

 sharyoHokenCompany String? // 車両保険会社
 sharyoManryobi     DateTime? // 車両保険満期日

 // ETCカード情報
 etcCardNumber     String? // ETCカード番号
 etcCardExpiration DateTime? // ETCカード有効期限

 TbmFuelCard TbmFuelCard[]

 TbmRefuelHistory  TbmRefuelHistory[]
 TbmBase           TbmBase             @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
 tbmBaseId         Int
 TbmDriveSchedule  TbmDriveSchedule[]
 OdometerInput     OdometerInput[]
 TbmCarWashHistory TbmCarWashHistory[]

 User   User? @relation(fields: [userId], references: [id])
 userId Int?  @unique

 TbmVehicleMaintenanceRecord TbmVehicleMaintenanceRecord[]
 TbmEtcMeisai                TbmEtcMeisai[]

 @@unique([tbmBaseId, vehicleNumber], name: "unique_tbmBaseId_vehicleNumber")
}

model TbmFuelCard {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 name         String
 date         DateTime
 TbmVehicle   TbmVehicle? @relation(fields: [tbmVehicleId], references: [id])
 tbmVehicleId Int?
}

model TbmVehicleMaintenanceRecord {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 date   DateTime
 title  String
 price  Float
 remark String?
 type   String? // 3ヶ月点検・車検・その他

 TbmVehicle   TbmVehicle? @relation(fields: [tbmVehicleId], references: [id])
 tbmVehicleId Int?
}

model TbmRouteGroup {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 code      String  @unique
 name      String
 routeName String?

 pickupTime  String? //接車時間
 vehicleType String? //車z種

 seikyuKbn String? @default("01")

 TbmBase   TbmBase @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
 tbmBaseId Int

 TbmDriveSchedule TbmDriveSchedule[]

 TbmMonthlyConfigForRouteGroup TbmMonthlyConfigForRouteGroup[]
 Mid_TbmRouteGroup_TbmProduct  Mid_TbmRouteGroup_TbmProduct?
 Mid_TbmRouteGroup_TbmCustomer Mid_TbmRouteGroup_TbmCustomer?
 TbmRouteGroupCalendar         TbmRouteGroupCalendar[]

 TbmRouteGroupFee TbmRouteGroupFee[]

 @@unique([tbmBaseId, code], name: "unique_tbmBaseId_code")
}

model TbmRouteGroupFee {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 startDate DateTime

 driverFee Int?
 futaiFee  Int?

 TbmRouteGroup   TbmRouteGroup @relation(fields: [tbmRouteGroupId], references: [id], onDelete: Cascade)
 tbmRouteGroupId Int
}

model TbmMonthlyConfigForRouteGroup {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 yearMonth DateTime

 generalFee         Int? //通行量（一般）[]
 tsukoryoSeikyuGaku Int? //通行料請求額
 seikyuKaisu        Int? //請求回数

 numberOfTrips   Int?
 TbmRouteGroup   TbmRouteGroup @relation(fields: [tbmRouteGroupId], references: [id], onDelete: Cascade)
 tbmRouteGroupId Int

 @@unique([yearMonth, tbmRouteGroupId], name: "unique_yearMonth_tbmRouteGroupId")
}

model TbmProduct {
 id                           Int                            @id @default(autoincrement())
 createdAt                    DateTime                       @default(now())
 updatedAt                    DateTime?                      @default(now()) @updatedAt()
 sortOrder                    Float                          @default(0)
 code                         String                         @unique
 name                         String                         @unique
 Mid_TbmRouteGroup_TbmProduct Mid_TbmRouteGroup_TbmProduct[]
 TbmBase                      TbmBase                        @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
 tbmBaseId                    Int

 @@unique([tbmBaseId, name], name: "unique_tbmBaseId_name")
}

model Mid_TbmRouteGroup_TbmProduct {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 TbmRouteGroup   TbmRouteGroup @relation(fields: [tbmRouteGroupId], references: [id], onDelete: Cascade)
 tbmRouteGroupId Int           @unique

 TbmProduct   TbmProduct @relation(fields: [tbmProductId], references: [id], onDelete: Cascade)
 tbmProductId Int

 @@unique([tbmRouteGroupId, tbmProductId], name: "unique_tbmRouteGroupId_tbmProductId")
}

model Mid_TbmRouteGroup_TbmCustomer {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 TbmRouteGroup   TbmRouteGroup @relation(fields: [tbmRouteGroupId], references: [id], onDelete: Cascade)
 tbmRouteGroupId Int           @unique

 TbmCustomer   TbmCustomer @relation(fields: [tbmCustomerId], references: [id], onDelete: Cascade)
 tbmCustomerId Int

 @@unique([tbmRouteGroupId, tbmCustomerId], name: "unique_tbmRouteGroupId_tbmCustomerId")
}

model TbmBillingAddress {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 name String
}

model TbmInvoiceDetail {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 numberOfTrips   Int
 fare            Float
 toll            Float
 specialAddition Float? // 特別付加金
}

model TbmCustomer {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 code                          String?                         @unique
 name                          String                          @unique
 address                       String?
 phoneNumber                   String?
 faxNumber                     String?
 bankInformation               String?
 Mid_TbmRouteGroup_TbmCustomer Mid_TbmRouteGroup_TbmCustomer[]

 TbmBase   TbmBase @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
 tbmBaseId Int

 @@unique([tbmBaseId, name], name: "unique_tbmBaseId_name")
}

model TbmRefuelHistory {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 date     DateTime
 amount   Float
 odometer Float
 type     String

 // TbmOperationGroup TbmOperationGroup? @relation(fields: [tbmOperationGroupId], references: [id], onDelete: Cascade)
 // tbmOperationGroupId Int?

 TbmVehicle   TbmVehicle @relation(fields: [tbmVehicleId], references: [id], onDelete: Cascade)
 tbmVehicleId Int

 User   User @relation(fields: [userId], references: [id], onDelete: Cascade)
 userId Int
}

model TbmCarWashHistory {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 date  DateTime
 price Float

 TbmVehicle   TbmVehicle @relation(fields: [tbmVehicleId], references: [id], onDelete: Cascade)
 tbmVehicleId Int

 User   User @relation(fields: [userId], references: [id], onDelete: Cascade)
 userId Int
}

model TbmDriveSchedule {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 date                DateTime
 O_postalHighwayFee  Int? //高速(郵便)
 Q_generalHighwayFee Int? //高速（一般）

 User   User? @relation(fields: [userId], references: [id], onDelete: Cascade)
 userId Int?

 TbmVehicle   TbmVehicle? @relation(fields: [tbmVehicleId], references: [id], onDelete: Cascade)
 tbmVehicleId Int?

 TbmRouteGroup   TbmRouteGroup @relation(fields: [tbmRouteGroupId], references: [id], onDelete: Cascade)
 tbmRouteGroupId Int

 finished  Boolean? @default(false)
 confirmed Boolean? @default(false)
 approved  Boolean? @default(true)

 TbmBase   TbmBase @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
 tbmBaseId Int

 TbmEtcMeisai TbmEtcMeisai?
}

model TbmEtcMeisai {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 groupIndex Int
 month      DateTime

 info Json[]

 sum Float

 TbmVehicle         TbmVehicle?       @relation(fields: [tbmVehicleId], references: [id])
 tbmVehicleId       Int?
 TbmDriveSchedule   TbmDriveSchedule? @relation(fields: [tbmDriveScheduleId], references: [id])
 tbmDriveScheduleId Int?              @unique

 @@unique([tbmVehicleId, groupIndex, month], name: "unique_tbmVehicleId_groupIndex_month")
 @@index([tbmVehicleId])
}

model OdometerInput {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 odometerStart Float
 odometerEnd   Float
 date          DateTime

 TbmVehicle   TbmVehicle @relation(fields: [tbmVehicleId], references: [id], onDelete: Cascade)
 tbmVehicleId Int

 User   User @relation(fields: [userId], references: [id])
 userId Int

 @@unique([tbmVehicleId, date], name: "unique_tbmVehicleId_date")
}

model UserWorkStatus {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 date       DateTime
 workStatus String?
 remark     String?

 User   User @relation(fields: [userId], references: [id], onDelete: Cascade)
 userId Int

 @@unique([userId, date], name: "unique_userId_date")
}

model KyuyoTableRecord {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 other1      Float?
 other2      Float?
 shokuhi     Float?
 maebaraikin Float?
 rate        Float? @default(0.5)

 yearMonth DateTime
 User      User     @relation(fields: [userId], references: [id])
 userId    Int

 @@unique([userId, yearMonth], name: "unique_userId_yearMonth")
}

 `;

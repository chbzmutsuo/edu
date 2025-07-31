
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

 
// Colabo - Interactive Slide Teaching Support App Schema

model Slide {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 active    Boolean   @default(true)
 sortOrder Float     @default(0)

 title        String
 templateType String // "normal", "psychology", "choice_quiz", "free_text_quiz", "summary_survey"
 isActive     Boolean @default(false) // Currently displayed slide

 gameId        Int
 Game          Game            @relation(fields: [gameId], references: [id], onDelete: Cascade)
 SlideBlock    SlideBlock[]
 SlideResponse SlideResponse[]
}

model SlideBlock {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 active    Boolean   @default(true)
 sortOrder Float     @default(0)

 blockType String // "text", "image", "link", "quiz_question", "choice_option"
 content   String? // Text content or markdown
 imageUrl  String? // Image URL
 linkUrl   String? // Link URL

 // Layout and styling
 alignment       String? // "left", "center", "right"
 verticalAlign   String? // "top", "middle", "bottom"
 textColor       String? // CSS color
 backgroundColor String? // CSS color
 fontWeight      String? // "normal", "bold"
 textDecoration  String? // "none", "underline"

 // Quiz-specific fields
 isCorrectAnswer Boolean @default(false) // For choice quiz correct answers

 slideId Int
 Slide   Slide @relation(fields: [slideId], references: [id], onDelete: Cascade)
}

model SlideResponse {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 active    Boolean   @default(true)
 sortOrder Float     @default(0)

 responseType String // "choice", "text", "psychology"
 choiceAnswer String? // Selected choice for quiz
 textAnswer   String? // Free text response
 isCorrect    Boolean? // Whether the answer was correct (for quizzes)

 // Psychology survey responses (same as Answer model)
 curiocity1 Int?
 curiocity2 Int?
 curiocity3 Int?
 curiocity4 Int?
 curiocity5 Int?
 efficacy1  Int?
 efficacy2  Int?
 efficacy3  Int?
 efficacy4  Int?
 efficacy5  Int?

 slideId   Int
 studentId Int
 gameId    Int

 Slide   Slide   @relation(fields: [slideId], references: [id], onDelete: Cascade)
 Student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)
 Game    Game    @relation(fields: [gameId], references: [id], onDelete: Cascade)

 @@unique([slideId, studentId, gameId], name: "unique_slideId_studentId_gameId")
}

// Extend existing Game model with slide relations
// This would be added to the existing Game model in Grouping.prisma:
// Slide             Slide[]
// SlideResponse     SlideResponse[]

// Extend existing Student model with slide response relation
// This would be added to the existing Student model in Grouping.prisma:
// SlideResponse     SlideResponse[]

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
 id               Int             @id @default(autoincrement())
 createdAt        DateTime        @default(now())
 updatedAt        DateTime?       @default(now()) @updatedAt()
 active           Boolean         @default(true)
 sortOrder        Float           @default(0)
 name             String
 kana             String?
 gender           String?
 attendanceNumber Int?
 schoolId         Int
 classroomId      Int
 Answer           Answer[]
 SlideResponse    SlideResponse[]

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
 Slide                    Slide[]
 SlideResponse            SlideResponse[]
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

 
// 健康管理アプリ用のPrismaスキーマ

// 薬マスタ
model Medicine {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 name        String  @unique // 薬名
 requireUnit Boolean @default(false) // 単位入力が必要かどうか
 active      Boolean @default(true) // 有効/無効

 // リレーション
 HealthRecord HealthRecord[]
}

// 健康記録
model HealthRecord {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 // 関連ユーザー
 User   User @relation(fields: [userId], references: [id], onDelete: Cascade)
 userId Int

 // 記録日時
 recordDate DateTime // 記録対象の日付
 recordTime String // 時刻（HH:mm形式）

 // カテゴリ
 category String // "blood_sugar", "urine", "stool", "meal", "snack", "medicine", "walking"

 // 血糖値データ
 bloodSugarValue Int? // 血糖値（数値のみ）

 // 薬データ
 Medicine     Medicine? @relation(fields: [medicineId], references: [id])
 medicineId   Int?
 medicineUnit Float? // 薬の単位（数値）

 // 歩行データ
 walkingShortDistance  Float? @default(0) // 短距離
 walkingMediumDistance Float? @default(0) // 中距離
 walkingLongDistance   Float? @default(0) // 長距離
 walkingExercise       Float? @default(0) // 運動

 // その他のデータ（尿、便、食事、間食は時刻のみなので追加のフィールドは不要）

 // メモ（任意）
 memo String?

 @@index([userId, recordDate])
 @@index([userId, category])
}

// 日誌（1日分）
model HealthJournal {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 // 関連ユーザー
 User   User @relation(fields: [userId], references: [id], onDelete: Cascade)
 userId Int

 // 日誌の日付（7:00起点）
 journalDate DateTime // 記録対象の日付（7:00起点）

 // 目標と振り返り
 goalAndReflection String? // 自由記述欄

 // テンプレート適用済みフラグ
 templateApplied Boolean @default(false)

 // リレーション
 HealthJournalEntry HealthJournalEntry[]

 @@unique([userId, journalDate])
 @@index([userId, journalDate])
}

// 日誌エントリ（時間帯ごと）
model HealthJournalEntry {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 // 関連日誌
 healthJournalId Int
 HealthJournal   HealthJournal @relation(fields: [healthJournalId], references: [id], onDelete: Cascade)

 // 時間帯（7, 8, 9, ..., 6）
 hourSlot Int // 7:00-8:00なら7、8:00-9:00なら8

 // 自由記述コメント
 comment String?

 // リレーション
 HealthJournalImage HealthJournalImage[]

 @@unique([healthJournalId, hourSlot])
 @@index([healthJournalId, hourSlot])
}

// 日誌画像
model HealthJournalImage {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 // 関連エントリ
 HealthJournalEntry   HealthJournalEntry @relation(fields: [healthJournalEntryId], references: [id], onDelete: Cascade)
 healthJournalEntryId Int

 // 画像情報
 fileName    String // ファイル名
 filePath    String // ファイルパス
 fileSize    Int? // ファイルサイズ（バイト）
 mimeType    String? // MIMEタイプ
 description String? // 画像の説明

 @@index([healthJournalEntryId])
}

// タスク管理アプリ用スキーマ
model Task {
 id        Int      @id @default(autoincrement())
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 // 基本情報
 title       String
 description String?
 dueDate     DateTime?
 completed   Boolean   @default(false)
 completedAt DateTime?

 // 定期タスク関連
 isRecurring         Boolean           @default(false)
 RecurringPattern    RecurringPattern?
 recurringEndDate    DateTime?
 recurringWeekdays   Int[] // 曜日指定用 (0=日曜, 1=月曜, ...)
 recurringDayOfMonth Int? // 月の日付指定用
 recurringMonths     Int[] // 月指定用 (1=1月, 2=2月, ...)

 // ユーザー情報
 userId Int?

 // ファイル添付
 TaskAttachment TaskAttachment[]

 // 定期タスクのマスター参照
 RecurringTask   RecurringTask? @relation(fields: [recurringTaskId], references: [id], onDelete: Cascade)
 recurringTaskId Int?

 @@index([userId, dueDate])
 @@index([completed, dueDate])
 @@index([recurringTaskId])
}

model TaskAttachment {
 id        Int      @id @default(autoincrement())
 createdAt DateTime @default(now())

 filename     String
 originalName String
 mimeType     String
 size         Int
 url          String // S3 URL or local path

 Task   Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
 taskId Int
}

model RecurringTask {
 id        Int      @id @default(autoincrement())
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 // 基本情報
 title       String
 description String?

 // 定期設定
 pattern    RecurringPattern
 startDate  DateTime
 endDate    DateTime // 必須フィールドに変更
 weekdays   Int[] // 曜日指定用 (0=日曜, 1=月曜, ...)
 dayOfMonth Int? // 月の日付指定用
 months     Int[] // 月指定用 (1=1月, 2=2月, ...)
 interval   Int              @default(1) // 間隔（毎週、隔週など）

 // 次回生成日時
 nextGenerationDate DateTime?

 // 生成停止フラグ
 isActive Boolean @default(true)

 // ユーザー情報
 userId Int?

 // 生成されたタスク
 Task Task[]

 @@index([userId, isActive])
 @@index([nextGenerationDate, isActive])
}

enum RecurringPattern {
 WEEKLY // 毎週
 MONTHLY // 毎月
 YEARLY // 毎年
 BIWEEKLY // 隔週
 QUARTERLY // 四半期
 CUSTOM // カスタム間隔
 DAILY // 毎日
 WEEKDAYS // 平日のみ
 WEEKENDS // 週末のみ
}

 
// 経費記録アプリ用スキーマ
model KeihiExpense {
 id        String   @id @default(cuid())
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 // 基本情報
 date                 DateTime
 amount               Int
 subject              String // 科目
 location             String? // 場所
 counterpartyName     String? // 相手名
 counterpartyIndustry String? // 相手の職種・業種
 conversationPurpose  String[] // 会話の目的（複数選択対応）
 keywords             String[] // キーワード（配列）

 // 会話記録
 conversationSummary String? // 会話内容の要約
 summary             String? // 摘要

 // 評価
 learningDepth Int? // 学びの深さ・重要度（1-5）

 // 税務調査対応項目
 counterpartyContact String? // 相手の連絡先
 followUpPlan        String? // フォローアップ予定
 businessOpportunity String? // ビジネス機会の評価
 competitorInfo      String? // 競合情報

 // AI生成情報（統合版）
 insight  String? // 統合されたインサイト
 autoTags String[] // 自動生成タグ

 // MoneyForward用情報
 mfSubject     String? // MF用科目
 mfSubAccount  String? // MF用補助科目
 mfTaxCategory String? // MF用税区分
 mfDepartment  String? // MF用部門
 mfMemo        String? // MF用摘要

 // ファイル添付
 KeihiAttachment KeihiAttachment[]

 // ユーザー情報（将来的に）
 userId String?
}

model KeihiAttachment {
 id        String   @id @default(cuid())
 createdAt DateTime @default(now())

 filename     String
 originalName String
 mimeType     String
 size         Int
 url          String // S3 URL or local path

 keihiExpenseId String?
 KeihiExpense   KeihiExpense? @relation(fields: [keihiExpenseId], references: [id], onDelete: Cascade)
}

// 勘定科目マスタ（将来的に）
model KeihiAccountMaster {
 id        String   @id @default(cuid())
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 category       String // 帳票
 classification String // 分類
 balanceSheet   String // 決算書科目
 account        String // 勘定科目
 subAccount     String? // 補助科目
 taxCategory    String // 税区分
 searchKey      String? // 検索キー
 isActive       Boolean @default(true) // 使用
 sortOrder      Int? // 並び順
}

// 選択肢マスタ（科目、業種、目的など）
model KeihiOptionMaster {
 id        String   @id @default(cuid())
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 category    String // 'subjects', 'industries', 'purposes'
 value       String // 選択肢の値
 label       String // 表示名
 description String? // 説明
 isActive    Boolean @default(true) // 有効/無効
 sortOrder   Int     @default(0) // 並び順
 color       String? // 色（任意）

 @@unique([category, value], name: "category_value_unique")
 @@index([category, isActive, sortOrder])
}

 
// Sara App - おうちスタンプラリーアプリ
// User統合版スキーマ

model Family {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 name String

 User     User[]     @relation("FamilyUsers")
 Activity Activity[]
}

model Activity {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 title       String
 description String?
 order       Int     @default(0)
 active      Boolean @default(true)

 Family   Family @relation(fields: [familyId], references: [id], onDelete: Cascade)
 familyId Int

 ActivityScore             ActivityScore[]
 ActivityEvaluationRequest ActivityEvaluationRequest[]
}

model ActivityScore {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 score             Int
 title             String
 description       String?
 iconUrl           String?
 achievementImgUrl String?
 animationLevel    String  @default("light") // light, medium, heavy

 Activity   Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
 activityId Int

 ActivityEvaluationRequest ActivityEvaluationRequest[]
}

model ActivityEvaluationRequest {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 date          DateTime @default(now())
 status        String   @default("pending") // pending, approved, rejected
 comment       String?
 openedByChild Boolean  @default(false)

 RequestedBy   User @relation("RequestedBy", fields: [requestedById], references: [id], onDelete: Cascade)
 requestedById Int // 申請者（子ども）

 Activity   Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
 activityId Int

 ActivityScore   ActivityScore @relation(fields: [activityScoreId], references: [id], onDelete: Cascade)
 activityScoreId Int

 ApprovedBy   User? @relation("ApprovedBy", fields: [approvedById], references: [id])
 approvedById Int? // 承認者（親）

 @@unique([requestedById, activityId, date], name: "user_activity_date_unique")
}

model MonthlySetting {
 id        Int      @id @default(autoincrement())
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
 year      Int
 month     Int
 key       String // 例: "walking_goal"
 value     String // 例: "650"（将来はJSONも可）

 @@unique([year, month, key])
}

 
// SBM - 仕出し弁当管理システム Prisma Schema

model SbmCustomer {
 id              String  @id @default(cuid())
 companyName     String  @db.VarChar(200)
 contactName     String? @db.VarChar(100)
 phoneNumber     String  @db.VarChar(20)
 deliveryAddress String  @db.VarChar(500)
 postalCode      String? @db.VarChar(10)
 email           String? @db.VarChar(255)
 availablePoints Int     @default(0)
 notes           String? @db.Text

 // タイムスタンプ
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 // リレーション
 reservations SbmReservation[]
 rfmAnalysis  SbmRfmAnalysis[]

 @@map("sbm_customers")
}

model SbmProduct {
 id           String  @id @default(cuid())
 name         String  @db.VarChar(200)
 description  String? @db.Text
 currentPrice Int // 現在価格（円）
 currentCost  Int // 現在原価（円）
 category     String  @db.VarChar(100)
 isActive     Boolean @default(true)

 // タイムスタンプ
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 // リレーション
 priceHistory     SbmProductPriceHistory[]
 reservationItems SbmReservationItem[]

 @@map("sbm_products")
}

model SbmProductPriceHistory {
 id            String   @id @default(cuid())
 productId     String
 price         Int // 価格（円）
 cost          Int // 原価（円）
 effectiveDate DateTime

 // タイムスタンプ
 createdAt DateTime @default(now())

 // リレーション
 product SbmProduct @relation(fields: [productId], references: [id], onDelete: Cascade)

 @@map("sbm_product_price_history")
}

model SbmUser {
 id       String  @id @default(cuid())
 username String  @unique @db.VarChar(100)
 name     String  @db.VarChar(100)
 email    String  @unique @db.VarChar(255)
 role     String  @db.VarChar(50) // 'admin', 'manager', 'staff'
 isActive Boolean @default(true)

 // タイムスタンプ
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 // リレーション
 reservations        SbmReservation[]
 deliveryAssignments SbmDeliveryAssignment[]

 @@map("sbm_users")
}

model SbmReservation {
 id              String  @id @default(cuid())
 customerId      String
 customerName    String  @db.VarChar(200)
 contactName     String? @db.VarChar(100)
 phoneNumber     String  @db.VarChar(20)
 deliveryAddress String  @db.VarChar(500)

 // 配達情報
 deliveryDate   DateTime
 pickupLocation String   @db.VarChar(50) // '配達', '店舗受取'

 // 注文情報
 purpose       String @db.VarChar(100) // '会議', '研修', '接待', 'イベント', '懇親会', 'その他'
 paymentMethod String @db.VarChar(50) // '現金', '銀行振込', '請求書', 'クレジットカード'
 orderChannel  String @db.VarChar(50) // '電話', 'FAX', 'メール', 'Web', '営業', 'その他'

 // 金額情報
 totalAmount Int // 合計金額（円）
 pointsUsed  Int @default(0)
 finalAmount Int // 最終金額（円）

 // 管理情報
 orderStaff   String  @db.VarChar(100)
 orderStaffId String?
 notes        String? @db.Text

 // タスク管理
 deliveryCompleted Boolean @default(false)
 recoveryCompleted Boolean @default(false)

 // タイムスタンプ
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 // リレーション
 customer            SbmCustomer                   @relation(fields: [customerId], references: [id], onDelete: Restrict)
 orderStaffUser      SbmUser?                      @relation(fields: [orderStaffId], references: [id], onDelete: SetNull)
 items               SbmReservationItem[]
 tasks               SbmReservationTask[]
 changeHistory       SbmReservationChangeHistory[]
 deliveryAssignments SbmDeliveryAssignment[]

 @@map("sbm_reservations")
}

model SbmReservationItem {
 id            String @id @default(cuid())
 reservationId String
 productId     String
 productName   String @db.VarChar(200)
 quantity      Int
 unitPrice     Int // 単価（円）
 totalPrice    Int // 小計（円）

 // タイムスタンプ
 createdAt DateTime @default(now())

 // リレーション
 reservation SbmReservation @relation(fields: [reservationId], references: [id], onDelete: Cascade)
 product     SbmProduct     @relation(fields: [productId], references: [id], onDelete: Restrict)

 @@map("sbm_reservation_items")
}

model SbmReservationTask {
 id            String    @id @default(cuid())
 reservationId String
 taskType      String    @db.VarChar(50) // 'delivery', 'recovery'
 isCompleted   Boolean   @default(false)
 completedAt   DateTime?
 notes         String?   @db.Text

 // タイムスタンプ
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 // リレーション
 reservation SbmReservation @relation(fields: [reservationId], references: [id], onDelete: Cascade)

 @@map("sbm_reservation_tasks")
}

model SbmReservationChangeHistory {
 id            String @id @default(cuid())
 reservationId String
 changedBy     String @db.VarChar(100)
 changeType    String @db.VarChar(50) // 'create', 'update', 'delete'
 changedFields Json? // 変更されたフィールドの詳細
 oldValues     Json? // 変更前の値
 newValues     Json? // 変更後の値

 // タイムスタンプ
 changedAt DateTime @default(now())

 // リレーション
 reservation SbmReservation @relation(fields: [reservationId], references: [id], onDelete: Cascade)

 @@map("sbm_reservation_change_history")
}

model SbmDeliveryTeam {
 id          String  @id @default(cuid())
 name        String  @db.VarChar(100)
 driverName  String  @db.VarChar(100)
 vehicleInfo String? @db.VarChar(200)
 capacity    Int // 配達可能数
 isActive    Boolean @default(true)

 // タイムスタンプ
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 // リレーション
 deliveryAssignments SbmDeliveryAssignment[]

 @@map("sbm_delivery_teams")
}

model SbmDeliveryAssignment {
 id                String   @id @default(cuid())
 teamId            String
 reservationId     String
 assignedBy        String   @db.VarChar(100)
 assignedById      String?
 deliveryDate      DateTime
 estimatedDuration Int? // 予想配達時間（分）
 actualDuration    Int? // 実際の配達時間（分）
 route             Json? // 配達ルート情報
 status            String   @default("assigned") @db.VarChar(50) // 'assigned', 'in_progress', 'completed', 'cancelled'

 // タイムスタンプ
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 // リレーション
 team           SbmDeliveryTeam @relation(fields: [teamId], references: [id], onDelete: Restrict)
 reservation    SbmReservation  @relation(fields: [reservationId], references: [id], onDelete: Cascade)
 assignedByUser SbmUser?        @relation(fields: [assignedById], references: [id], onDelete: SetNull)

 @@map("sbm_delivery_assignments")
}

model SbmRfmAnalysis {
 id           String   @id @default(cuid())
 customerId   String
 analysisDate DateTime @default(now())
 recency      Int // 最新購入からの日数
 frequency    Int // 購入回数
 monetary     Int // 累計購入金額（円）
 rScore       Int // Recency Score (1-5)
 fScore       Int // Frequency Score (1-5)
 mScore       Int // Monetary Score (1-5)
 totalScore   Int // 合計スコア
 rank         String   @db.VarChar(50) // 'VIP', '優良', '安定', '一般', '離反懸念'

 // タイムスタンプ
 createdAt DateTime @default(now())

 // リレーション
 customer SbmCustomer @relation(fields: [customerId], references: [id], onDelete: Cascade)

 @@unique([customerId, analysisDate])
 @@map("sbm_rfm_analysis")
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
  app                  String?
  apps                 String[]

  // tbm

  employeeCode String? @unique
  phone        String?

  familyId Int? // Sara家族ID
  avatar   String? // 子ども用アバター画像URL

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

  KyuyoTableRecord KyuyoTableRecord[]
  Department       Department?        @relation(fields: [departmentId], references: [id])
  departmentId     Int?
  HealthRecord     HealthRecord[]
  HealthJournal    HealthJournal[]

  // Sara App リレーション
  Family               Family?                     @relation("FamilyUsers", fields: [familyId], references: [id])
  RequestedEvaluations ActivityEvaluationRequest[] @relation("RequestedBy")
  ApprovedEvaluations  ActivityEvaluationRequest[] @relation("ApprovedBy")
  // TbmVehicle           TbmVehicle?
  TbmVehicle           TbmVehicle?                 @relation(fields: [tbmVehicleId], references: [id])
  tbmVehicleId         Int?
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

model Tokens {
  id        Int       @id @default(autoincrement())
  createdAt DateTime  @default(now())
  updatedAt DateTime? @default(now()) @updatedAt()
  sortOrder Float     @default(0)

  name      String    @unique
  token     String
  expiresAt DateTime?
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
 ninku   Float?

 finished Boolean? @default(false)

 active         Boolean? @default(true)
 overStuffCount Int?     @default(0)
 status         String?

 ninkuFullfilled             Boolean? @default(false)
 isLastFullfilledDay         Boolean? @default(false)
 allAssignedNinkuTillThisDay Int?
 allRequiredNinku            Int?

 Genba         Genba           @relation(fields: [genbaId], references: [id], onDelete: Cascade)
 genbaId       Int
 GenbaDayShift GenbaDayShift[]

 GenbaDaySoukenCar GenbaDaySoukenCar[]

 GenbaDayTaskMidTable GenbaDayTaskMidTable[]

 @@unique([date, genbaId], name: "unique_date_genbaId")
 @@index([date])
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
 @@index([from])
 @@index([to])
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

 ninkuCount   Float?
 nippoDocsUrl String?

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

model ForcedWorkDay {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 date DateTime
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

 // 新しく追加したシグナル
 last_volumeBreakout      Boolean? // 出来高ブレイクアウト
 last_priceVolumeBreakout Boolean? // 価格・出来高同時ブレイクアウト
 last_deathCross          Boolean? // デッドクロス
 last_rsiOverbought       Boolean? // RSI買われすぎ
 last_macdBearish         Boolean? // MACD弱気シグナル
 last_lowVolatility       Boolean? // 低ボラティリティ
 last_supportBounce       Boolean? // サポート反発
 last_resistanceBreak     Boolean? // レジスタンス突破

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

 // 新しく追加したシグナル（履歴用）
 volumeBreakout      Boolean? // 出来高ブレイクアウト
 priceVolumeBreakout Boolean? // 価格・出来高同時ブレイクアウト
 deathCross          Boolean? // デッドクロス
 rsiOverbought       Boolean? // RSI買われすぎ
 macdBearish         Boolean? // MACD弱気シグナル
 lowVolatility       Boolean? // 低ボラティリティ
 supportBounce       Boolean? // サポート反発
 resistanceBreak     Boolean? // レジスタンス突破

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
 // TbmProduct          TbmProduct[]
 TbmCustomer         TbmCustomer[]
 TbmBase_MonthConfig TbmBase_MonthConfig[]
 TbmKeihi            TbmKeihi[]
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

model TbmKeihi {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)
 item      String?
 amount    Float?
 date      DateTime?
 remark    String?

 TbmBase   TbmBase @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
 tbmBaseId Int
}

model TbmDriveScheduleImage {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 imageUrl String

 TbmDriveSchedule   TbmDriveSchedule? @relation(fields: [tbmDriveScheduleId], references: [id])
 tbmDriveScheduleId Int?
}

model TbmBase_MonthConfig {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 code      String?
 yearMonth DateTime

 keiyuPerLiter    Float?
 gasolinePerLiter Float?

 TbmBase   TbmBase @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
 tbmBaseId Int

 @@unique([tbmBaseId, yearMonth], name: "unique_tbmBaseId_yearMonth")
}

model TbmVehicle {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 code String? @unique

 name          String?
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

 // User   User? @relation(fields: [userId], references: [id])
 // userId Int?  @unique

 TbmVehicleMaintenanceRecord TbmVehicleMaintenanceRecord[]
 TbmEtcMeisai                TbmEtcMeisai[]
 User                        User[]

 @@unique([tbmBaseId, vehicleNumber], name: "unique_tbmBaseId_vehicleNumber")
}

model TbmFuelCard {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 name      String
 startDate DateTime @default(now())
 endDate   DateTime @default(now())

 TbmVehicle   TbmVehicle? @relation(fields: [tbmVehicleId], references: [id])
 tbmVehicleId Int?
}

// 1台ごとに、「日付、件名、金額、依頼先、備考」からなる整備記録の履歴を管理可能
model TbmVehicleMaintenanceRecord {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 date       DateTime //日付
 title      String // 件名
 price      Float // 金額
 contractor String? // 依頼先事業者
 remark     String? // 備考
 type       String? // 3ヶ月点検・車検・その他

 TbmVehicle   TbmVehicle? @relation(fields: [tbmVehicleId], references: [id])
 tbmVehicleId Int?
}

model TbmRouteGroup {
 id        Int       @id @default(autoincrement())
 createdAt DateTime  @default(now())
 updatedAt DateTime? @default(now()) @updatedAt()
 sortOrder Float     @default(0)

 code      String? @unique
 name      String
 routeName String?

 pickupTime  String? //接車時間
 vehicleType String? //車z種

 productName String?

 seikyuKbn String? @default("01")

 TbmBase   TbmBase @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
 tbmBaseId Int

 TbmDriveSchedule TbmDriveSchedule[]

 TbmMonthlyConfigForRouteGroup TbmMonthlyConfigForRouteGroup[]
 // Mid_TbmRouteGroup_TbmProduct  Mid_TbmRouteGroup_TbmProduct?

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

// model TbmProduct {
//  id                           Int                            @id @default(autoincrement())
//  createdAt                    DateTime                       @default(now())
//  updatedAt                    DateTime?                      @default(now()) @updatedAt()
//  sortOrder                    Float                          @default(0)
//  code                         String                         @unique
//  name                         String                         @unique
//  Mid_TbmRouteGroup_TbmProduct Mid_TbmRouteGroup_TbmProduct[]
//  TbmBase                      TbmBase                        @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
//  tbmBaseId                    Int

//  @@unique([tbmBaseId, name], name: "unique_tbmBaseId_name")
// }

// model Mid_TbmRouteGroup_TbmProduct {
//  id        Int       @id @default(autoincrement())
//  createdAt DateTime  @default(now())
//  updatedAt DateTime? @default(now()) @updatedAt()
//  sortOrder Float     @default(0)

// TbmRouteGroup   TbmRouteGroup @relation(fields: [tbmRouteGroupId], references: [id], onDelete: Cascade)
//  tbmRouteGroupId Int           @unique

//  TbmProduct   TbmProduct @relation(fields: [tbmProductId], references: [id], onDelete: Cascade)
//  tbmProductId Int

//  @@unique([tbmRouteGroupId, tbmProductId], name: "unique_tbmRouteGroupId_tbmProductId")
// }

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

 TbmBase   TbmBase? @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
 tbmBaseId Int?

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
 approved  Boolean? @default(false)

 TbmBase   TbmBase @relation(fields: [tbmBaseId], references: [id], onDelete: Cascade)
 tbmBaseId Int

 TbmEtcMeisai TbmEtcMeisai?

 TbmDriveScheduleImage TbmDriveScheduleImage[]
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

 // 時間データ（分単位で保存）
 vehicleNumber    String?
 startTime        String?
 endTime          String?
 kyukeiMins       String?
 shinyaKyukeiMins String?
 kyusokuMins      String?

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

# 统一用户认证、角色协作与双地域商业化系统技术设计规范 (v1.0)

本技术设计规范（Technical Design Specification）作为 [统一用户认证、角色协作与双地域商业化系统 PRD](../prd/PRD-unified-user-auth-collaboration-monetization.md) 的底层实现载体。本规范详细规定了数据库物理 Schema 模型、具体接口与服务代码签名、文件组件物理路径及安全性加固实现细节。

---

## 1. 数据库物理 Schema 模型 (Prisma Models)

根据 Better Auth 认证规范、多角色三方看板协作和高防刷商业计费要求，系统物理模型设计采用以下 11 个核心表定义：

```prisma
// ==========================================
// 1. User - 核心用户资料、role、userType、region、subscription
// ==========================================
model User {
  id                    String                @id @default(uuid())
  email                 String?               @unique // 手机 OTP / 微信注册首期可能无邮箱，设为可选
  phoneNumber           String?               @unique 
  passwordHash          String?               // OTP 与 OAuth 登录密码 Hash 可空
  name                  String?
  
  // 角色与类型模型 (使用强类型 Enum 映射)
  role                  UserRole              @default(FREE) 
  userType              UserType              @default(STUDENT)
  region                Region                @default(INTL)
  
  // 微信授权映射 (国内本地化)
  wechatOpenId          String?               @unique 
  wechatUnionId         String?               @unique 
  
  // 推荐关系自关联 (1:N 递归)
  referredById          String?
  referredBy            User?                 @relation("UserReferrals", fields: [referredById], references: [id], onDelete: SetNull)
  referrals             User[]                @relation("UserReferrals")
  referralCode          String                @unique 
  
  // 商业订阅状态
  subscriptionStatus    SubscriptionStatus    @default(none) 
  subscriptionEndsAt    DateTime?
  
  // 认证生命周期辅助
  emailVerified         Boolean               @default(false)
  emailVerifiedAt       DateTime?
  lastLoginAt           DateTime?
  disabled              Boolean               @default(false)     // 账号封禁
  
  // Better Auth 物理关联
  sessions              Session[]
  accounts              Account[]
  
  // 团队协作与内容关联
  ownedBoards           BoardCollaboration[]  @relation("BoardCreator")
  boardMemberships      BoardMember[]
  boardComments         BoardComment[]
  performedAudits       AdminAuditLog[]       @relation("AdminActions")
  rewardsReceived       ReferralReward[]      @relation("RewardRecipient")
  rewardsGiven          ReferralReward[]      @relation("RewardReferrer")
  subscriptionEvents    SubscriptionEvent[]
  
  createdAt             DateTime              @default(now())
  updatedAt             DateTime              @updatedAt
}

// ==========================================
// 2. Account - Better Auth / social login account linking (敏感 token 加密存储)
// ==========================================
model Account {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  providerId   String   // e.g. 'google', 'apple', 'wechat'
  accountId    String   // 三方平台唯一 ID
  accessToken  String?  // 必须使用 AES-256-GCM 加密存储，不记入日志
  refreshToken String?  // 必须使用 AES-256-GCM 加密存储，不记入日志
  expiresAt    DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([providerId, accountId])
}

// ==========================================
// 3. Session - Better Auth session 存储 (哈希化存储)
// ==========================================
model Session {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash    String   @unique // 不直接明文存 Token。Cookie 存明文，DB 存 Hash 校验
  expiresAt    DateTime
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// ==========================================
// 4. VerificationToken - 邮箱验证、密码重置验证 Token
// ==========================================
model VerificationToken {
  id         String   @id @default(uuid())
  identifier String   // e.g., email address
  token      String   @unique
  expiresAt  DateTime
  createdAt  DateTime @default(now())
}

// ==========================================
// 5. OtpChallenge - 手机验证码挑战记录（验证码哈希化）
// ==========================================
model OtpChallenge {
  id          String   @id @default(uuid())
  phoneNumber String
  codeHash    String   // 绝不可明文落库，采用强哈希 bcrypt 加密
  purpose     String   // 'REGISTER' | 'LOGIN' | 'BIND'
  attemptCount Int     @default(0) // 校验失败计数，超过 5 次锁定废弃
  verified    Boolean  @default(false)
  consumedAt  DateTime? // 成功使用时间（单次有效，不可复用）
  ipAddress   String?
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  @@index([phoneNumber, purpose, createdAt])
}

// ==========================================
// 6. BoardCollaboration - 顾问-多成员项目协同看板
// ==========================================
model BoardCollaboration {
  id           String        @id @default(uuid())
  boardName    String
  creatorId    String
  creator      User          @relation("BoardCreator", fields: [creatorId], references: [id])
  members      BoardMember[]
  boardItems   BoardItem[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

// ==========================================
// 7. BoardMember - 看板成员授权关系表
// ==========================================
model BoardMember {
  id          String            @id @default(uuid())
  boardId     String
  board       BoardCollaboration @relation(fields: [boardId], references: [id], onDelete: Cascade)
  userId      String
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  roleInBoard BoardMemberRole 
  status      BoardMemberStatus @default(INVITED)
  createdAt   DateTime          @default(now())

  @@unique([boardId, userId])
  @@index([userId, status])
}

// ==========================================
// 8. BoardItem - 看板中的大学 / 专业收藏
// ==========================================
model BoardItem {
  id            String             @id @default(uuid())
  boardId       String
  board         BoardCollaboration @relation(fields: [boardId], references: [id], onDelete: Cascade)
  itemType      BoardItemType 
  itemId        String             // scorecardUnitId 或标准 Major ID
  itemName      String             
  comments      BoardComment[]
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  @@unique([boardId, itemType, itemId])
}

// ==========================================
// 9. BoardComment - 顾问、学生、家长批注
// ==========================================
model BoardComment {
  id          String             @id @default(uuid())
  boardItemId String
  boardItem   BoardItem          @relation(fields: [boardItemId], references: [id], onDelete: Cascade)
  userId      String
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  roleTag     BoardMemberRole    // 发表时的静态身份标记
  comment     String
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
}

// ==========================================
// 10. SubscriptionEvent - 计费 Webhook 幂等记录与原始事件审计
// ==========================================
model SubscriptionEvent {
  id              String                  @id @default(uuid())
  provider        PaymentProvider 
  externalOrderId String?                 // 支付平台的订单号 / 账单 ID，用以进行订单级幂等
  externalEventId String                  @unique // Webhook 传输事件的唯一 ID (防止同一事件重试)
  userId          String
  user            User                    @relation(fields: [userId], references: [id])
  plan            UserRole                // 购买的会员规格 'PRO' | 'COUNSELOR_PRO'
  action          SubscriptionAction 
  status          SubscriptionEventStatus @default(PROCESSED)
  errorMessage    String?
  processedAt     DateTime?
  rawPayload      Json                    // 脱敏后的支付原始数据
  createdAt       DateTime                @default(now())

  @@unique([provider, externalOrderId, action]) // 订单级别联合防刷幂等
}

// ==========================================
// 11. AdminAuditLog - 管理员/系统敏感操作审计日志 (解决外键 SYSTEM 冲突)
// ==========================================
model AdminAuditLog {
  id        String      @id @default(uuid())
  actorType ActorType   @default(ADMIN) // 区分 SYSTEM (自动执行) 与 ADMIN (人工操作)
  adminId   String?     // 人工干预时为必填外键，SYSTEM 级事件设为 null
  admin     User?       @relation("AdminActions", fields: [adminId], references: [id], onDelete: Restrict)
  action    String      // 操作标识
  target    String      // 目标表模型
  targetId  String      
  changes   Json        // { before: {...}, after: {...} }
  ipAddress String?
  userAgent String?
  requestId String?     // 关联 HTTP 请求链追踪 ID
  createdAt DateTime    @default(now())

  @@index([actorType, createdAt])
  @@index([target, targetId])
}

// ==========================================
// 12. ReferralReward - 推荐关系与奖励跟踪表（防止多重套利）
// ==========================================
model ReferralReward {
  id          String   @id @default(uuid())
  referrerId  String   
  referrer    User     @relation("RewardReferrer", fields: [referrerId], references: [id], onDelete: Cascade)
  recipientId String   
  recipient   User     @relation("RewardRecipient", fields: [recipientId], references: [id], onDelete: Cascade)
  daysAwarded Int      @default(7)
  status      String   @default("GRANTED") // 'GRANTED' | 'REVOKED'
  createdAt   DateTime @default(now())

  @@unique([referrerId, recipientId]) // 严格限制生命周期内每对用户只能获取一次奖励
}
```

### 1.1 业务 Invariant Constraints (业务不变性约束)
Prisma 本身无法表达跨字段非空校验，因此系统必须在后端 `Service` / `Controller` 物理入库前，对 `User` 执行以下强约束校验：
```typescript
function assertUserIdentityInvariant(user: Partial<User>) {
  const hasIdentity = !!(
    user.email || 
    user.phoneNumber || 
    user.wechatUnionId || 
    (user.accounts && user.accounts.length > 0)
  );
  if (!hasIdentity) {
    throw new Error("USER_IDENTITY_INVARIANT_VIOLATION: User must have at least one valid identity identifier.");
  }
}
```

---

## 2. 统一计费服务接口与事务逻辑 (SubscriptionService)

为了确保商业订阅状态在并发网络事件中的强一致性，Stripe Webhook `/api/payment/stripe` 与国内微信/支付宝 Webhook `/api/payment/domestic` 支付成功后均不得直接散落修改 `User` 表，必须提取参数并经由统一服务 **`SubscriptionService`** 进行底层更新。

### 2.1 服务接口 TypeScript 签名
```typescript
interface ActivateSubscriptionParams {
  userId: string;
  provider: PaymentProvider;
  externalEventId: string;   // Webhook 传输事件的唯一 ID (防止 Webhook 事件重试)
  externalOrderId: string;   // 计费账单 / 订单 ID (实现订单级幂等)
  plan: UserRole;            // 购买的会员规格 'PRO' | 'COUNSELOR_PRO'
  endsAt: Date;
  rawPayload: any;
}

class SubscriptionService {
  /**
   * 激活或更新用户的商业订阅权益，运行在统一的底层 DB 事务中
   */
  static async activate(params: ActivateSubscriptionParams): Promise<boolean> {
    // 具体实现流程见下文
  }
}
```

### 2.2 统一服务执行流程 (6 步事务)
`SubscriptionService.activate` 被调用后，将在一个独立的数据库事务内依次执行以下操作：
1.  **事件及订单级幂等校验**：以 `[provider, externalOrderId, action: 'ACTIVATE']` 作为联合唯一约束查询 `SubscriptionEvent`。如记录已存在，则 Early Return 忽略，防止网络重试导致天数重复累加。
2.  **累加并更新 User 订阅到期时间**：根据支付渠道和计费周期计算新截止时间：
    *   若是 Stripe 周期性计费：`newEndsAt = params.endsAt`（以 Stripe reported 为准）。
    *   若是国内扫码买固定天数（如 30 天）：`newEndsAt = max(existingEndsAt, now) + purchasedDays`。
3.  **更新 User 订阅状态**：将 `User.subscriptionStatus` 置为 `active`。
4.  **必要时提升用户角色 (Role Escalation)**：根据 `plan` 参数安全升级 `User.role`（例如购买 PRO 则提升 role 为 `PRO`，购买 COUNSELOR_PRO 提升为 `COUNSELOR_PRO`）。ADMIN 角色的角色权重不会受订阅过期或提升而降低。
5.  **写入 SubscriptionEvent 幂等日志**：存储详细的支付平台、订单 ID、关联用户、操作类型，将 `status` 标为 `PROCESSED` 并存储脱敏后的 Raw JSON。
6.  **写入不可篡改审计**：在 `AdminAuditLog` 写入一条审计记录，`actorType` 标为 `SYSTEM`，`adminId` 设为 `null`，并记录 `changes` 前后 JSON Diffs，保证资产变更有据可循。

---

## 3. 前后端物理文件路径与布局映射

本节规定了双地域门户及认证相关的物理文件及前端渲染路径：

### 3.1 物理文件路径列表
*   **前端登录/注册路由页面**：
    *   `/src/pages/LoginPage.tsx`：登录逻辑入口。加载智能地域识别，分别渲染 CN 视图（微信/手机号 OTP，邮箱密码折叠）与 INTL 视图（社交一键登录，邮箱密码主打）。
    *   `/src/pages/RegisterPage.tsx`：用户账号注册页面。
    *   `/src/pages/VerifyEmailPage.tsx`：邮箱验证码与账户激活承接页面。
*   **后端 BFF 与计费接口层**：
    *   `/server/server.ts`：Express BFF 主服务，挂载 Better Auth 中间件和核心拦截器。
    *   `/server/email.ts`：负责向用户分发邮箱激活 Token 与重置密码一次性链接的服务包。
    *   `/server/routes/payment.ts`：收单 Webhook 接口入口，解耦验证后统一路由至 `SubscriptionService`。

---

## 4. 安全合规机制与加密存储实现 (AES-256-GCM & bcrypt)

本节具体规定了 PRD 中“Auth Security Rules”的安全加固物理算法及策略：

### 4.1 会话令牌哈希 (Session Token Hashing)
Cookie 中下发给用户的 Session Token 格式为明文 UUIDv4（例如 `raw_session_token`）。
后端在校验时，通过下述哈希查询算法查询数据库：
```typescript
import { createHash } from "crypto";

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

// 查询示例：
// const session = await prisma.session.findUnique({ where: { tokenHash: hashToken(rawTokenFromCookie) } })
```

### 4.2 三方社交令牌加密存储 (Account Token Encryption)
`Account` 表中的 `accessToken` 与 `refreshToken` 在入库前必须使用 `AES-256-GCM` 进行对称加密。

```typescript
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32-byte key

export function encrypt(text: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "hex"), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  
  // 拼接 IV、密文与 Auth Tag 存储
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, encrypted, authTagHex] = encryptedText.split(":");
  const decipher = createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
```

### 4.3 手机验证码（OTP）哈希与挑战审计 (OtpChallenge)
*   **Redis 短 TTL 存储**：手机号请求短信验证码时，系统在 Redis 中存储一份明文 `code`，设置 5 分钟（300s）TTL，并限制同一 IP/设备 60s 内只能触发一次。
*   **DB 审计回溯**：在 `OtpChallenge` 表中创建挑战记录时，`code` 必须经过 `bcrypt` 哈希后存入 `codeHash`，且记录当前的 `purpose` 和限制的校验失败 `attemptCount`。
*   **校验与消耗逻辑**：
    *   首先比对 Redis 中是否存在该手机号的 OTP。若存在则校验，失败累加 DB 中的 `attemptCount`。若累计失败 5 次，锁定该 OTP（删除 Redis 中的 OTP 并将 DB 状态标为作废）。
    *   校验成功后，立即删除 Redis 中的 OTP，并更新 DB 中 `OtpChallenge` 的 `consumedAt = DateTime.now()`，确保凭证单次有效，不可复用。
